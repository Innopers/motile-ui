import { StrictMode } from "react";

import { describe, expect, it, vi } from "vitest";

import { render } from "@/test/utils";

import { useEscapeKey } from "./useEscapeKey";

/**
 * useEscapeKey 훅 단위 테스트.
 *
 * [특성화(E1~E3)] 기존 v1.3.1 동작 고정 — 기본(unstacked) 경로는 바이트 동일해야 한다.
 * 특히 E3(언스택 다중 인스턴스 전부 발화)은 기존 소비자 동작의 잠금 테스트.
 * [stacked(E4~E9)] 옵트인 스택 모드 — 동시에 활성화된 stacked 인스턴스 중
 * 최상단(마지막 등록)만 ESC를 처리한다.
 */

interface EscHostProps {
  handler: (event: KeyboardEvent) => void;
  enabled?: boolean;
  stacked?: boolean;
}

function EscHost({ handler, enabled = true, stacked = false }: EscHostProps) {
  useEscapeKey({ handler, enabled, stacked });
  return null;
}

function pressEscape() {
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Escape", bubbles: true })
  );
}

function pressEnter() {
  document.dispatchEvent(
    new KeyboardEvent("keydown", { key: "Enter", bubbles: true })
  );
}

describe("useEscapeKey", () => {
  describe("특성화 — 기본(unstacked) 경로 (v1.3.1 계약 고정)", () => {
    it("E1: Escape에만 handler가 호출된다", () => {
      const handler = vi.fn();
      render(<EscHost handler={handler} />);

      pressEnter();
      expect(handler).toHaveBeenCalledTimes(0);

      pressEscape();
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it("E2: enabled=false면 무반응, unmount 시 리스너가 제거된다", () => {
      const handler = vi.fn();
      const removeSpy = vi.spyOn(document, "removeEventListener");

      const view = render(<EscHost handler={handler} enabled={false} />);
      pressEscape();
      expect(handler).toHaveBeenCalledTimes(0);

      view.rerender(<EscHost handler={handler} enabled={true} />);
      pressEscape();
      expect(handler).toHaveBeenCalledTimes(1);

      view.unmount();
      pressEscape();
      expect(handler).toHaveBeenCalledTimes(1);

      const keydownRemoves = removeSpy.mock.calls.filter(
        (c) => c[0] === "keydown"
      ).length;
      expect(keydownRemoves).toBeGreaterThan(0);
      removeSpy.mockRestore();
    });

    it("E3: 언스택 인스턴스 2개는 ESC 1회에 둘 다 발화한다 (기존 동작 잠금)", () => {
      const a = vi.fn();
      const b = vi.fn();
      render(
        <>
          <EscHost handler={a} />
          <EscHost handler={b} />
        </>
      );

      pressEscape();
      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
    });
  });

  describe("stacked — 옵트인 스택 모드", () => {
    it("E4: stacked 2개 중 마지막 등록(최상단)만 발화한다", () => {
      const a = vi.fn();
      const b = vi.fn();
      render(
        <>
          <EscHost handler={a} stacked />
          <EscHost handler={b} stacked />
        </>
      );

      pressEscape();
      expect(b).toHaveBeenCalledTimes(1);
      expect(a).toHaveBeenCalledTimes(0);
    });

    it("E5: 최상단이 내려가면 다음 인스턴스가 발화한다", () => {
      const a = vi.fn();
      const b = vi.fn();

      function Pair({ bEnabled }: { bEnabled: boolean }) {
        return (
          <>
            <EscHost handler={a} stacked />
            <EscHost handler={b} stacked enabled={bEnabled} />
          </>
        );
      }

      const view = render(<Pair bEnabled={true} />);
      pressEscape();
      expect(b).toHaveBeenCalledTimes(1);
      expect(a).toHaveBeenCalledTimes(0);

      view.rerender(<Pair bEnabled={false} />);
      pressEscape();
      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(1);
    });

    it("E6: 핸들러 재생성(리렌더)이 스택 순서를 바꾸지 못한다", () => {
      const aCalls = vi.fn();
      const b = vi.fn();

      function Wrap({ tick }: { tick: number }) {
        return (
          <>
            {/* 매 렌더 새 클로저 — 인라인 핸들러 재생성 시뮬레이션 */}
            <EscHost handler={() => aCalls(tick)} stacked />
            <EscHost handler={b} stacked />
          </>
        );
      }

      const view = render(<Wrap tick={0} />);
      view.rerender(<Wrap tick={1} />); // a의 handler effect만 재실행

      pressEscape();
      expect(b).toHaveBeenCalledTimes(1);
      expect(aCalls).toHaveBeenCalledTimes(0); // 여전히 b가 최상단
    });

    it("E7: unstacked와 stacked 혼재 시 unstacked는 항상 발화한다", () => {
      const legacy = vi.fn();
      const stackedTop = vi.fn();
      render(
        <>
          <EscHost handler={legacy} />
          <EscHost handler={stackedTop} stacked />
        </>
      );

      pressEscape();
      expect(legacy).toHaveBeenCalledTimes(1); // 기존 소비자 영향 없음
      expect(stackedTop).toHaveBeenCalledTimes(1);
    });

    it("E8: stacked라도 enabled=false면 top 슬롯을 차지하지 않는다", () => {
      const a = vi.fn();
      const b = vi.fn();
      render(
        <>
          <EscHost handler={a} stacked />
          <EscHost handler={b} stacked enabled={false} />
        </>
      );

      pressEscape();
      expect(a).toHaveBeenCalledTimes(1);
      expect(b).toHaveBeenCalledTimes(0);
    });

    it("E9: StrictMode에서 stacked 인스턴스는 1회만 발화한다", () => {
      const handler = vi.fn();
      render(
        <StrictMode>
          <EscHost handler={handler} stacked />
        </StrictMode>
      );

      pressEscape();
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });
});
