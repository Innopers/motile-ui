import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/utils";
import { Button } from "./Button";

describe("Button", () => {
  describe("핵심 기능", () => {
    // 기본 렌더링: 최소한의 props로 정상 렌더링 확인
    it("올바른 role로 button이 렌더링됨", () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    // 기본값 테스트: Breaking Change 방지
    it("기본적으로 primary variant와 large 크기를 사용함", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveClass("motile-btn--primary");
      expect(button).toHaveClass("motile-btn--large");
    });

    // disabled 상태: 버튼 비활성화 확인
    it("disabled prop이 true면 비활성화됨", () => {
      render(<Button disabled>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    // 로딩 상태: 로딩 중에는 버튼 비활성화 (UX 원칙)
    it("isLoading이 true면 비활성화됨", () => {
      render(<Button isLoading>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
    });

    // onClick 이벤트: 클릭 시 핸들러 호출 확인
    it("클릭 시 onClick이 호출됨", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Button</Button>);

      const button = screen.getByRole("button");
      await user.click(button);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    // disabled 버튼: onClick 호출 방지
    // pointer-events: none CSS 때문에 userEvent.click()이 에러를 던짐 → .catch()로 처리
    it("disabled 상태일 때 onClick이 호출되지 않음", async () => {
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
    it("기본적으로 type='button'을 가져 form submit을 방지함", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("type", "button");
    });
  });

  describe("AsChild 패턴", () => {
    // asChild: Button 스타일을 다른 요소(a, Link 등)에 적용
    it("asChild가 true면 자식 엘리먼트로 렌더링됨", () => {
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
    it("asChild와 함께 스타일이 자식으로 전달됨", () => {
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

  describe("Ref 전달", () => {
    // Ref 전달: React.forwardRef() 사용 확인
    // 사용자가 ref.current.focus() 등의 DOM 조작을 할 수 있어야 함
    it("button 요소로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Button</Button>);

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.tagName).toBe("BUTTON");
    });
  });

  describe("접근성", () => {
    // 키보드 접근성: Tab 키로 포커스 가능 (WCAG 2.1 기준)
    it("포커스 가능함", () => {
      render(<Button>Button</Button>);
      const button = screen.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();
    });

    // aria-busy: 로딩 상태를 스크린 리더에 알림 ("버튼, 로딩 중")
    it("로딩 중일 때 aria-busy가 있음", () => {
      render(<Button isLoading>Button</Button>);
      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-busy", "true");
    });

    // Enter 키: 키보드로 버튼 활성화 (WCAG 필수)
    it("Enter 키로 키보드 내비게이션을 지원함", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Button</Button>);

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard("{Enter}");

      expect(handleClick).toHaveBeenCalled();
    });

    // Space 키: 버튼 활성화 (Enter와 함께 WCAG 필수)
    it("Space 키로 키보드 내비게이션을 지원함", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(<Button onClick={handleClick}>Button</Button>);

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard(" ");

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe("로딩 상태", () => {
    // 로딩 인디케이터: role="status" + aria-label로 접근성 보장
    // 스크린 리더가 "상태, 로딩" 읽어줌
    it("적절한 접근성과 함께 로딩 인디케이터가 렌더링됨", () => {
      render(<Button isLoading>Button</Button>);

      const loadingElement = screen.getByRole("status");
      expect(loadingElement).toBeInTheDocument();
      expect(loadingElement).toHaveAttribute("aria-label", "Loading");
    });
  });

  describe("복합 상태", () => {
    // Edge Case: disabled + isLoading 동시 적용 시 올바른 처리
    it("disabled와 isLoading을 모두 처리함", () => {
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
