import React from "react";

import { describe, expect, it, vi } from "vitest";

import { render, screen, userEvent, waitFor } from "@/test/utils";

import { Input } from "./Input";

describe("Input", () => {
  describe("핵심 기능", () => {
    // 기본 렌더링: input role="textbox"
    it("role='textbox'를 가진 input이 렌더링됨", () => {
      render(<Input />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    // value prop으로 값 설정
    it("value가 제공되면 표시됨", () => {
      render(<Input value="Hello" readOnly />);
      const input = screen.getByRole("textbox") as HTMLInputElement;
      expect(input.value).toBe("Hello");
    });

    // onChange 이벤트
    it("사용자 입력 시 onChange가 호출됨", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(<Input onChange={handleChange} />);
      const input = screen.getByRole("textbox");

      await user.type(input, "a");
      expect(handleChange).toHaveBeenCalled();
    });

    // placeholder 표시
    it("placeholder가 표시됨", () => {
      render(<Input placeholder="Enter text" />);
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    // disabled 상태
    it("disabled prop이 true면 비활성화됨", () => {
      render(<Input disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });
  });

  describe("에러 상태", () => {
    // isError prop으로 에러 상태
    it("isError prop으로 에러 상태를 표시함", () => {
      render(<Input isError data-testid="input" />);
      const input = screen.getByTestId("input");
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveClass("motile-input--error");
    });

    // errorMessage로 에러 상태 + role="alert" + 렌더링
    it("errorMessage로 에러 상태와 role='alert'를 표시함", () => {
      render(<Input errorMessage="Invalid input" data-testid="input" />);
      const input = screen.getByTestId("input");

      // aria-invalid + class
      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveClass("motile-input--error");

      // role="alert" + 텍스트
      const errorMsg = screen.getByRole("alert");
      expect(errorMsg).toHaveTextContent("Invalid input");
    });
  });

  describe("아이콘", () => {
    // leftIcon 렌더링
    it("leftIcon이 렌더링됨", () => {
      render(<Input leftIcon={<span data-testid="left-icon">L</span>} />);
      expect(screen.getByTestId("left-icon")).toBeInTheDocument();
    });

    // rightIcon 렌더링
    it("rightIcon이 렌더링됨", () => {
      render(<Input rightIcon={<span data-testid="right-icon">R</span>} />);
      expect(screen.getByTestId("right-icon")).toBeInTheDocument();
    });
  });

  describe("Clear 버튼", () => {
    // onClear + value 있을 때만 표시
    it("onClear와 value가 있을 때만 clear 버튼이 표시됨", () => {
      render(<Input value="test" onClear={vi.fn()} readOnly />);
      expect(screen.getByLabelText("지우기")).toBeInTheDocument();
    });

    // 클릭 시 onClear 호출
    it("clear 버튼 클릭 시 onClear가 호출됨", async () => {
      const user = userEvent.setup();
      const handleClear = vi.fn();

      render(<Input value="test" onClear={handleClear} readOnly />);

      await user.click(screen.getByLabelText("지우기"));
      expect(handleClear).toHaveBeenCalledTimes(1);
    });

    // clear button이 rightIcon보다 우선순위
    it("clear 버튼이 rightIcon보다 우선순위가 높음", () => {
      render(
        <Input
          value="test"
          onClear={vi.fn()}
          rightIcon={<span data-testid="right-icon">R</span>}
          readOnly
        />
      );

      expect(screen.getByLabelText("지우기")).toBeInTheDocument();
      expect(screen.queryByTestId("right-icon")).not.toBeInTheDocument();
    });
  });

  describe("카운터", () => {
    // maxLength 설정 시 카운터 표시
    it("maxLength 설정 시 카운터가 표시됨", () => {
      render(<Input maxLength={10} value="test" readOnly />);
      expect(screen.getByText("4/10")).toBeInTheDocument();
    });

    // value 길이 변경 시 카운터 업데이트
    it("value 변경 시 카운터가 업데이트됨", () => {
      const { rerender } = render(
        <Input maxLength={10} value="test" readOnly />
      );
      expect(screen.getByText("4/10")).toBeInTheDocument();

      rerender(<Input maxLength={10} value="testing" readOnly />);
      expect(screen.getByText("7/10")).toBeInTheDocument();
    });
  });

  describe("Floating Label", () => {
    // label 렌더링
    it("label이 제공되면 렌더링됨", () => {
      render(<Input label="Username" />);
      expect(screen.getByText("Username")).toBeInTheDocument();
    });

    // label 있을 때 placeholder 처리 (빈 문자열 방지)
    it("label이 있고 placeholder가 없으면 공백을 placeholder로 사용함", () => {
      render(<Input label="Name" />);
      const input = screen.getByRole("textbox");
      expect(input).toHaveAttribute("placeholder", " ");
    });
  });

  describe("자동 포커스/선택", () => {
    // autoFocus로 자동 포커스
    it("autoFocus가 true면 자동으로 포커스됨", async () => {
      render(<Input autoFocus />);

      const input = screen.getByRole("textbox");

      await waitFor(() => {
        expect(input).toHaveFocus();
      });
    });

    // autoSelect로 텍스트 자동 선택
    it("autoSelect가 true면 텍스트가 자동으로 선택됨", async () => {
      render(<Input autoFocus autoSelect value="test" readOnly />);

      const input = screen.getByRole("textbox") as HTMLInputElement;

      await waitFor(() => {
        expect(input).toHaveFocus();
        // selectionStart와 selectionEnd로 선택 확인
        expect(input.selectionStart).toBe(0);
        expect(input.selectionEnd).toBe(4);
      });
    });
  });

  describe("색상", () => {
    // color prop으로 CSS variable 설정
    it("color가 CSS 변수로 적용됨", () => {
      const { container } = render(<Input color="#ff0000" />);
      const wrapper = container.querySelector(".motile-input-wrapper");
      expect(wrapper).toHaveStyle({ "--motile-input-color": "#ff0000" });
    });
  });

  describe("접근성", () => {
    // aria-invalid when error
    it("에러 상태일 때 aria-invalid 속성이 있음", () => {
      render(<Input isError />);
      expect(screen.getByRole("textbox")).toHaveAttribute(
        "aria-invalid",
        "true"
      );
    });

    // aria-describedby 병합 (external + error + counter)
    it("aria-describedby가 올바르게 병합됨", () => {
      render(
        <Input
          aria-describedby="external-desc"
          errorMessage="Error"
          maxLength={10}
          value="test"
          id="test-input"
          readOnly
        />
      );

      const input = screen.getByRole("textbox");
      const describedBy = input.getAttribute("aria-describedby");

      expect(describedBy).toContain("external-desc");
      expect(describedBy).toContain("test-input-error");
      expect(describedBy).toContain("test-input-counter");
    });
  });

  describe("Ref 전달", () => {
    // ref 전달
    it("input 엘리먼트로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.tagName).toBe("INPUT");
    });
  });

  describe("Props 전달", () => {
    // className 전달
    it("커스텀 className이 적용됨", () => {
      render(<Input className="custom-input" data-testid="input" />);
      const input = screen.getByTestId("input");
      expect(input).toHaveClass("motile-input");
      expect(input).toHaveClass("custom-input");
    });
  });

  describe("ID 생성", () => {
    // id prop 제공 시 사용
    it("id가 제공되면 사용됨", () => {
      render(<Input id="custom-id" />);
      expect(screen.getByRole("textbox")).toHaveAttribute("id", "custom-id");
    });

    // id 없으면 자동 생성
    it("id가 제공되지 않으면 자동 생성됨", () => {
      render(<Input />);
      const input = screen.getByRole("textbox");
      const id = input.getAttribute("id");
      expect(id).toBeTruthy();
      expect(id).toMatch(/motile-input-/);
    });
  });

  describe("autoBlur", () => {
    const fireTouchMove = () => window.dispatchEvent(new Event("touchmove"));

    it("기본(off)에서는 touchmove에도 포커스가 유지됨", () => {
      render(<Input />);
      const input = screen.getByRole("textbox") as HTMLInputElement;
      input.focus();
      fireTouchMove();
      expect(document.activeElement).toBe(input);
    });

    it("autoBlur이면 touchmove 시 포커스가 해제됨", () => {
      render(<Input autoBlur />);
      const input = screen.getByRole("textbox") as HTMLInputElement;
      input.focus();
      expect(document.activeElement).toBe(input);
      fireTouchMove();
      expect(document.activeElement).not.toBe(input);
    });

    it("autoBlur prop이 DOM 속성으로 새지 않음", () => {
      render(<Input autoBlur />);
      expect(screen.getByRole("textbox")).not.toHaveAttribute("autoblur");
    });

    it("autoBlur을 true→false로 바꾸면 리스너가 해제돼 포커스가 유지됨", () => {
      const { rerender } = render(<Input autoBlur />);
      const input = screen.getByRole("textbox") as HTMLInputElement;
      rerender(<Input autoBlur={false} />);
      input.focus();
      fireTouchMove();
      expect(document.activeElement).toBe(input);
    });

    it("forwarded ref와 함께 써도 touchmove 시 포커스가 해제됨", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} autoBlur />);
      ref.current?.focus();
      expect(document.activeElement).toBe(ref.current);
      fireTouchMove();
      expect(document.activeElement).not.toBe(ref.current);
    });
  });
});
