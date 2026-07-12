import React from "react";

import { describe, expect, it, vi } from "vitest";

import { render, screen, userEvent, waitFor } from "@/test/utils";

import { Textarea } from "./Textarea";

describe("Textarea", () => {
  describe("핵심 기능", () => {
    it("role='textbox'를 가진 textarea가 렌더링됨", () => {
      render(<Textarea />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    });

    it("기본적으로 4개의 rows를 사용함", () => {
      render(<Textarea />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea).toHaveAttribute("rows", "4");
    });

    it("resize 스타일이 적용됨", () => {
      render(<Textarea resize="vertical" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveStyle({ resize: "vertical" });
    });

    it("placeholder가 표시됨", () => {
      render(<Textarea placeholder="Enter text" />);
      expect(screen.getByPlaceholderText("Enter text")).toBeInTheDocument();
    });

    it("value가 표시됨", () => {
      render(<Textarea value="test value" readOnly />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.value).toBe("test value");
    });

    it("maxLength 속성이 적용됨", () => {
      render(<Textarea maxLength={100} />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.maxLength).toBe(100);
    });

    it("커스텀 className이 기본 클래스와 병합됨", () => {
      render(<Textarea className="custom-class" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("motile-textarea");
      expect(textarea).toHaveClass("custom-class");
    });

    it("disabled prop이 true면 비활성화됨", () => {
      render(<Textarea disabled />);
      expect(screen.getByRole("textbox")).toBeDisabled();
    });

    it("텍스트 입력 시 onChange가 호출됨", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<Textarea onChange={onChange} />);

      await user.type(screen.getByRole("textbox"), "test");

      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("Label과 Floating", () => {
    it("label이 제공되면 렌더링됨", () => {
      render(<Textarea label="Message" />);
      expect(screen.getByText("Message")).toBeInTheDocument();
    });

    it("label이 제공되면 placeholder가 공백으로 강제됨", () => {
      render(<Textarea label="Message" />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;
      expect(textarea.placeholder).toBe(" ");
    });

    it("label이 제공되면 wrapper에 with-label 클래스가 적용됨", () => {
      const { container } = render(<Textarea label="Message" />);
      const wrapper = container.querySelector(".motile-textarea-wrapper");
      expect(wrapper).toHaveClass("motile-textarea-wrapper--with-label");
    });
  });

  describe("에러 처리", () => {
    it("errorMessage가 제공되면 에러 상태로 설정됨", () => {
      render(<Textarea errorMessage="Error occurred" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("motile-textarea--error");
    });

    it("isError가 true면 에러 클래스가 적용됨", () => {
      render(<Textarea isError />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("motile-textarea--error");
    });

    it("에러 발생 시 shake 클래스가 적용됨", () => {
      render(<Textarea errorMessage="Error" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveClass("motile-textarea--shake");
    });

    it("에러 메시지에 role='alert' 속성이 있음", () => {
      render(<Textarea errorMessage="Invalid input" />);
      const errorMsg = screen.getByRole("alert");
      expect(errorMsg).toHaveTextContent("Invalid input");
    });
  });

  describe("글자 수 카운터", () => {
    it("maxLength가 제공되면 카운터가 표시됨", () => {
      render(<Textarea maxLength={100} value="test" readOnly />);
      expect(screen.getByText("4/100")).toBeInTheDocument();
    });

    it("현재 값의 길이에 따라 카운터가 업데이트됨", () => {
      const { rerender } = render(
        <Textarea maxLength={100} value="hello" readOnly />
      );
      expect(screen.getByText("5/100")).toBeInTheDocument();

      rerender(<Textarea maxLength={100} value="hello world" readOnly />);
      expect(screen.getByText("11/100")).toBeInTheDocument();
    });
  });

  describe("색상과 스타일링", () => {
    it("color가 CSS 변수로 적용됨", () => {
      const { container } = render(<Textarea color="#10b981" />);
      const wrapper = container.querySelector(".motile-textarea-wrapper");
      expect(wrapper).toHaveStyle({ "--motile-textarea-color": "#10b981" });
    });

    it("aria-describedby가 올바르게 병합됨", () => {
      render(
        <Textarea
          aria-describedby="external-desc"
          errorMessage="Error message"
        />
      );
      const textarea = screen.getByRole("textbox");
      const describedBy = textarea.getAttribute("aria-describedby");

      expect(describedBy).toContain("external-desc");
      expect(describedBy).toContain("motile-textarea-error");
    });
  });

  describe("자동 포커스와 자동 선택", () => {
    it("autoFocus가 true면 자동으로 포커스됨", async () => {
      render(<Textarea autoFocus />);
      const textarea = screen.getByRole("textbox");

      await waitFor(() => {
        expect(textarea).toHaveFocus();
      });
    });

    it("autoSelect가 true면 텍스트가 자동으로 선택됨", async () => {
      render(<Textarea autoFocus autoSelect value="test text" readOnly />);
      const textarea = screen.getByRole("textbox") as HTMLTextAreaElement;

      await waitFor(() => {
        expect(textarea).toHaveFocus();
        expect(textarea.selectionStart).toBe(0);
        expect(textarea.selectionEnd).toBe(9);
      });
    });
  });

  describe("자동 크기 조절", () => {
    it("autoSize가 활성화되면 resize가 none으로 강제됨", () => {
      render(<Textarea autoSize resize="vertical" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveStyle({ resize: "none" });
    });

    it("autoSize가 활성화되면 height 스타일이 설정됨", () => {
      render(<Textarea autoSize value="test" readOnly />);
      const textarea = screen.getByRole("textbox");
      const heightStyle = textarea.style.height;

      // JSDOM 제약으로 정확한 값은 검증 불가, 설정되었는지만 확인
      expect(heightStyle).toBeTruthy();
    });

    it("autoSize config 객체를 파싱함", () => {
      render(<Textarea autoSize={{ minRows: 2, maxRows: 10 }} />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveStyle({ resize: "none" });
    });

    it("autoSize가 비활성화되면 resize prop이 적용됨", () => {
      render(<Textarea autoSize={false} resize="vertical" />);
      const textarea = screen.getByRole("textbox");
      expect(textarea).toHaveStyle({ resize: "vertical" });
    });
  });

  describe("Ref 전달", () => {
    it("textarea 엘리먼트로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLTextAreaElement);
      expect(ref.current?.tagName).toBe("TEXTAREA");
    });
  });

  describe("autoBlur", () => {
    const fireTouchMove = () => window.dispatchEvent(new Event("touchmove"));

    it("기본(off)에서는 touchmove에도 포커스가 유지됨", () => {
      render(<Textarea />);
      const ta = screen.getByRole("textbox") as HTMLTextAreaElement;
      ta.focus();
      fireTouchMove();
      expect(document.activeElement).toBe(ta);
    });

    it("autoBlur이면 touchmove 시 포커스가 해제됨", () => {
      render(<Textarea autoBlur />);
      const ta = screen.getByRole("textbox") as HTMLTextAreaElement;
      ta.focus();
      expect(document.activeElement).toBe(ta);
      fireTouchMove();
      expect(document.activeElement).not.toBe(ta);
    });

    it("autoBlur prop이 DOM 속성으로 새지 않음", () => {
      render(<Textarea autoBlur />);
      expect(screen.getByRole("textbox")).not.toHaveAttribute("autoblur");
    });

    it("autoBlur을 true→false로 바꾸면 리스너가 해제돼 포커스가 유지됨", () => {
      const { rerender } = render(<Textarea autoBlur />);
      const ta = screen.getByRole("textbox") as HTMLTextAreaElement;
      rerender(<Textarea autoBlur={false} />);
      ta.focus();
      fireTouchMove();
      expect(document.activeElement).toBe(ta);
    });

    it("forwarded ref와 함께 써도 touchmove 시 포커스가 해제됨", () => {
      const ref = React.createRef<HTMLTextAreaElement>();
      render(<Textarea ref={ref} autoBlur />);
      ref.current?.focus();
      expect(document.activeElement).toBe(ref.current);
      fireTouchMove();
      expect(document.activeElement).not.toBe(ref.current);
    });
  });
});
