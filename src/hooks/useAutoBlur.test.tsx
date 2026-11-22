import { afterEach, describe, expect, it, vi } from "vitest";

import { renderHook } from "@/test/utils";

import { useAutoBlur } from "./useAutoBlur";
import { useScrollLock } from "./useScrollLock";

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

// happy-dom 의 Touch 대신 touches 길이만 붙인 손짓 이벤트 (target 에서 window 까지 전파)
function touch(
  type: "touchstart" | "touchmove",
  target: EventTarget,
  fingers = 1
) {
  const event = new Event(type, { bubbles: true });
  Object.defineProperty(event, "touches", {
    value: Array.from({ length: fingers }),
  });
  target.dispatchEvent(event);
}

function mountContainer() {
  const container = document.createElement("div");
  const input = document.createElement("input");
  const label = document.createElement("span");
  container.append(label, input);
  const outside = document.createElement("div");
  document.body.append(container, outside);
  const ref = { current: container } as React.RefObject<HTMLElement>;
  return { container, input, label, outside, ref };
}

describe("useAutoBlur 손짓 시작 위치", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("B13: 포커스된 칸 안에서 시작한 끌기는 blur하지 않는다", () => {
    const { input, ref } = mountContainer();
    renderHook(() => useAutoBlur({ containerRef: ref }));
    input.focus();

    touch("touchstart", input);
    touch("touchmove", input);
    expect(document.activeElement).toBe(input);
  });

  it("B14: container 안이라도 칸 밖에서 시작한 끌기는 blur한다", () => {
    const { input, label, ref } = mountContainer();
    renderHook(() => useAutoBlur({ containerRef: ref }));
    input.focus();

    touch("touchstart", label); // Sheet 본문 스크롤처럼 container 안 다른 요소
    touch("touchmove", label);
    expect(document.activeElement).not.toBe(input);
  });

  it("B15: 두 손가락 손짓은 손가락이 하나 남아도 blur하지 않는다", () => {
    const { input, outside, ref } = mountContainer();
    renderHook(() => useAutoBlur({ containerRef: ref }));
    input.focus();

    touch("touchstart", outside, 2);
    touch("touchmove", outside, 2);
    expect(document.activeElement).toBe(input);

    touch("touchmove", outside, 1); // 핀치 뒤 한 손가락만 남아 계속 끎
    expect(document.activeElement).toBe(input);
  });

  it("B16: containerRef가 없어도 칸 안은 유지, 밖은 blur한다", () => {
    const input = mountInput();
    const other = document.createElement("div");
    document.body.appendChild(other);
    renderHook(() => useAutoBlur());
    input.focus();

    touch("touchstart", input);
    touch("touchmove", input);
    expect(document.activeElement).toBe(input);

    touch("touchstart", other);
    touch("touchmove", other);
    expect(document.activeElement).not.toBe(input);
  });

  it("B17: touchstart 전파를 막는 요소에서 시작해도 새 손짓으로 판정한다", () => {
    const { input, outside, ref } = mountContainer();
    outside.addEventListener("touchstart", (e) => e.stopPropagation());
    renderHook(() => useAutoBlur({ containerRef: ref }));
    input.focus();

    touch("touchstart", input, 2); // 직전 손짓은 두 손가락
    touch("touchmove", input, 2);
    touch("touchstart", outside);
    touch("touchmove", outside);
    expect(document.activeElement).not.toBe(input);
  });

  it("B19: 스크롤 잠금(Sheet · Modal)이 touchmove 전파를 막아도 칸 밖 끌기는 blur한다", () => {
    const { input, outside, ref } = mountContainer();
    renderHook(() => useScrollLock());
    renderHook(() => useAutoBlur({ containerRef: ref }));
    input.focus();

    touch("touchstart", outside);
    touch("touchmove", outside);
    expect(document.activeElement).not.toBe(input);
  });

  it("B20: 손짓 도중 포커스된 칸(길게 눌러 선택)도 그 칸 안 끌기는 유지한다", () => {
    const { input, ref } = mountContainer();
    renderHook(() => useAutoBlur({ containerRef: ref }));

    touch("touchstart", input); // 아직 포커스 전
    input.focus(); // 길게 눌러 포커스 · 글자 선택
    touch("touchmove", input);
    expect(document.activeElement).toBe(input);
  });

  it("B18: touchstart · focusin 리스너가 passive로 붙고 unmount 시 제거된다", () => {
    const addSpy = vi.spyOn(window, "addEventListener");
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const docRemoveSpy = vi.spyOn(document, "removeEventListener");

    const { unmount } = renderHook(() => useAutoBlur());
    const added = addSpy.mock.calls.find((c) => c[0] === "touchstart");
    expect(added?.[2]).toMatchObject({ passive: true });

    unmount();
    const removed = removeSpy.mock.calls.find((c) => c[0] === "touchstart");
    expect(removed?.[1]).toBe(added?.[1]);
    expect(removed?.[2]).toMatchObject({ capture: true }); // capture 로 붙인 리스너는 capture 로만 제거됨
    expect(docRemoveSpy.mock.calls.some((c) => c[0] === "focusin")).toBe(true);

    addSpy.mockRestore();
    removeSpy.mockRestore();
    docRemoveSpy.mockRestore();
  });
});

const LAYOUT_HEIGHT = 768;
const KEYBOARD_UP = LAYOUT_HEIGHT - 300;

// visualViewport 흉내 (happy-dom 미지원) + clientHeight 고정 (happy-dom 은 0)
function mockViewport() {
  const viewport = {
    height: LAYOUT_HEIGHT,
    scale: 1,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  };
  Object.defineProperty(window, "visualViewport", {
    value: viewport,
    configurable: true,
  });
  Object.defineProperty(document.documentElement, "clientHeight", {
    value: LAYOUT_HEIGHT,
    configurable: true,
  });
  const resize = (height: number, scale = 1) => {
    viewport.height = height;
    viewport.scale = scale;
    for (const [type, handler] of viewport.addEventListener.mock.calls) {
      if (type === "resize") handler(new Event("resize"));
    }
  };
  return { viewport, resize };
}

describe("useAutoBlur 키보드 닫힘 (안드로이드 뒤로 가기)", () => {
  afterEach(() => {
    document.body.innerHTML = "";
    delete (window as { visualViewport?: unknown }).visualViewport;
    delete (document.documentElement as { clientHeight?: number }).clientHeight;
  });

  it("K1: 키보드가 떴다가 내려가면 blur한다", () => {
    const { resize } = mockViewport();
    const input = mountInput();
    renderHook(() => useAutoBlur());
    input.focus();

    resize(KEYBOARD_UP);
    expect(document.activeElement).toBe(input); // 뜰 때는 유지
    resize(LAYOUT_HEIGHT);
    expect(document.activeElement).not.toBe(input);
  });

  it("K2: 키보드가 한 번도 안 떴으면(하드웨어 키보드) blur하지 않는다", () => {
    const { resize } = mockViewport();
    const input = mountInput();
    renderHook(() => useAutoBlur());
    input.focus();

    resize(LAYOUT_HEIGHT - 20); // 40 미만 변화는 키보드 아님
    resize(LAYOUT_HEIGHT);
    expect(document.activeElement).toBe(input);
  });

  it("K3: innerHeight가 같이 줄어도(iOS 26) clientHeight 기준으로 알아본다", () => {
    const { resize } = mockViewport();
    const original = Object.getOwnPropertyDescriptor(window, "innerHeight");
    Object.defineProperty(window, "innerHeight", {
      value: 385,
      configurable: true,
    });
    try {
      const input = mountInput();
      renderHook(() => useAutoBlur());
      input.focus();

      resize(KEYBOARD_UP);
      resize(LAYOUT_HEIGHT);
      expect(document.activeElement).not.toBe(input);
    } finally {
      if (original) Object.defineProperty(window, "innerHeight", original);
      else delete (window as { innerHeight?: number }).innerHeight;
    }
  });

  it("K4: 다시 포커스하면 기록이 초기화돼 키보드 없이 높이가 바뀌어도 유지된다", () => {
    const { resize } = mockViewport();
    const input = mountInput();
    renderHook(() => useAutoBlur());
    input.focus();
    resize(KEYBOARD_UP);

    input.blur(); // 다른 방법으로 포커스 해제
    resize(LAYOUT_HEIGHT);
    input.focus(); // 이번엔 하드웨어 키보드
    resize(LAYOUT_HEIGHT);
    expect(document.activeElement).toBe(input);
  });

  it("K5: 포커스된 칸이 범위 밖이면 무시한다", () => {
    const { resize } = mockViewport();
    const container = document.createElement("div");
    container.appendChild(document.createElement("input"));
    const outside = mountInput();
    document.body.appendChild(container);
    const ref = { current: container } as React.RefObject<HTMLElement>;
    renderHook(() => useAutoBlur({ containerRef: ref }));
    outside.focus();

    resize(KEYBOARD_UP);
    resize(LAYOUT_HEIGHT);
    expect(document.activeElement).toBe(outside);
  });

  it("K6: enabled=false면 resize 리스너를 안 붙이고, unmount 시 제거한다", () => {
    const { viewport } = mockViewport();
    const { rerender, unmount } = renderHook(
      ({ enabled }: { enabled: boolean }) => useAutoBlur({ enabled }),
      { initialProps: { enabled: false } }
    );
    expect(viewport.addEventListener).not.toHaveBeenCalled();

    rerender({ enabled: true });
    const added = viewport.addEventListener.mock.calls.find(
      (c) => c[0] === "resize"
    );
    expect(added).toBeDefined();

    unmount();
    expect(viewport.removeEventListener).toHaveBeenCalledWith(
      "resize",
      added?.[1]
    );
  });

  it("K7: 확대(scale)로 줄어든 보이는 높이는 키보드로 보지 않는다", () => {
    const { resize } = mockViewport();
    const input = mountInput();
    renderHook(() => useAutoBlur());
    input.focus();

    resize(LAYOUT_HEIGHT / 2, 2); // 2배 확대
    resize(LAYOUT_HEIGHT, 1); // 다시 축소
    expect(document.activeElement).toBe(input);
  });

  it("K8: 키보드가 열린 채 다른 칸으로 옮긴 뒤 닫히면 그 칸을 blur한다", () => {
    const { resize } = mockViewport();
    const first = mountInput();
    const second = mountInput();
    renderHook(() => useAutoBlur());
    first.focus();
    resize(KEYBOARD_UP);

    second.focus(); // 키보드는 그대로
    resize(LAYOUT_HEIGHT);
    expect(document.activeElement).not.toBe(second);
  });

  it("K9: 키보드가 이미 떠 있는 채 켜져도 내려가면 blur한다", () => {
    const { viewport, resize } = mockViewport();
    const input = mountInput();
    const { rerender } = renderHook(
      ({ enabled }: { enabled: boolean }) => useAutoBlur({ enabled }),
      { initialProps: { enabled: false } }
    );
    input.focus();
    viewport.height = KEYBOARD_UP; // 켜지기 전에 키보드가 이미 뜸

    rerender({ enabled: true });
    resize(LAYOUT_HEIGHT);
    expect(document.activeElement).not.toBe(input);
  });

  it("K10: 칸마다 훅이 따로여도(로그인 폼) 다음 칸에서 키보드가 내려가면 blur한다", () => {
    const { resize } = mockViewport();
    const first = mountContainer();
    const second = mountContainer();
    renderHook(() => useAutoBlur({ containerRef: first.ref }));
    renderHook(() => useAutoBlur({ containerRef: second.ref }));
    first.input.focus();
    resize(KEYBOARD_UP);

    second.input.focus(); // 키보드는 그대로
    resize(LAYOUT_HEIGHT);
    expect(document.activeElement).not.toBe(second.input);
  });

  it("K11: 글자 키보드를 안 쓰는 칸(날짜 · readOnly · inputMode none)은 키보드가 내려가도 유지한다", () => {
    const setups: Array<(el: HTMLInputElement) => void> = [
      (el) => (el.type = "date"),
      (el) => (el.readOnly = true),
      (el) => el.setAttribute("inputmode", "none"),
    ];
    for (const setup of setups) {
      const { resize } = mockViewport();
      const text = mountInput();
      const picker = mountInput();
      setup(picker);
      const { unmount } = renderHook(() => useAutoBlur());
      text.focus();
      resize(KEYBOARD_UP);

      picker.focus(); // 키보드가 열린 채 옮김
      resize(LAYOUT_HEIGHT); // 그 칸은 글자 키보드를 안 써 내려감
      expect(document.activeElement).toBe(picker);

      unmount();
      document.body.innerHTML = "";
    }
  });
});
