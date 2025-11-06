import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/utils";
import { Switch } from "./Switch";

describe("Switch", () => {
  describe("핵심 기능", () => {
    it("role='switch'를 가진 switch가 렌더링됨", () => {
      render(<Switch />);
      expect(screen.getByRole("switch")).toBeInTheDocument();
    });

    it("elastic variant 클래스가 적용됨", () => {
      const { container } = render(<Switch variant="elastic" />);
      const switchContainer = container.querySelector(
        ".motile-switch-container"
      );
      expect(switchContainer).toHaveClass("motile-switch-container--elastic");
    });

    it("bounce variant 클래스가 적용됨", () => {
      const { container } = render(<Switch variant="bounce" />);
      const switchContainer = container.querySelector(
        ".motile-switch-container"
      );
      expect(switchContainer).toHaveClass("motile-switch-container--bounce");
    });

    it("기본적으로 default variant를 사용함", () => {
      const { container } = render(<Switch />);
      const switchContainer = container.querySelector(
        ".motile-switch-container"
      );
      expect(switchContainer).toHaveClass("motile-switch-container--default");
    });

    it("input 엘리먼트에 variant 클래스가 적용됨", () => {
      render(<Switch variant="elastic" />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("motile-switch--elastic");
    });

    it("color가 CSS 변수로 적용됨", () => {
      const { container } = render(<Switch color="#10b981" />);
      const switchContainer = container.querySelector(
        ".motile-switch-container"
      );
      expect(switchContainer).toHaveStyle({
        "--motile-switch-color": "#10b981",
      });
    });

    it("container와 input에 disabled 클래스가 적용됨", () => {
      const { container } = render(<Switch disabled />);
      const switchElement = screen.getByRole("switch") as HTMLInputElement;
      const switchContainer = container.querySelector(
        ".motile-switch-container"
      );

      expect(switchElement).toBeDisabled();
      expect(switchContainer).toHaveClass("motile-switch-container--disabled");
    });

    it("disabled 상태일 때 토글되지 않음", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<Switch disabled onChange={onChange} />);
      const switchElement = screen.getByRole("switch") as HTMLInputElement;

      expect(switchElement.checked).toBe(false);

      const wrapper = container.querySelector(".motile-switch-wrapper");
      await user.click(wrapper!);

      // onChange 호출 안 됨
      expect(onChange).not.toHaveBeenCalled();
      // checked 상태 변경 안 됨
      expect(switchElement.checked).toBe(false);
    });

    it("커스텀 className이 기본 클래스와 병합됨", () => {
      render(<Switch className="custom-class" />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveClass("motile-switch");
      expect(switchElement).toHaveClass("custom-class");
    });
  });

  describe("제어/비제어 모드", () => {
    it("클릭 시 checked 상태가 토글됨 (비제어 모드)", async () => {
      const user = userEvent.setup();
      const { container } = render(<Switch />);
      const switchElement = screen.getByRole("switch") as HTMLInputElement;

      // 초기 상태: unchecked
      expect(switchElement.checked).toBe(false);

      // label wrapper 클릭
      const wrapper = container.querySelector(".motile-switch-wrapper");
      await user.click(wrapper!);

      // 상태 변경: checked
      expect(switchElement.checked).toBe(true);
    });

    it("checked prop으로 제어 컴포넌트로 동작함", () => {
      const { rerender } = render(<Switch checked={false} readOnly />);
      const switchElement = screen.getByRole("switch") as HTMLInputElement;

      expect(switchElement.checked).toBe(false);

      rerender(<Switch checked={true} readOnly />);
      expect(switchElement.checked).toBe(true);
    });
  });

  describe("접근성", () => {
    it("role='switch' 속성이 있음", () => {
      render(<Switch />);
      const switchElement = screen.getByRole("switch");
      expect(switchElement).toHaveAttribute("role", "switch");
    });

    it("접근성을 위해 checked 상태가 반영됨", () => {
      const { rerender } = render(<Switch checked={false} readOnly />);
      const switchElement = screen.getByRole("switch") as HTMLInputElement;

      expect(switchElement.checked).toBe(false);

      rerender(<Switch checked={true} readOnly />);
      expect(switchElement.checked).toBe(true);
    });
  });

  describe("Ref 전달", () => {
    it("input 엘리먼트로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Switch ref={ref} />);

      expect(ref.current).toBeInstanceOf(HTMLInputElement);
      expect(ref.current?.type).toBe("checkbox");
      expect(ref.current?.getAttribute("role")).toBe("switch");
    });
  });

  describe("폼 통합", () => {
    it("type='checkbox' 속성이 있음", () => {
      render(<Switch />);
      const switchElement = screen.getByRole("switch") as HTMLInputElement;
      expect(switchElement.type).toBe("checkbox");
    });

    it("label wrapper 클릭 시 onChange가 호출됨", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      const { container } = render(<Switch onChange={onChange} />);

      const wrapper = container.querySelector(".motile-switch-wrapper");
      await user.click(wrapper!);

      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });
});
