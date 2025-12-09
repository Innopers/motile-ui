import { describe, expect, it } from "vitest";

import { render } from "@/test/utils";

import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  describe("핵심 기능", () => {
    // 기본 렌더링
    it("기본 클래스와 함께 skeleton이 렌더링됨", () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector(".motile-skeleton");
      expect(skeleton).toBeInTheDocument();
    });

    // 기본값
    it("기본 dimensions와 borderRadius를 사용함", () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector(".motile-skeleton");

      // computed style 확인 (1rem → 16px로 계산됨)
      expect(skeleton).toHaveStyle({
        width: "100%",
        height: "16px",
      });

      // border-radius는 inline style에 존재하는지 확인
      const inlineStyle = skeleton?.getAttribute("style");
      expect(inlineStyle).toContain("border-radius: 4px");
    });

    // className 병합
    it("커스텀 className이 병합됨", () => {
      const { container } = render(<Skeleton className="custom-class" />);
      const skeleton = container.querySelector(".motile-skeleton");
      expect(skeleton).toHaveClass("motile-skeleton");
      expect(skeleton).toHaveClass("custom-class");
    });

    // HTML attributes 전달
    it("HTML 속성이 전달됨", () => {
      const { container } = render(
        <Skeleton data-testid="skeleton" id="test-skeleton" />
      );
      const skeleton = container.querySelector(".motile-skeleton");
      expect(skeleton).toHaveAttribute("data-testid", "skeleton");
      expect(skeleton).toHaveAttribute("id", "test-skeleton");
    });
  });

  describe("크기 Props", () => {
    // string 타입 (그대로 전달)
    it("dimensions에 string 값을 허용함", () => {
      const { container } = render(
        <Skeleton width="200px" height="40px" borderRadius="8px" />
      );
      const skeleton = container.querySelector(".motile-skeleton");
      expect(skeleton).toHaveStyle({
        width: "200px",
        height: "40px",
        borderRadius: "8px",
      });
    });

    // number 타입 (px 추가)
    it("number 값을 px로 변환함", () => {
      const { container } = render(
        <Skeleton width={200} height={40} borderRadius={12} />
      );
      const skeleton = container.querySelector(".motile-skeleton");
      expect(skeleton).toHaveStyle({
        width: "200px",
        height: "40px",
        borderRadius: "12px",
      });
    });

    // 혼합 타입
    it("string과 number 혼합 타입을 처리함", () => {
      const { container } = render(
        <Skeleton width="50%" height={60} borderRadius="50%" />
      );
      const skeleton = container.querySelector(".motile-skeleton");
      expect(skeleton).toHaveStyle({
        width: "50%",
        height: "60px",
        borderRadius: "50%",
      });
    });
  });

  describe("스타일 병합", () => {
    // 외부 style + 내부 customStyle 병합
    it("외부 style과 내부 customStyle이 병합됨", () => {
      const { container } = render(
        <Skeleton
          width={100}
          height={20}
          style={{ backgroundColor: "red", margin: "10px" }}
        />
      );
      const skeleton = container.querySelector(".motile-skeleton");
      expect(skeleton).toHaveStyle({
        width: "100px",
        height: "20px",
        backgroundColor: "red",
        margin: "10px",
      });
    });
  });

  describe("접근성", () => {
    // aria-busy
    it("aria-busy 속성이 있음", () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector(".motile-skeleton");
      expect(skeleton).toHaveAttribute("aria-busy", "true");
    });

    // aria-live
    it("aria-live 속성이 있음", () => {
      const { container } = render(<Skeleton />);
      const skeleton = container.querySelector(".motile-skeleton");
      expect(skeleton).toHaveAttribute("aria-live", "polite");
    });
  });
});
