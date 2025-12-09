import React from "react";

import { act } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { render, screen, waitForAnimation } from "@/test/utils";

import { NumberFlow } from "./NumberFlow";

describe("NumberFlow", () => {
  describe("기본 렌더링", () => {
    it("숫자가 올바르게 렌더링됨", () => {
      render(<NumberFlow value={1234} />);
      expect(screen.getByLabelText("1,234")).toBeInTheDocument();
    });

    it("role='text'를 가진 컨테이너가 렌더링됨", () => {
      render(<NumberFlow value={100} />);
      expect(screen.getByRole("text")).toBeInTheDocument();
    });

    it("커스텀 className이 적용됨", () => {
      render(<NumberFlow value={100} className="custom-class" />);
      const container = document.querySelector(".motile-number-flow");
      expect(container).toHaveClass("custom-class");
    });
  });

  describe("애니메이션", () => {
    it("기본 duration은 600ms임", () => {
      const { container } = render(<NumberFlow value={123} />);
      const digitColumn = container.querySelector(
        ".motile-number-flow__digit-column"
      );
      expect(digitColumn).toHaveStyle({
        transition: "transform 600ms ease-out",
      });
    });

    it("커스텀 duration이 적용됨", () => {
      const { container } = render(<NumberFlow value={123} duration={1000} />);
      const digitColumn = container.querySelector(
        ".motile-number-flow__digit-column"
      );
      expect(digitColumn).toHaveStyle({
        transition: "transform 1000ms ease-out",
      });
    });

    it("animateOnMount=true일 때 0에서 시작하여 애니메이션됨", async () => {
      const { container } = render(
        <NumberFlow value={5} animateOnMount={true} />
      );

      // 초기에는 0 위치 (translateY(0%))
      const digitColumn = container.querySelector(
        ".motile-number-flow__digit-column"
      );
      const initialStyle = digitColumn?.getAttribute("style");
      expect(initialStyle).toContain("translateY(0%)");

      // 애니메이션 후 5 위치로 이동
      await act(async () => {
        await waitForAnimation(100);
      });

      const afterStyle = digitColumn?.getAttribute("style");
      expect(afterStyle).not.toBe(initialStyle);
    });

    it("animateOnMount=false일 때 초기 애니메이션이 없음", () => {
      const { container } = render(
        <NumberFlow value={5} animateOnMount={false} />
      );

      const digitColumn = container.querySelector(
        ".motile-number-flow__digit-column"
      );
      const style = digitColumn?.getAttribute("style");
      // 5의 위치는 translateY(-16.666...%)
      expect(style).toContain("translateY(-16.666");
    });

    it("값이 증가하면 애니메이션이 발생함", async () => {
      const { rerender } = render(
        <NumberFlow value={10} animateOnMount={false} />
      );

      expect(screen.getByLabelText("10")).toBeInTheDocument();

      await act(async () => {
        rerender(<NumberFlow value={25} animateOnMount={false} />);
        await waitForAnimation(100);
      });

      expect(screen.getByLabelText("25")).toBeInTheDocument();
    });

    it("값이 감소하면 애니메이션이 발생함", async () => {
      const { rerender } = render(
        <NumberFlow value={25} animateOnMount={false} />
      );

      expect(screen.getByLabelText("25")).toBeInTheDocument();

      await act(async () => {
        rerender(<NumberFlow value={10} animateOnMount={false} />);
        await waitForAnimation(100);
      });

      expect(screen.getByLabelText("10")).toBeInTheDocument();
    });
  });

  describe("숫자 포맷팅", () => {
    it("기본 로케일(ko-KR)로 천 단위 구분자가 적용됨", () => {
      render(<NumberFlow value={1234567} />);
      expect(screen.getByLabelText("1,234,567")).toBeInTheDocument();
    });

    it("다른 로케일(de-DE)이 적용됨", () => {
      render(<NumberFlow value={1234567} locale="de-DE" />);
      expect(screen.getByLabelText("1.234.567")).toBeInTheDocument();
    });

    it("0 값이 올바르게 렌더링됨", () => {
      render(<NumberFlow value={0} />);
      expect(screen.getByLabelText("0")).toBeInTheDocument();
    });

    it("음수가 올바르게 포맷팅됨", () => {
      render(<NumberFlow value={-1234} />);
      expect(screen.getByLabelText("-1,234")).toBeInTheDocument();
    });
  });

  describe("음수 방향 처리", () => {
    it("-100 → -200: 절대값 증가 시 애니메이션 발생", async () => {
      const { rerender } = render(<NumberFlow value={-100} />);
      expect(screen.getByLabelText("-100")).toBeInTheDocument();

      await act(async () => {
        rerender(<NumberFlow value={-200} />);
        await waitForAnimation(100);
      });

      expect(screen.getByLabelText("-200")).toBeInTheDocument();
    });

    it("-200 → -100: 절대값 감소 시 애니메이션 발생", async () => {
      const { rerender } = render(<NumberFlow value={-200} />);
      expect(screen.getByLabelText("-200")).toBeInTheDocument();

      await act(async () => {
        rerender(<NumberFlow value={-100} />);
        await waitForAnimation(100);
      });

      expect(screen.getByLabelText("-100")).toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    it("aria-label에 포맷팅된 숫자가 표시됨", () => {
      render(<NumberFlow value={1234} />);
      const container = screen.getByRole("text");
      expect(container).toHaveAttribute("aria-label", "1,234");
    });

    it("시각적 숫자는 aria-hidden으로 숨겨짐", () => {
      const { container } = render(<NumberFlow value={100} />);
      const valueContainer = container.querySelector(
        ".motile-number-flow__value"
      );
      expect(valueContainer).toHaveAttribute("aria-hidden", "true");
    });

    it("스크린 리더용 숨겨진 값이 존재함", () => {
      render(<NumberFlow value={5678} />);
      const srOnly = document.querySelector(".motile-number-flow__sr-only");
      expect(srOnly).toBeInTheDocument();
      expect(srOnly).toHaveTextContent("5,678");
    });
  });

  describe("Ref 전달", () => {
    it("span 엘리먼트로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<NumberFlow ref={ref} value={100} />);

      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
      expect(ref.current?.className).toContain("motile-number-flow");
    });
  });

  describe("에지 케이스", () => {
    it("매우 큰 숫자가 올바르게 처리됨", () => {
      render(<NumberFlow value={999999999} />);
      expect(screen.getByLabelText("999,999,999")).toBeInTheDocument();
    });

    it("연속적인 값 변경 시 최종 값이 표시됨", async () => {
      const { rerender } = render(<NumberFlow value={0} />);

      await act(async () => {
        for (let i = 1; i <= 10; i++) {
          rerender(<NumberFlow value={i * 100} />);
        }
        await waitForAnimation(100);
      });

      expect(screen.getByLabelText("1,000")).toBeInTheDocument();
    });
  });
});
