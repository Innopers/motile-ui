import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/utils";
import { Accordion } from "./Accordion";

describe("Accordion", () => {
  describe("Core Functionality", () => {
    // 기본 렌더링: 3개 컴포넌트가 정상적으로 렌더링되는지 확인
    it("should render accordion with header and content", () => {
      render(
        <Accordion>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      expect(
        screen.getByRole("button", { name: "Header" })
      ).toBeInTheDocument();
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    // 기본값 테스트: variant="default", 닫힌 상태로 시작
    it("should use default variant and closed state by default", () => {
      render(
        <Accordion>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-expanded", "false");
      expect(button).toHaveAttribute("data-state", "closed");
    });

    // 토글 동작: Header 클릭 시 Content 열림/닫힘
    it("should toggle content when header is clicked", async () => {
      const user = userEvent.setup();

      render(
        <Accordion>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      const button = screen.getByRole("button");

      // 초기 상태: 닫힘
      expect(button).toHaveAttribute("aria-expanded", "false");

      // 클릭 → 열림
      await user.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");

      // 다시 클릭 → 닫힘
      await user.click(button);
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    // disabled 상태: 클릭해도 토글 안 됨
    it("should not toggle when disabled", async () => {
      const user = userEvent.setup();

      render(
        <Accordion disabled>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      const button = screen.getByRole("button");
      expect(button).toBeDisabled();
      expect(button).toHaveAttribute("aria-expanded", "false");

      await user.click(button);

      // 여전히 닫힌 상태
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    // onChange 콜백: 상태 변경 시 호출됨
    it("should call onChange when toggled", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Accordion onChange={handleChange}>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      const button = screen.getByRole("button");

      await user.click(button);
      expect(handleChange).toHaveBeenCalledWith(true);

      await user.click(button);
      expect(handleChange).toHaveBeenCalledWith(false);
    });

    // type="button": form 안에서 의도치 않은 submit 방지
    it("should have type='button' on header", () => {
      render(
        <Accordion>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });
  });

  describe("Controlled/Uncontrolled", () => {
    // Uncontrolled: defaultExpanded로 초기 상태 설정
    it("should work as uncontrolled with defaultExpanded", async () => {
      const user = userEvent.setup();

      render(
        <Accordion defaultExpanded>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      const button = screen.getByRole("button");

      // 초기 상태: 열림
      expect(button).toHaveAttribute("aria-expanded", "true");

      // 클릭 → 닫힘
      await user.click(button);
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    // Controlled: expanded prop으로 상태 제어
    it("should work as controlled with expanded prop", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      const { rerender } = render(
        <Accordion expanded={false} onChange={handleChange}>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      const button = screen.getByRole("button");

      // 초기: 닫힘
      expect(button).toHaveAttribute("aria-expanded", "false");

      // 클릭 → onChange 호출, 하지만 상태는 외부에서 제어
      await user.click(button);
      expect(handleChange).toHaveBeenCalledWith(true);
      expect(button).toHaveAttribute("aria-expanded", "false"); // 아직 닫힘

      // 외부에서 expanded=true로 변경
      rerender(
        <Accordion expanded={true} onChange={handleChange}>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    // Controlled 읽기 전용: onChange 없어도 작동
    it("should work as controlled without onChange", () => {
      render(
        <Accordion expanded={true}>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-expanded",
        "true"
      );
    });
  });

  describe("Context", () => {
    // Context 에러: Header가 Accordion 밖에 있으면 에러
    it("should throw error when Header is used outside Accordion", () => {
      // console.error를 mock해서 에러 메시지 숨김
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<Accordion.Header>Header</Accordion.Header>);
      }).toThrow("AccordionHeader/Content must be used within <Accordion>");

      consoleError.mockRestore();
    });

    // Context 에러: Content가 Accordion 밖에 있으면 에러
    it("should throw error when Content is used outside Accordion", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<Accordion.Content>Content</Accordion.Content>);
      }).toThrow("AccordionHeader/Content must be used within <Accordion>");

      consoleError.mockRestore();
    });
  });

  describe("AsChild Pattern", () => {
    // Root asChild: Accordion이 다른 요소로 렌더링됨
    it("should render as child element when asChild is true on root", () => {
      render(
        <Accordion asChild>
          <section data-testid="custom-section">
            <Accordion.Header>Header</Accordion.Header>
            <Accordion.Content>Content</Accordion.Content>
          </section>
        </Accordion>
      );

      const section = screen.getByTestId("custom-section");
      expect(section.tagName).toBe("SECTION");
      expect(section).toHaveAttribute("data-state", "closed");
    });

    // Header asChild: 커스텀 버튼으로 렌더링
    it("should render header as child element when asChild is true", () => {
      render(
        <Accordion>
          <Accordion.Header asChild>
            <button data-testid="custom-button">Custom Header</button>
          </Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      const button = screen.getByTestId("custom-button");
      expect(button).toHaveAttribute("aria-expanded", "false");
    });

    // Content asChild: 커스텀 div로 렌더링
    it("should render content as child element when asChild is true", () => {
      render(
        <Accordion>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content asChild>
            <div data-testid="custom-content">Custom Content</div>
          </Accordion.Content>
        </Accordion>
      );

      const content = screen.getByTestId("custom-content");
      expect(content).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Ref Forwarding", () => {
    // Root ref 전달
    it("should forward ref to accordion root", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Accordion ref={ref}>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    // Header ref 전달
    it("should forward ref to accordion header", () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(
        <Accordion>
          <Accordion.Header ref={ref}>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.tagName).toBe("BUTTON");
    });

    // Content ref 전달
    it("should forward ref to accordion content", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Accordion>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content ref={ref}>Content</Accordion.Content>
        </Accordion>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("Accessibility", () => {
    // aria-expanded: 열림/닫힘 상태 표시
    it("should have proper aria-expanded attribute", async () => {
      const user = userEvent.setup();

      render(
        <Accordion>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      const button = screen.getByRole("button");

      expect(button).toHaveAttribute("aria-expanded", "false");

      await user.click(button);
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    // aria-controls + id: Header와 Content 연결
    it("should connect header and content with aria-controls", () => {
      render(
        <Accordion>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      const button = screen.getByRole("button");
      const panelId = button.getAttribute("aria-controls");

      expect(panelId).toBeTruthy();

      // Content의 부모인 panel이 해당 id를 가져야 함
      const panel = document.getElementById(panelId!);
      expect(panel).toBeInTheDocument();
      expect(panel).toHaveAttribute("aria-hidden");
    });

    // aria-hidden: Content 숨김/보임 상태
    it("should have proper aria-hidden on content", async () => {
      const user = userEvent.setup();

      render(
        <Accordion>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      const button = screen.getByRole("button");
      const panelId = button.getAttribute("aria-controls")!;
      const panel = document.getElementById(panelId);

      // 초기: 숨김
      expect(panel).toHaveAttribute("aria-hidden", "true");

      // 열림
      await user.click(button);
      expect(panel).toHaveAttribute("aria-hidden", "false");
    });

    // Enter 키: 키보드로 토글
    it("should toggle with Enter key", async () => {
      const user = userEvent.setup();

      render(
        <Accordion>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      const button = screen.getByRole("button");
      button.focus();

      expect(button).toHaveAttribute("aria-expanded", "false");

      await user.keyboard("{Enter}");
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    // Space 키: 키보드로 토글
    it("should toggle with Space key", async () => {
      const user = userEvent.setup();

      render(
        <Accordion>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      const button = screen.getByRole("button");
      button.focus();

      expect(button).toHaveAttribute("aria-expanded", "false");

      await user.keyboard(" ");
      expect(button).toHaveAttribute("aria-expanded", "true");
    });

    // aria-disabled: disabled 상태 표시
    it("should have aria-disabled when disabled", () => {
      render(
        <Accordion disabled>
          <Accordion.Header>Header</Accordion.Header>
          <Accordion.Content>Content</Accordion.Content>
        </Accordion>
      );

      const button = screen.getByRole("button");
      expect(button).toHaveAttribute("aria-disabled", "true");
    });
  });
});
