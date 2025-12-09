import React from "react";

import { describe, expect, it, vi } from "vitest";

import { render, screen, userEvent } from "@/test/utils";

import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  describe("핵심 기능", () => {
    // 기본 렌더링: checkbox role로 렌더링되는지 확인 (Smoke Test)
    it("올바른 role로 checkbox가 렌더링됨", () => {
      render(<Checkbox />);
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });

    // 기본값 테스트: variant="standard", size="medium", filled=false (Breaking Change 방지)
    it("기본적으로 standard variant와 medium 크기를 사용함", () => {
      render(<Checkbox data-testid="checkbox" />);
      const checkbox = screen.getByTestId("checkbox");

      expect(checkbox).toHaveClass("motile-checkbox--standard");
      expect(checkbox).toHaveClass("motile-checkbox--medium");
      expect(checkbox).not.toHaveClass("motile-checkbox--filled");
    });

    // type="checkbox" 고정: form 안에서 올바른 input 타입 보장
    it("type='checkbox' 속성을 가짐", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("type", "checkbox");
    });

    // label 렌더링: label prop 전달 시 label 텍스트 표시
    it("label이 제공되면 렌더링됨", () => {
      render(<Checkbox label="Accept terms" />);
      expect(screen.getByText("Accept terms")).toBeInTheDocument();
    });

    // label 없을 때: label prop 안 주면 label 요소 없음 (Breaking Change 방지)
    it("label이 제공되지 않으면 렌더링되지 않음", () => {
      const { container } = render(<Checkbox />);
      const label = container.querySelector(".motile-checkbox__label");
      expect(label).not.toBeInTheDocument();
    });

    // color prop: CSS variable로 전달됨
    it("color가 CSS 변수로 적용됨", () => {
      const { container } = render(<Checkbox color="#ff0000" />);
      const checkboxContainer = container.querySelector(
        ".motile-checkbox-container"
      );
      expect(checkboxContainer).toHaveStyle({
        "--motile-checkbox-color": "#ff0000",
      });
    });

    // className 전달: 사용자 정의 클래스가 input에 추가됨
    it("커스텀 className이 적용됨", () => {
      render(<Checkbox className="custom-checkbox" />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("motile-checkbox");
      expect(checkbox).toHaveClass("custom-checkbox");
    });

    // style 전달: 사용자 정의 스타일이 input에 적용됨
    it("커스텀 style이 적용됨", () => {
      render(<Checkbox style={{ margin: "10px" }} />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveStyle({ margin: "10px" });
    });
  });

  describe("체크 상태", () => {
    // Uncontrolled: defaultChecked로 초기 상태 설정
    it("defaultChecked로 비제어 컴포넌트로 동작함", () => {
      render(<Checkbox defaultChecked />);
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      expect(checkbox.checked).toBe(true);
    });

    // Controlled: checked prop으로 상태 제어
    it("checked prop으로 제어 컴포넌트로 동작함", () => {
      const { rerender } = render(<Checkbox checked={false} readOnly />);
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;

      // 초기: 체크 안 됨
      expect(checkbox.checked).toBe(false);

      // 외부에서 checked=true로 변경
      rerender(<Checkbox checked={true} readOnly />);
      expect(checkbox.checked).toBe(true);
    });

    // onChange 호출: 클릭 시 onChange 이벤트 발생
    // input은 pointer-events: none이라 label wrapper를 클릭
    it("클릭 시 onChange가 호출됨", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      const { container } = render(<Checkbox onChange={handleChange} />);
      const label = container.querySelector(".motile-checkbox-wrapper");

      await user.click(label!);

      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    // toggle 동작: Uncontrolled 모드에서 클릭으로 상태 변경
    // input은 pointer-events: none이라 label wrapper를 클릭
    it("클릭 시 체크 상태가 토글됨 (비제어)", async () => {
      const user = userEvent.setup();

      const { container } = render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;
      const label = container.querySelector(".motile-checkbox-wrapper");

      // 초기: 체크 안 됨
      expect(checkbox.checked).toBe(false);

      // 클릭 → 체크됨
      await user.click(label!);
      expect(checkbox.checked).toBe(true);

      // 다시 클릭 → 체크 해제
      await user.click(label!);
      expect(checkbox.checked).toBe(false);
    });

    // disabled 상태: 클릭해도 onChange 호출 안 됨
    it("disabled 상태일 때 onChange가 호출되지 않음", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      const { container } = render(
        <Checkbox disabled onChange={handleChange} />
      );
      const label = container.querySelector(".motile-checkbox-wrapper");

      await user.click(label!);

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe("Variant 테스트", () => {
    // standard variant
    it("standard variant 클래스가 적용됨", () => {
      render(<Checkbox variant="standard" />);
      expect(screen.getByRole("checkbox")).toHaveClass(
        "motile-checkbox--standard"
      );
    });

    // rounded variant
    it("rounded variant 클래스가 적용됨", () => {
      render(<Checkbox variant="rounded" />);
      expect(screen.getByRole("checkbox")).toHaveClass(
        "motile-checkbox--rounded"
      );
    });

    // square variant
    it("square variant 클래스가 적용됨", () => {
      render(<Checkbox variant="square" />);
      expect(screen.getByRole("checkbox")).toHaveClass(
        "motile-checkbox--square"
      );
    });
  });

  describe("크기 테스트", () => {
    // large 크기
    it("large 크기 클래스가 적용됨", () => {
      render(<Checkbox size="large" />);
      expect(screen.getByRole("checkbox")).toHaveClass(
        "motile-checkbox--large"
      );
    });

    // medium 크기 (기본값)
    it("medium 크기 클래스가 적용됨", () => {
      render(<Checkbox size="medium" />);
      expect(screen.getByRole("checkbox")).toHaveClass(
        "motile-checkbox--medium"
      );
    });

    // small 크기
    it("small 크기 클래스가 적용됨", () => {
      render(<Checkbox size="small" />);
      expect(screen.getByRole("checkbox")).toHaveClass(
        "motile-checkbox--small"
      );
    });
  });

  describe("Filled Prop", () => {
    // filled prop: 체크 안 되어도 아이콘 보임 (회색)
    it("filled가 true면 filled 클래스가 적용됨", () => {
      render(<Checkbox filled />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveClass("motile-checkbox--filled");
    });
  });

  describe("Ref 전달", () => {
    // Ref 전달: HTMLInputElement로 올바르게 전달됨
    it("input 요소로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Checkbox ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.type).toBe("checkbox");
    });
  });

  describe("접근성", () => {
    // role="checkbox": input[type="checkbox"]가 자동으로 제공
    it("checkbox role을 가짐", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toBeInTheDocument();
    });

    // label 연결: label prop으로 checkbox 찾을 수 있음
    it("label 텍스트로 접근 가능함", () => {
      render(<Checkbox label="Subscribe to newsletter" />);

      // label 텍스트로 checkbox 찾기
      const checkbox = screen.getByRole("checkbox", {
        name: "Subscribe to newsletter",
      });
      expect(checkbox).toBeInTheDocument();
    });

    // keyboard: Space 키로 toggle (브라우저 기본 동작)
    it("Space 키로 토글됨", async () => {
      const user = userEvent.setup();

      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox") as HTMLInputElement;

      checkbox.focus();
      expect(checkbox.checked).toBe(false);

      // Space 키 → 체크됨
      await user.keyboard(" ");
      expect(checkbox.checked).toBe(true);
    });

    // focusable: Tab 키로 포커스 가능 (WCAG 2.1 기준)
    it("포커스 가능함", () => {
      render(<Checkbox />);
      const checkbox = screen.getByRole("checkbox");

      checkbox.focus();
      expect(checkbox).toHaveFocus();
    });
  });

  describe("Props 전달", () => {
    // HTMLInputElement 속성 전달: name, id, aria-label 등
    it("HTML input 속성이 전달됨", () => {
      render(
        <Checkbox
          name="terms"
          id="terms-checkbox"
          aria-label="Accept terms and conditions"
        />
      );

      const checkbox = screen.getByRole("checkbox");
      expect(checkbox).toHaveAttribute("name", "terms");
      expect(checkbox).toHaveAttribute("id", "terms-checkbox");
      expect(checkbox).toHaveAttribute(
        "aria-label",
        "Accept terms and conditions"
      );
    });
  });
});
