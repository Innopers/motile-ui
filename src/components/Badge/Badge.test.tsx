import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/utils";
import { Badge } from "./Badge";

describe("Badge", () => {
  describe("Core Functionality", () => {
    // 기본 렌더링: span 요소로 정상 렌더링되는지 확인 (Smoke Test)
    it("should render badge as span element", () => {
      render(<Badge>New</Badge>);
      const badge = screen.getByText("New");
      expect(badge).toBeInTheDocument();
      expect(badge.tagName).toBe("SPAN");
    });

    // 기본값 테스트: size="medium" (Breaking Change 방지)
    it("should use medium size by default", () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("motile-badge--medium");
    });

    // children 렌더링: 텍스트와 React 노드 모두 렌더링
    it("should render children content", () => {
      render(
        <Badge>
          <span data-testid="child">Custom Content</span>
        </Badge>
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
      expect(screen.getByText("Custom Content")).toBeInTheDocument();
    });

    // className 전달: 사용자 정의 클래스 추가 가능
    it("should apply custom className", () => {
      render(<Badge className="custom-badge">Badge</Badge>);
      const badge = screen.getByText("Badge");
      expect(badge).toHaveClass("motile-badge");
      expect(badge).toHaveClass("custom-badge");
    });

    // style 전달: 사용자 정의 스타일 적용 가능
    it("should apply custom style", () => {
      render(
        <Badge style={{ fontSize: "20px" }} data-testid="badge">
          Badge
        </Badge>
      );
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveStyle({ fontSize: "20px" });
    });

    // color prop: CSS variable로 전달됨
    it("should apply color as CSS variable", () => {
      render(
        <Badge color="#ff0000" data-testid="badge">
          Badge
        </Badge>
      );
      const badge = screen.getByTestId("badge");
      expect(badge).toHaveStyle({ "--motile-badge-color": "#ff0000" });
    });
  });

  describe("Size Variants", () => {
    // large 크기
    it("should apply large size class", () => {
      render(<Badge size="large">Large</Badge>);
      expect(screen.getByText("Large")).toHaveClass("motile-badge--large");
    });

    // medium 크기 (기본값)
    it("should apply medium size class", () => {
      render(<Badge size="medium">Medium</Badge>);
      expect(screen.getByText("Medium")).toHaveClass("motile-badge--medium");
    });

    // small 크기
    it("should apply small size class", () => {
      render(<Badge size="small">Small</Badge>);
      expect(screen.getByText("Small")).toHaveClass("motile-badge--small");
    });
  });

  describe("Variant Tests", () => {
    // variant 안 줬을 때: variant 클래스가 붙지 않음 (Breaking Change 방지)
    it("should not add variant class when variant is not provided", () => {
      render(<Badge>Badge</Badge>);
      const badge = screen.getByText("Badge");

      // 기본 클래스와 size 클래스만 있어야 함
      expect(badge).toHaveClass("motile-badge");
      expect(badge).toHaveClass("motile-badge--medium");

      // variant 클래스는 없어야 함
      expect(badge.className).not.toMatch(
        /motile-badge--(primary|secondary|outlined|dot|shimmer)/
      );
    });

    // primary variant
    it("should apply primary variant class", () => {
      render(<Badge variant="primary">Primary</Badge>);
      expect(screen.getByText("Primary")).toHaveClass("motile-badge--primary");
    });

    // secondary variant
    it("should apply secondary variant class", () => {
      render(<Badge variant="secondary">Secondary</Badge>);
      expect(screen.getByText("Secondary")).toHaveClass(
        "motile-badge--secondary"
      );
    });

    // outlined variant
    it("should apply outlined variant class", () => {
      render(<Badge variant="outlined">Outlined</Badge>);
      expect(screen.getByText("Outlined")).toHaveClass(
        "motile-badge--outlined"
      );
    });

    // shimmer variant: className만 확인, 애니메이션은 CSS 구현 세부사항
    it("should apply shimmer variant class", () => {
      render(<Badge variant="shimmer">Shimmer</Badge>);
      expect(screen.getByText("Shimmer")).toHaveClass("motile-badge--shimmer");
    });

    // dot variant: 특수 DOM 구조 확인 (중요!)
    it("should render dot variant with special structure", () => {
      render(
        <Badge variant="dot" data-testid="badge">
          Online
        </Badge>
      );

      const badge = screen.getByTestId("badge");

      // dot variant 클래스 적용
      expect(badge).toHaveClass("motile-badge--dot");

      // __dot 요소 존재 확인
      const dot = badge.querySelector(".motile-badge__dot");
      expect(dot).toBeInTheDocument();

      // __text 요소 존재 확인
      const text = badge.querySelector(".motile-badge__text");
      expect(text).toBeInTheDocument();

      // children이 __text 안에 있는지 확인
      expect(text).toHaveTextContent("Online");
    });
  });

  describe("Ref Forwarding", () => {
    // Ref 전달: HTMLSpanElement로 올바르게 전달됨
    it("should forward ref to span element", () => {
      const ref = React.createRef<HTMLSpanElement>();
      render(<Badge ref={ref}>Badge</Badge>);

      expect(ref.current).toBeInstanceOf(HTMLSpanElement);
      expect(ref.current?.tagName).toBe("SPAN");
    });
  });

  describe("Props Spreading", () => {
    // HTMLSpanElement 속성 전달: data-testid, aria-label 등
    it("should forward HTML attributes", () => {
      render(
        <Badge data-testid="custom-badge" aria-label="Badge label">
          Badge
        </Badge>
      );

      const badge = screen.getByTestId("custom-badge");
      expect(badge).toHaveAttribute("aria-label", "Badge label");
    });
  });
});
