import { afterEach, describe, expect, it, vi } from "vitest";

import { renderHook } from "@/test/utils";

import { useAutoBlur } from "./useAutoBlur";

// touchmove 발생 시뮬레이션 (핸들러는 이벤트 객체를 읽지 않음)
function fireTouchMove() {
  window.dispatchEvent(new Event("touchmove"));
}

function mountInput(type = "text"): HTMLInputElement {
  const el = document.createElement("input");
  el.type = type;
  document.body.appendChild(el);
  return el;
}

describe("useAutoBlur", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("B1: 포커스된 text input은 touchmove 시 blur된다", () => {
    const input = mountInput();
    renderHook(() => useAutoBlur());
    input.focus();
    expect(document.activeElement).toBe(input);

    fireTouchMove();
    expect(document.activeElement).not.toBe(input);
  });

  it("B2: 포커스된 textarea도 blur된다", () => {
    const ta = document.createElement("textarea");
    document.body.appendChild(ta);
    renderHook(() => useAutoBlur());
    ta.focus();
    expect(document.activeElement).toBe(ta);

    fireTouchMove();
    expect(document.activeElement).not.toBe(ta);
  });

  it("B3: 키보드를 띄우지 않는 input(checkbox)은 blur되지 않는다", () => {
    const cb = mountInput("checkbox");
    renderHook(() => useAutoBlur());
    cb.focus();
    expect(document.activeElement).toBe(cb);

    fireTouchMove();
    expect(document.activeElement).toBe(cb); // 유지
  });

  it("B4: 포커스된 입력이 없으면 아무 일도 안 하고 에러도 없다", () => {
    renderHook(() => useAutoBlur());
    expect(() => fireTouchMove()).not.toThrow();
  });

  it("B5: containerRef 지정 시 컨테이너 내부 입력은 blur된다", () => {
    const container = document.createElement("div");
    const inside = document.createElement("input");
    container.appendChild(inside);
    document.body.appendChild(container);
    const ref = { current: container } as React.RefObject<HTMLElement>;

    renderHook(() => useAutoBlur({ containerRef: ref }));
    inside.focus();
    fireTouchMove();
    expect(document.activeElement).not.toBe(inside);
  });

  it("B6: containerRef 지정 시 컨테이너 밖 입력은 blur되지 않는다", () => {
    const container = document.createElement("div");
    const outside = document.createElement("input");
    container.appendChild(document.createElement("input"));
    document.body.append(container, outside);
    const ref = { current: container } as React.RefObject<HTMLElement>;

    renderHook(() => useAutoBlur({ containerRef: ref }));
    outside.focus();
    fireTouchMove();
    expect(document.activeElement).toBe(outside); // 밖이라 유지
  });

  it("B7: enabled=false면 리스너를 붙이지 않고 blur도 안 한다", () => {
    const input = mountInput();
    renderHook(() => useAutoBlur({ enabled: false }));
    input.focus();
    fireTouchMove();
    expect(document.activeElement).toBe(input); // 유지
  });

  it("B8: unmount 시 touchmove 리스너가 제거된다", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");

    const { unmount } = renderHook(() => useAutoBlur());
    expect(addSpy.mock.calls.some((c) => c[0] === "touchmove")).toBe(true);

    unmount();
    expect(removeSpy.mock.calls.some((c) => c[0] === "touchmove")).toBe(true);

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });

  it("B9: contenteditable 요소도 blur된다", (ctx) => {
    const div = document.createElement("div");
    div.setAttribute("contenteditable", "true");
    // happy-dom의 isContentEditable 미지원 대비 — 속성을 강제해 판정 분기를 실제로 태운다
    if (!div.isContentEditable) {
      Object.defineProperty(div, "isContentEditable", {
        value: true,
        configurable: true,
      });
    }
    document.body.appendChild(div);
    renderHook(() => useAutoBlur());
    div.focus();

    // 이 환경이 contenteditable 포커스를 지원하지 않으면 정직하게 skip 처리
    // (실브라우저 Chromium에서는 이 경로가 통과함을 별도 검증)
    if (document.activeElement !== div) {
      ctx.skip();
      return;
    }
    fireTouchMove();
    expect(document.activeElement).not.toBe(div);
  });

  it("B10: passive 옵션으로 등록된다 (스크롤 차단 없음)", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    renderHook(() => useAutoBlur());
    const call = addSpy.mock.calls.find((c) => c[0] === "touchmove");
    expect(call?.[2]).toMatchObject({ passive: true });
    addSpy.mockRestore();
  });

  it("B11: enabled를 true→false로 바꾸면 리스너가 제거되고 blur도 멈춘다", () => {
    const input = mountInput();
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useAutoBlur({ enabled }),
      { initialProps: { enabled: true } }
    );
    input.focus();
    rerender({ enabled: false }); // 활성 → 비활성 전환 → 리스너 해제
    fireTouchMove();
    expect(document.activeElement).toBe(input); // 유지
  });

  it("B12: containerRef.current가 null이면 blur하지 않고 에러도 없다", () => {
    const input = mountInput();
    const nullRef = { current: null } as React.RefObject<HTMLElement | null>;
    renderHook(() => useAutoBlur({ containerRef: nullRef }));
    input.focus();
    expect(() => fireTouchMove()).not.toThrow();
    expect(document.activeElement).toBe(input); // 범위 못 정해 유지
  });
});
