import * as matchers from "@testing-library/jest-dom/matchers";
import { cleanup } from "@testing-library/react";
import { afterEach, expect } from "vitest";

// jest-dom matchers 확장
expect.extend(matchers);

// 각 테스트 후 cleanup (Portal, Event Listener 등 정리)
afterEach(() => {
  cleanup();
});

// ResizeObserver Mock (jsdom에서 지원하지 않음)
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// IntersectionObserver Mock (필요시)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
} as any;

// matchMedia Mock (반응형 테스트용)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }),
});

// scrollTo Mock
window.scrollTo = () => {};
