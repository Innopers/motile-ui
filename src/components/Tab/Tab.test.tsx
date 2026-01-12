import React from "react";

import { describe, expect, it, vi } from "vitest";

import { render, screen, userEvent } from "@/test/utils";

import { Tab } from "./Tab";

describe("Tab", () => {
  describe("핵심 기능", () => {
    // 기본 렌더링
    it("Tab 컴포넌트가 정상적으로 렌더링됨", () => {
      render(
        <Tab defaultValue="tab1">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      expect(screen.getByRole("tablist")).toBeInTheDocument();
      expect(screen.getAllByRole("tab")).toHaveLength(2);
      expect(screen.getByText("Content 1")).toBeInTheDocument();
    });

    // 기본값 테스트
    it("기본적으로 underline variant와 horizontal orientation을 사용함", () => {
      render(
        <Tab defaultValue="tab1">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
        </Tab>
      );

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveAttribute("data-variant", "underline");
      expect(tablist).toHaveAttribute("data-orientation", "horizontal");
    });

    // 탭 전환
    it("탭 클릭 시 컨텐츠가 전환됨", async () => {
      const user = userEvent.setup();

      render(
        <Tab defaultValue="tab1">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const [tab1, tab2] = screen.getAllByRole("tab");

      // 초기 상태: Tab 1 활성화
      expect(tab1).toHaveAttribute("aria-selected", "true");
      expect(tab2).toHaveAttribute("aria-selected", "false");
      expect(screen.getByText("Content 1")).toBeVisible();
      expect(screen.queryByText("Content 2")).not.toBeInTheDocument();

      // Tab 2 클릭
      await user.click(tab2);
      expect(tab1).toHaveAttribute("aria-selected", "false");
      expect(tab2).toHaveAttribute("aria-selected", "true");
      expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
      expect(screen.getByText("Content 2")).toBeVisible();
    });

    // disabled 상태
    it("disabled 상태일 때 탭이 비활성화됨", () => {
      render(
        <Tab defaultValue="tab1" disabled>
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const [tab1, tab2] = screen.getAllByRole("tab");

      expect(tab1).toBeDisabled();
      expect(tab2).toBeDisabled();
      expect(tab1).toHaveAttribute("aria-selected", "true");
    });

    // 개별 탭 disabled
    it("개별 탭만 disabled 처리 가능", async () => {
      const user = userEvent.setup();

      render(
        <Tab defaultValue="tab1">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2" disabled>
              Tab 2
            </Tab.Trigger>
            <Tab.Trigger value="tab3">Tab 3</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
          <Tab.Content value="tab3">Content 3</Tab.Content>
        </Tab>
      );

      const [tab1, tab2, tab3] = screen.getAllByRole("tab");

      expect(tab1).not.toBeDisabled();
      expect(tab2).toBeDisabled();
      expect(tab3).not.toBeDisabled();

      await user.click(tab2);
      expect(tab1).toHaveAttribute("aria-selected", "true");

      await user.click(tab3);
      expect(tab3).toHaveAttribute("aria-selected", "true");
    });

    // onValueChange 콜백
    it("탭 변경 시 onValueChange가 호출됨", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Tab defaultValue="tab1" onValueChange={handleChange}>
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const [, tab2] = screen.getAllByRole("tab");

      await user.click(tab2);
      expect(handleChange).toHaveBeenCalledWith("tab2");
    });
  });

  describe("Controlled/Uncontrolled", () => {
    // Controlled 모드
    it("controlled 모드에서 외부 value로 제어됨", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      const { rerender } = render(
        <Tab value="tab1" onValueChange={handleChange}>
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const [tab1, tab2] = screen.getAllByRole("tab");

      // 초기 상태
      expect(tab1).toHaveAttribute("aria-selected", "true");

      // Tab 2 클릭 → onChange 호출되지만 상태는 변경 안 됨 (외부에서 제어)
      await user.click(tab2);
      expect(handleChange).toHaveBeenCalledWith("tab2");
      expect(tab1).toHaveAttribute("aria-selected", "true");

      // 외부에서 value 변경
      rerender(
        <Tab value="tab2" onValueChange={handleChange}>
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      expect(tab2).toHaveAttribute("aria-selected", "true");
    });

    // Uncontrolled 모드
    it("uncontrolled 모드에서 내부 상태로 관리됨", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Tab defaultValue="tab1" onValueChange={handleChange}>
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const [, tab2] = screen.getAllByRole("tab");

      await user.click(tab2);
      expect(handleChange).toHaveBeenCalledWith("tab2");
      expect(tab2).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("Variant", () => {
    // underline variant
    it("underline variant가 정상 동작함", () => {
      render(
        <Tab defaultValue="tab1" variant="underline">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveAttribute("data-variant", "underline");
      expect(tablist).toHaveClass("motile-tab__list--underline");
    });

    // pill variant
    it("pill variant가 정상 동작함", () => {
      render(
        <Tab defaultValue="tab1" variant="pill">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveAttribute("data-variant", "pill");
      expect(tablist).toHaveClass("motile-tab__list--pill");

      const [tab1] = screen.getAllByRole("tab");
      expect(tab1).toHaveClass("motile-tab__trigger--pill");
    });

    // pill variant 전환 동작
    it("pill variant에서 탭 전환이 정상 동작함", async () => {
      const user = userEvent.setup();

      render(
        <Tab defaultValue="tab1" variant="pill">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const [tab1, tab2] = screen.getAllByRole("tab");

      expect(tab1).toHaveClass("motile-tab__trigger--active");
      expect(tab2).not.toHaveClass("motile-tab__trigger--active");

      await user.click(tab2);

      expect(tab1).not.toHaveClass("motile-tab__trigger--active");
      expect(tab2).toHaveClass("motile-tab__trigger--active");
    });
  });

  describe("Orientation", () => {
    // horizontal orientation
    it("horizontal orientation이 정상 동작함", () => {
      render(
        <Tab defaultValue="tab1" orientation="horizontal">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveAttribute("data-orientation", "horizontal");
      expect(tablist).toHaveAttribute("aria-orientation", "horizontal");
    });

    // vertical orientation
    it("vertical orientation이 정상 동작함", () => {
      render(
        <Tab defaultValue="tab1" orientation="vertical">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveAttribute("data-orientation", "vertical");
      expect(tablist).toHaveAttribute("aria-orientation", "vertical");

      const root = tablist.parentElement;
      expect(root).toHaveClass("motile-tab--vertical");
    });

    // vertical orientation 전환 동작
    it("vertical orientation에서 탭 전환이 정상 동작함", async () => {
      const user = userEvent.setup();

      render(
        <Tab defaultValue="tab1" orientation="vertical">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const [tab1, tab2] = screen.getAllByRole("tab");

      expect(tab1).toHaveAttribute("aria-selected", "true");
      expect(tab1).toHaveAttribute("data-orientation", "vertical");

      await user.click(tab2);

      expect(tab2).toHaveAttribute("aria-selected", "true");
      expect(screen.getByText("Content 2")).toBeVisible();
    });

    // vertical + pill variant 조합
    it("vertical orientation과 pill variant 조합이 정상 동작함", () => {
      render(
        <Tab defaultValue="tab1" orientation="vertical" variant="pill">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const tablist = screen.getByRole("tablist");
      expect(tablist).toHaveClass("motile-tab__list--vertical");
      expect(tablist).toHaveClass("motile-tab__list--pill");

      const [tab1] = screen.getAllByRole("tab");
      expect(tab1).toHaveClass("motile-tab__trigger--pill");
      expect(tab1).toHaveAttribute("data-orientation", "vertical");
    });
  });

  describe("키보드 네비게이션", () => {
    // ArrowRight/ArrowLeft (horizontal)
    it("ArrowRight/Left로 탭 이동 (automatic)", async () => {
      const user = userEvent.setup();

      render(
        <Tab defaultValue="tab1">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
            <Tab.Trigger value="tab3">Tab 3</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
          <Tab.Content value="tab3">Content 3</Tab.Content>
        </Tab>
      );

      const [tab1, tab2, tab3] = screen.getAllByRole("tab");

      // Tab 1에서 ArrowRight → Tab 2로 이동 및 활성화
      tab1.focus();
      await user.keyboard("{ArrowRight}");
      expect(tab2).toHaveFocus();
      expect(tab2).toHaveAttribute("aria-selected", "true");

      // Tab 2에서 ArrowRight → Tab 3로 이동 및 활성화
      await user.keyboard("{ArrowRight}");
      expect(tab3).toHaveFocus();
      expect(tab3).toHaveAttribute("aria-selected", "true");

      // Tab 3에서 ArrowRight → Tab 1로 순환 (wrap around)
      await user.keyboard("{ArrowRight}");
      expect(tab1).toHaveFocus();
      expect(tab1).toHaveAttribute("aria-selected", "true");

      // Tab 1에서 ArrowLeft → Tab 3로 순환
      await user.keyboard("{ArrowLeft}");
      expect(tab3).toHaveFocus();
      expect(tab3).toHaveAttribute("aria-selected", "true");
    });

    // ArrowUp/ArrowDown (vertical)
    it("ArrowUp/Down으로 탭 이동 (vertical)", async () => {
      const user = userEvent.setup();

      render(
        <Tab defaultValue="tab1" orientation="vertical">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
            <Tab.Trigger value="tab3">Tab 3</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
          <Tab.Content value="tab3">Content 3</Tab.Content>
        </Tab>
      );

      const [tab1, tab2, tab3] = screen.getAllByRole("tab");

      // Tab 1에서 ArrowDown → Tab 2로 이동 및 활성화
      tab1.focus();
      await user.keyboard("{ArrowDown}");
      expect(tab2).toHaveFocus();
      expect(tab2).toHaveAttribute("aria-selected", "true");

      // Tab 2에서 ArrowDown → Tab 3로 이동 및 활성화
      await user.keyboard("{ArrowDown}");
      expect(tab3).toHaveFocus();
      expect(tab3).toHaveAttribute("aria-selected", "true");

      // Tab 3에서 ArrowDown → Tab 1로 순환
      await user.keyboard("{ArrowDown}");
      expect(tab1).toHaveFocus();
      expect(tab1).toHaveAttribute("aria-selected", "true");

      // Tab 1에서 ArrowUp → Tab 3로 순환
      await user.keyboard("{ArrowUp}");
      expect(tab3).toHaveFocus();
      expect(tab3).toHaveAttribute("aria-selected", "true");
    });

    // Manual activation mode
    it("manual activation mode에서 Enter/Space로 활성화", async () => {
      const user = userEvent.setup();

      render(
        <Tab defaultValue="tab1" activationMode="manual">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const [tab1, tab2] = screen.getAllByRole("tab");

      // ArrowRight로 포커스 이동만 (활성화 안 됨)
      tab1.focus();
      await user.keyboard("{ArrowRight}");
      expect(tab2).toHaveFocus();
      expect(tab1).toHaveAttribute("aria-selected", "true"); // 여전히 Tab 1 활성화

      // Enter로 활성화
      await user.keyboard("{Enter}");
      expect(tab2).toHaveAttribute("aria-selected", "true");
    });

    // Manual activation mode - Space 키
    it("manual activation mode에서 Space로 활성화", async () => {
      const user = userEvent.setup();

      render(
        <Tab defaultValue="tab1" activationMode="manual">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const [tab1, tab2] = screen.getAllByRole("tab");

      tab1.focus();
      await user.keyboard("{ArrowRight}");
      expect(tab2).toHaveFocus();
      expect(tab1).toHaveAttribute("aria-selected", "true");

      // Space로 활성화
      await user.keyboard(" ");
      expect(tab2).toHaveAttribute("aria-selected", "true");
    });

    // disabled 탭 건너뛰기
    it("disabled 탭은 키보드로 건너뜀", async () => {
      const user = userEvent.setup();

      render(
        <Tab defaultValue="tab1">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2" disabled>
              Tab 2
            </Tab.Trigger>
            <Tab.Trigger value="tab3">Tab 3</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
          <Tab.Content value="tab3">Content 3</Tab.Content>
        </Tab>
      );

      const [tab1, , tab3] = screen.getAllByRole("tab");

      // Tab 1에서 ArrowRight → disabled Tab 2 건너뛰고 Tab 3로 이동
      tab1.focus();
      await user.keyboard("{ArrowRight}");
      expect(tab3).toHaveFocus();
      expect(tab3).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("ARIA 속성", () => {
    it("올바른 ARIA 속성이 설정됨", () => {
      render(
        <Tab defaultValue="tab1">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const tablist = screen.getByRole("tablist");
      const [tab1, tab2] = screen.getAllByRole("tab");
      const [panel1] = screen.getAllByRole("tabpanel");

      // Tab.List
      expect(tablist).toHaveAttribute("aria-orientation", "horizontal");

      // Tab.Trigger
      expect(tab1).toHaveAttribute("aria-selected", "true");
      expect(tab1).toHaveAttribute("aria-controls");
      expect(tab1).toHaveAttribute("tabindex", "0");

      expect(tab2).toHaveAttribute("aria-selected", "false");
      expect(tab2).toHaveAttribute("aria-controls");
      expect(tab2).toHaveAttribute("tabindex", "-1");

      // Tab.Content
      expect(panel1).toHaveAttribute("aria-labelledby");
      expect(panel1).toHaveAttribute("role", "tabpanel");
    });

    // aria-disabled
    it("disabled 탭에 aria-disabled가 설정됨", () => {
      render(
        <Tab defaultValue="tab1" disabled>
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const [tab1, tab2] = screen.getAllByRole("tab");
      expect(tab1).toHaveAttribute("aria-disabled", "true");
      expect(tab2).toHaveAttribute("aria-disabled", "true");
    });

    // 개별 탭 aria-disabled
    it("개별 disabled 탭에 aria-disabled가 설정됨", () => {
      render(
        <Tab defaultValue="tab1">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2" disabled>
              Tab 2
            </Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const [tab1, tab2] = screen.getAllByRole("tab");
      expect(tab1).not.toHaveAttribute("aria-disabled");
      expect(tab2).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("forceMount", () => {
    it("forceMount prop으로 비활성 탭도 DOM에 유지", () => {
      render(
        <Tab defaultValue="tab1">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2" forceMount>
            Content 2
          </Tab.Content>
        </Tab>
      );

      // Tab 2가 활성화되지 않았지만 forceMount로 인해 DOM에 존재
      expect(screen.getByText("Content 2")).toBeInTheDocument();
      expect(screen.getByText("Content 2")).not.toBeVisible(); // hidden 속성
    });

    // forceMount 여러 개
    it("forceMount가 여러 content에 적용 가능", () => {
      render(
        <Tab defaultValue="tab1">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
            <Tab.Trigger value="tab3">Tab 3</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2" forceMount>
            Content 2
          </Tab.Content>
          <Tab.Content value="tab3" forceMount>
            Content 3
          </Tab.Content>
        </Tab>
      );

      expect(screen.getByText("Content 1")).toBeVisible();
      expect(screen.getByText("Content 2")).toBeInTheDocument();
      expect(screen.getByText("Content 2")).not.toBeVisible();
      expect(screen.getByText("Content 3")).toBeInTheDocument();
      expect(screen.getByText("Content 3")).not.toBeVisible();
    });
  });

  describe("AsChild 패턴", () => {
    // Root asChild
    it("root에서 asChild가 true면 자식 엘리먼트로 렌더링됨", () => {
      render(
        <Tab defaultValue="tab1" asChild>
          <section data-testid="custom-section">
            <Tab.List>
              <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
              <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
            </Tab.List>
            <Tab.Content value="tab1">Content 1</Tab.Content>
            <Tab.Content value="tab2">Content 2</Tab.Content>
          </section>
        </Tab>
      );

      const section = screen.getByTestId("custom-section");
      expect(section.tagName).toBe("SECTION");
      expect(section).toHaveClass("motile-tab");
    });

    // List asChild
    it("list에서 asChild가 true면 자식 엘리먼트로 렌더링됨", () => {
      render(
        <Tab defaultValue="tab1">
          <Tab.List asChild>
            <nav data-testid="custom-nav">
              <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
              <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
            </nav>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const nav = screen.getByTestId("custom-nav");
      expect(nav.tagName).toBe("NAV");
      expect(nav).toHaveAttribute("role", "tablist");
    });

    // Trigger asChild
    it("trigger에서 asChild가 true면 자식 엘리먼트로 렌더링됨", () => {
      render(
        <Tab defaultValue="tab1">
          <Tab.List>
            <Tab.Trigger value="tab1" asChild>
              <button data-testid="custom-button">Custom Tab 1</button>
            </Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const button = screen.getByTestId("custom-button");
      expect(button).toHaveAttribute("role", "tab");
      expect(button).toHaveAttribute("aria-selected", "true");
    });

    // Content asChild
    it("content에서 asChild가 true면 자식 엘리먼트로 렌더링됨", () => {
      render(
        <Tab defaultValue="tab1">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1" asChild>
            <article data-testid="custom-article">Custom Content 1</article>
          </Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const article = screen.getByTestId("custom-article");
      expect(article.tagName).toBe("ARTICLE");
      expect(article).toHaveAttribute("role", "tabpanel");
    });
  });

  describe("Ref 전달", () => {
    // Root ref
    it("tab root로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Tab defaultValue="tab1" ref={ref}>
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
        </Tab>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.className).toContain("motile-tab");
    });

    // List ref
    it("tab list로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Tab defaultValue="tab1">
          <Tab.List ref={ref}>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
        </Tab>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.getAttribute("role")).toBe("tablist");
    });

    // Trigger ref
    it("tab trigger로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(
        <Tab defaultValue="tab1">
          <Tab.List>
            <Tab.Trigger value="tab1" ref={ref}>
              Tab 1
            </Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
        </Tab>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.tagName).toBe("BUTTON");
    });

    // Content ref
    it("tab content로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Tab defaultValue="tab1">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1" ref={ref}>
            Content 1
          </Tab.Content>
        </Tab>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.getAttribute("role")).toBe("tabpanel");
    });
  });

  describe("Context", () => {
    // List Context 에러
    it("List를 Tab 밖에서 사용 시 에러 발생", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
          </Tab.List>
        );
      }).toThrow("Tab 컴포넌트는 Tab.Root 내에서 사용되어야 합니다");

      consoleError.mockRestore();
    });

    // Trigger Context 에러
    it("Trigger를 Tab 밖에서 사용 시 에러 발생", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<Tab.Trigger value="tab1">Tab 1</Tab.Trigger>);
      }).toThrow("Tab 컴포넌트는 Tab.Root 내에서 사용되어야 합니다");

      consoleError.mockRestore();
    });

    // Content Context 에러
    it("Content를 Tab 밖에서 사용 시 에러 발생", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<Tab.Content value="tab1">Content 1</Tab.Content>);
      }).toThrow("Tab 컴포넌트는 Tab.Root 내에서 사용되어야 합니다");

      consoleError.mockRestore();
    });
  });

  describe("커스터마이징", () => {
    // color prop
    it("color prop이 CSS 변수로 설정됨", () => {
      render(
        <Tab defaultValue="tab1" color="#10b981">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const root = screen.getByRole("tablist").parentElement;
      expect(root).toHaveStyle({ "--motile-tab-color": "#10b981" });
    });

    // className
    it("className이 root에 적용됨", () => {
      render(
        <Tab defaultValue="tab1" className="custom-tab">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
        </Tab>
      );

      const root = screen.getByRole("tablist").parentElement;
      expect(root).toHaveClass("custom-tab");
      expect(root).toHaveClass("motile-tab");
    });

    // style
    it("style prop이 적용됨", () => {
      render(
        <Tab defaultValue="tab1" style={{ backgroundColor: "red" }}>
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
        </Tab>
      );

      const root = screen.getByRole("tablist").parentElement;
      expect(root).toHaveStyle({ backgroundColor: "red" });
    });

    // data attributes
    it("커스텀 data attributes가 적용됨", () => {
      render(
        <Tab defaultValue="tab1" data-testid="my-tab">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
        </Tab>
      );

      expect(screen.getByTestId("my-tab")).toBeInTheDocument();
    });
  });

  describe("엣지 케이스", () => {
    // defaultValue 없이 시작
    it("defaultValue 없이 시작 가능", () => {
      render(
        <Tab>
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const [tab1, tab2] = screen.getAllByRole("tab");
      expect(tab1).toHaveAttribute("aria-selected", "false");
      expect(tab2).toHaveAttribute("aria-selected", "false");
      expect(screen.queryByText("Content 1")).not.toBeInTheDocument();
      expect(screen.queryByText("Content 2")).not.toBeInTheDocument();
    });

    // 탭이 하나만 있는 경우
    it("탭이 하나만 있어도 정상 동작함", async () => {
      const user = userEvent.setup();

      render(
        <Tab defaultValue="tab1">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
        </Tab>
      );

      const [tab1] = screen.getAllByRole("tab");

      tab1.focus();
      await user.keyboard("{ArrowRight}");
      expect(tab1).toHaveFocus(); // 순환되어 다시 tab1

      await user.keyboard("{ArrowLeft}");
      expect(tab1).toHaveFocus();
    });

    // 모든 탭이 disabled인 경우
    it("모든 탭이 disabled여도 렌더링됨", () => {
      render(
        <Tab defaultValue="tab1">
          <Tab.List>
            <Tab.Trigger value="tab1" disabled>
              Tab 1
            </Tab.Trigger>
            <Tab.Trigger value="tab2" disabled>
              Tab 2
            </Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const tabs = screen.getAllByRole("tab");
      expect(tabs).toHaveLength(2);
      expect(tabs[0]).toBeDisabled();
      expect(tabs[1]).toBeDisabled();
    });

    // Content 없이 Trigger만 있는 경우
    it("Content 없이 Trigger만 있어도 동작함", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Tab defaultValue="tab1" onValueChange={handleChange}>
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
        </Tab>
      );

      const [, tab2] = screen.getAllByRole("tab");
      await user.click(tab2);

      expect(handleChange).toHaveBeenCalledWith("tab2");
      expect(tab2).toHaveAttribute("aria-selected", "true");
    });

    // 존재하지 않는 value로 defaultValue 설정
    it("존재하지 않는 value로 defaultValue 설정 시 선택 없음", () => {
      render(
        <Tab defaultValue="non-existent">
          <Tab.List>
            <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
            <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          </Tab.List>
          <Tab.Content value="tab1">Content 1</Tab.Content>
          <Tab.Content value="tab2">Content 2</Tab.Content>
        </Tab>
      );

      const [tab1, tab2] = screen.getAllByRole("tab");
      expect(tab1).toHaveAttribute("aria-selected", "false");
      expect(tab2).toHaveAttribute("aria-selected", "false");
    });
  });
});
