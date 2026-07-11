import { StrictMode } from "react";

import { beforeEach, describe, expect, it } from "vitest";

import { render } from "@/test/utils";

import { useScrollLock } from "./useScrollLock";

/**
 * useScrollLock 훅 단위 테스트.
 *
 * [특성화] 단일 인스턴스의 기존(v1.3.1) 동작 고정: 스타일 잠금/원복, 허용 셀렉터.
 * [중첩] ref-count — 여러 오버레이가 겹칠 때 마지막 해제에서만 원복되고,
 *        비-LIFO 해제(아래 시트가 먼저 해제)에도 잠금이 유지되어야 한다.
 */

interface LockHostProps {
  enabled?: boolean;
  allowedSelectors?: string[];
}

function LockHost({ enabled = true, allowedSelectors }: LockHostProps) {
  useScrollLock(allowedSelectors ? { enabled, allowedSelectors } : { enabled });
  return null;
}

function Pair({ a, b }: { a: boolean; b: boolean }) {
  return (
    <>
      {a ? <LockHost /> : null}
      {b ? <LockHost /> : null}
    </>
  );
}

function bodyStyle() {
  return document.body.style;
}
function htmlStyle() {
  return document.documentElement.style;
}

describe("useScrollLock", () => {
  beforeEach(() => {
    // 테스트 간 스타일 누수 방지 — 인라인 스타일 초기화
    document.body.removeAttribute("style");
    document.documentElement.removeAttribute("style");
  });

  describe("특성화 — 단일 인스턴스 (v1.3.1 계약 고정)", () => {
    it("S1: 잠금 시 스타일 적용, 해제 시 원본 스타일 그대로 복원", () => {
      bodyStyle().overflow = "auto";
      bodyStyle().paddingRight = "7px";
      htmlStyle().overflow = "scroll";

      const view = render(<LockHost />);

      expect(bodyStyle().overflow).toBe("hidden");
      expect(htmlStyle().overflow).toBe("hidden");
      expect(bodyStyle().height).toBe("100%");
      expect(bodyStyle().touchAction).toBe("none");
      expect(htmlStyle().touchAction).toBe("none");
      expect(bodyStyle().overscrollBehavior).toBe("none");
      expect(htmlStyle().overscrollBehavior).toBe("none");

      view.unmount();

      expect(bodyStyle().overflow).toBe("auto");
      expect(bodyStyle().paddingRight).toBe("7px");
      expect(htmlStyle().overflow).toBe("scroll");
      expect(bodyStyle().height).toBe("");
      expect(bodyStyle().touchAction).toBe("");
      expect(htmlStyle().touchAction).toBe("");
      expect(bodyStyle().overscrollBehavior).toBe("");
      expect(htmlStyle().overscrollBehavior).toBe("");
    });

    it("S2: 스크롤바 보정 paddingRight는 잠금 중에만 적용되고 해제 시 원복된다", () => {
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      const view = render(<LockHost />);
      if (scrollbarWidth > 0) {
        expect(bodyStyle().paddingRight).toBe(`${scrollbarWidth}px`);
      } else {
        expect(bodyStyle().paddingRight).toBe("");
      }
      view.unmount();
      expect(bodyStyle().paddingRight).toBe("");
    });

    it("S5: 잠금 세션 사이에 앱이 바꾼 스타일은 다음 세션의 원본으로 캡처된다", () => {
      const first = render(<LockHost />);
      first.unmount();

      bodyStyle().overflow = "scroll"; // 앱이 세션 사이에 변경

      const second = render(<LockHost />);
      expect(bodyStyle().overflow).toBe("hidden");
      second.unmount();
      expect(bodyStyle().overflow).toBe("scroll");
    });

    it("S6: 리렌더 churn(인라인 allowedSelectors)에도 잠금 유지·최종 해제 시 1회 복원", () => {
      bodyStyle().overflow = "auto";

      function ChurnHost({ tick }: { tick: number }) {
        void tick;
        // 매 렌더 새 배열 (Sheet.tsx와 동일 패턴)
        useScrollLock({ enabled: true, allowedSelectors: [".x"] });
        return null;
      }

      const view = render(<ChurnHost tick={0} />);
      for (let i = 1; i <= 5; i += 1) {
        view.rerender(<ChurnHost tick={i} />);
        expect(bodyStyle().overflow).toBe("hidden");
      }
      view.unmount();
      expect(bodyStyle().overflow).toBe("auto");
    });

    it("S7: StrictMode에서도 스타일 드리프트 없이 원복된다", () => {
      bodyStyle().overflow = "auto";

      const view = render(
        <StrictMode>
          <LockHost />
        </StrictMode>
      );
      expect(bodyStyle().overflow).toBe("hidden");

      view.unmount();
      expect(bodyStyle().overflow).toBe("auto");
    });

    it("S8: 허용 셀렉터 밖 wheel은 차단, 안은 허용 (중첩 상태에서도)", () => {
      const allowed = document.createElement("div");
      allowed.className = "allowed-area";
      const inner = document.createElement("div");
      allowed.appendChild(inner);
      const outside = document.createElement("div");
      document.body.appendChild(allowed);
      document.body.appendChild(outside);

      const view = render(
        <>
          <LockHost allowedSelectors={[".allowed-area"]} />
          <LockHost allowedSelectors={[".allowed-area"]} />
        </>
      );

      const blockedEvent = new Event("wheel", {
        bubbles: true,
        cancelable: true,
      });
      outside.dispatchEvent(blockedEvent);
      expect(blockedEvent.defaultPrevented).toBe(true);

      const allowedEvent = new Event("wheel", {
        bubbles: true,
        cancelable: true,
      });
      inner.dispatchEvent(allowedEvent);
      expect(allowedEvent.defaultPrevented).toBe(false);

      view.unmount();
      allowed.remove();
      outside.remove();
    });
  });

  describe("중첩 — ref-count", () => {
    it("S3: LIFO 해제 — 위(편집)만 해제되면 잠금 유지, 마지막 해제에서 복원", () => {
      bodyStyle().overflow = "auto";

      const view = render(<Pair a={true} b={true} />);
      expect(bodyStyle().overflow).toBe("hidden");

      view.rerender(<Pair a={true} b={false} />); // 위(b) 해제
      expect(bodyStyle().overflow).toBe("hidden");

      view.rerender(<Pair a={false} b={false} />); // 마지막(a) 해제
      expect(bodyStyle().overflow).toBe("auto");
    });

    it("S4: 비-LIFO 해제 — 아래(base)가 먼저 해제돼도 잠금 유지, 원본 오염 없음", () => {
      bodyStyle().overflow = "auto";

      const view = render(<Pair a={true} b={true} />);
      expect(bodyStyle().overflow).toBe("hidden");

      view.rerender(<Pair a={false} b={true} />); // 아래(a) 먼저 해제
      // 핵심: b가 아직 잠금 중 → hidden 유지 (현재 코드는 여기서 auto로 풀려버림)
      expect(bodyStyle().overflow).toBe("hidden");

      view.rerender(<Pair a={false} b={false} />); // 마지막(b) 해제
      // 핵심: "hidden"(오염된 캡처)이 아니라 진짜 원본 "auto"로 복원
      expect(bodyStyle().overflow).toBe("auto");
    });
  });
});
