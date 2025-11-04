import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/utils";
import { Button } from "./Button";

describe("Button", () => {
  describe("Core Functionality", () => {
    // 기본 렌더링: 최소한의 props로 정상 렌더링 확인
    it("should render button with correct role", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    // 기본값 테스트: Breaking Change 방지
    it("should use primary variant and large size by default", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("motile-btn--primary");
      expect(button).toHaveClass("motile-btn--large");
    });

    // disabled 상태: 버튼 비활성화 확인
    it("should be disabled when disabled prop is true", () => {
      render(<Button disabled>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    // 로딩 상태: 로딩 중에는 버튼 비활성화 (UX 원칙)
    it("should be disabled when isLoading is true", () => {
      render(<Button isLoading>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    // onClick 이벤트: 클릭 시 핸들러 호출 확인
    it("should call onClick when clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Button</Button>);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    // disabled 버튼: onClick 호출 방지
    // pointer-events: none CSS 때문에 userEvent.click()이 에러를 던짐 → .catch()로 처리
    it("should not call onClick when disabled", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Button disabled onClick={handleClick}>
          Button
        </Button>
      );

      const button = screen.getByRole("button");
      await user.click(button).catch(() => {
        // pointer-events: none으로 인한 에러는 예상된 동작
      });

      expect(handleClick).not.toHaveBeenCalled();
    });

    // type="button" 기본값: form 안에서 의도치 않은 submit 방지 (실무 필수)
    it("should have type='button' by default to prevent form submission", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });
  });

  describe("AsChild Pattern", () => {
    // asChild: Button 스타일을 다른 요소(a, Link 등)에 적용
    it("should render child element when asChild is true", () => {
      render(
        <Button asChild>
          <a href="/home">Link Button</a>
        </Button>
      );

      const link = screen.getByRole("link");
      expect(link).toHaveClass("motile-btn");
      expect(link).toHaveAttribute("href", "/home");
    });

    // asChild + props 전달: variant, color 등 props가 자식 요소로 올바르게 전달되는지 확인
    it("should forward styles to child with asChild", () => {
      render(
        <Button asChild variant="secondary" color="#ff0000">
          <a href="/test">Link</a>
        </Button>
      );

      const link = screen.getByRole("link");
      expect(link).toHaveClass("motile-btn--secondary");
      expect(link).toHaveStyle({ "--motile-btn-color": "#ff0000" });
    });
  });

  describe("Ref Forwarding", () => {
    // Ref 전달: React.forwardRef() 사용 확인
    // 사용자가 ref.current.focus() 등의 DOM 조작을 할 수 있어야 함
    it("should forward ref to button element", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.tagName).toBe("BUTTON");
    });
  });

  describe("Accessibility", () => {
    // 키보드 접근성: Tab 키로 포커스 가능 (WCAG 2.1 기준)
    it("should be focusable", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();
    });

    // aria-busy: 로딩 상태를 스크린 리더에 알림 ("버튼, 로딩 중")
    it("should have aria-busy when loading", () => {
      render(<Button isLoading>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-busy", "true");
    });

    // Enter 키: 키보드로 버튼 활성화 (WCAG 필수)
    it("should support keyboard navigation with Enter", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Button</Button>);

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard("{Enter}");

      expect(handleClick).toHaveBeenCalled();
    });

    // Space 키: 버튼 활성화 (Enter와 함께 WCAG 필수)
    it("should support keyboard navigation with Space", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Button</Button>);

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard(" ");

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    // 로딩 인디케이터: role="status" + aria-label로 접근성 보장
    // 스크린 리더가 "상태, 로딩" 읽어줌
    it("should render loading indicator with proper accessibility", () => {
      render(<Button isLoading>Button</Button>);

      const loadingElement = screen.getByRole("status");
      expect(loadingElement).toBeInTheDocument();
      expect(loadingElement).toHaveAttribute("aria-label", "Loading");
    });
  });

  describe("Combined States", () => {
    // Edge Case: disabled + isLoading 동시 적용 시 올바른 처리
    it("should handle both disabled and isLoading", () => {
      render(
        <Button disabled isLoading>
          Button
        </Button>
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveClass("motile-btn--disabled");
      expect(button).toHaveClass("motile-btn--loading");
    });
  });
});
