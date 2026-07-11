import type { MockInstance } from "vitest";
import { vi } from "vitest";

/**
 * 결정적(deterministic) 히스토리 목 — useHistoryClose 계열 테스트용.
 *
 * happy-dom의 실제 동작(back()이 state를 먼저 갱신한 뒤 popstate를 "동기"로 발화)을
 * 그대로 흉내 내되, entries/index를 테스트에서 직접 관찰할 수 있게 한다.
 *
 * - `window.history.pushState` / `window.history.back`을 spyOn + mockImplementation으로 대체
 *   → backSpy 호출 수 = "훅(또는 테스트가 명시적으로 window.history.back()을 부른) 횟수".
 * - 사용자 뒤로가기 제스처는 `userBack()`으로 시뮬레이션 — 스파이 카운트에 잡히지 않으므로
 *   "훅이 back()을 추가로 호출하지 않았다" 같은 단언이 산술 없이 깔끔해진다.
 * - `window.history.state`는 own accessor로 섀도잉(happy-dom은 프로토타입 getter라 합법).
 */

interface FakeEntry {
  state: unknown;
}

export interface FakeHistory {
  /** window.history.pushState 스파이 (훅/테스트의 명시적 호출만 카운트) */
  pushStateSpy: MockInstance;
  /** window.history.back 스파이 (훅/테스트의 명시적 호출만 카운트) */
  backSpy: MockInstance;
  /** 사용자 뒤로가기 제스처 시뮬레이션 — 스파이 카운트 없이 pop + 동기 popstate */
  userBack(): void;
  /** 현재 history.state (getter와 동일 값) */
  state(): unknown;
  /** 현재 인덱스 (0 = 최초 페이지) */
  index(): number;
  /** 전체 엔트리 수 (고스트 검증용) */
  length(): number;
  /** 스파이/state 섀도잉 원복 */
  restore(): void;
}

export function installFakeHistory(): FakeHistory {
  const entries: FakeEntry[] = [{ state: null }];
  let index = 0;

  // happy-dom과 동일: index를 먼저 옮긴 뒤(=history.state 갱신) popstate를 동기 발화.
  const doBack = () => {
    if (index > 0) index -= 1;
    window.dispatchEvent(
      new PopStateEvent("popstate", { state: entries[index].state })
    );
  };

  const pushStateSpy = vi
    .spyOn(window.history, "pushState")
    .mockImplementation((data: unknown) => {
      // 실제 브라우저처럼 forward entries는 잘려나간다.
      entries.splice(index + 1);
      entries.push({ state: data });
      index += 1;
    });

  const backSpy = vi.spyOn(window.history, "back").mockImplementation(() => {
    doBack();
  });

  Object.defineProperty(window.history, "state", {
    configurable: true,
    get: () => entries[index].state,
  });

  return {
    pushStateSpy,
    backSpy,
    userBack: doBack,
    state: () => entries[index].state,
    index: () => index,
    length: () => entries.length,
    restore: () => {
      pushStateSpy.mockRestore();
      backSpy.mockRestore();
      // own accessor 제거 → happy-dom 프로토타입 getter로 복귀
      delete (window.history as { state?: unknown }).state;
    },
  };
}
