import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

/**
 * Custom render function with common providers
 * 필요시 ThemeProvider, ToastProvider 등 추가 가능
 */
export function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { ...options });
}

/**
 * Portal 컴포넌트 테스트용 헬퍼
 * document.body에서 특정 클래스를 찾음
 */
export function getPortalContent(className: string) {
  return document.body.querySelector(`.${className}`);
}

/**
 * 비동기 애니메이션 대기
 */
export async function waitForAnimation(ms: number = 300) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * 키보드 이벤트 헬퍼
 */
export function createKeyboardEvent(
  key: string,
  options?: Partial<KeyboardEvent>
): KeyboardEvent {
  return new KeyboardEvent("keydown", {
    key,
    code: key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
}

// re-export everything
export * from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
