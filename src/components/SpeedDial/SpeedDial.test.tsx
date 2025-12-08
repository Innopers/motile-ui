import React from "react";

import { describe, expect, it, vi } from "vitest";

import { render, screen, userEvent } from "@/test/utils";

import { SpeedDial } from "./SpeedDial";

describe("SpeedDial", () => {
  describe("핵심 기능", () => {
    // 기본 렌더링
    it("trigger 버튼이 렌더링됨", () => {
      render(
        <SpeedDial.Root open={false} onOpenChange={() => {}}>
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      expect(screen.getByRole("button", { name: "Open" })).toBeInTheDocument();
    });

    // open=false → Actions 숨김
    it("open이 false면 actions가 숨겨짐", () => {
      render(
        <SpeedDial.Root open={false} onOpenChange={() => {}}>
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    });

    // open=true → Actions 표시
    it("open이 true면 actions가 표시됨", () => {
      render(
        <SpeedDial.Root open={true} onOpenChange={() => {}}>
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      expect(screen.getByRole("menu")).toBeInTheDocument();
      expect(
        screen.getByRole("menuitem", { name: "Action 1" })
      ).toBeInTheDocument();
    });

    // Trigger 클릭 토글
    it("trigger 클릭 시 open 상태가 토글됨", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <SpeedDial.Root open={false} onOpenChange={onOpenChange}>
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      await user.click(screen.getByRole("button", { name: "Open" }));

      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    // direction prop
    it("actions container에 direction이 적용됨", () => {
      const { container } = render(
        <SpeedDial.Root open={true} onOpenChange={() => {}} direction="down">
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      const actions = container.querySelector(".motile-speed-dial__actions");
      expect(actions).toHaveAttribute("data-direction", "down");
    });

    // color CSS variable
    it("color가 CSS 변수로 주입됨", () => {
      const { container } = render(
        <SpeedDial.Root open={false} onOpenChange={() => {}} color="#10b981">
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      const speedDial = container.querySelector(".motile-speed-dial");
      expect(speedDial).toHaveStyle({ "--motile-speeddial-color": "#10b981" });
    });

    // defaultPrevented 체크
    it("이벤트가 방지되면 토글되지 않음", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      const onClick = vi.fn((e) => e.preventDefault());

      render(
        <SpeedDial.Root open={false} onOpenChange={onOpenChange}>
          <SpeedDial.Trigger onClick={onClick}>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      await user.click(screen.getByRole("button", { name: "Open" }));

      expect(onClick).toHaveBeenCalled();
      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe("Compound Component 패턴", () => {
    // Context 에러
    it("Root 밖에서 사용되면 에러를 발생시킴", () => {
      // Suppress console.error for this test
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<SpeedDial.Trigger>Open</SpeedDial.Trigger>);
      }).toThrow(
        "SpeedDial compound components must be used within SpeedDial.Root"
      );

      spy.mockRestore();
    });

    // Action onClick
    it("action 클릭 시 onClick이 호출됨", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();

      render(
        <SpeedDial.Root open={true} onOpenChange={() => {}}>
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action onClick={onClick}>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      await user.click(screen.getByRole("menuitem", { name: "Action 1" }));

      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("Hooks 통합", () => {
    // 외부 클릭 닫기 (true)
    it("closeOnClickOutside가 true면 외부 클릭 시 닫힘", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <div>
          <div data-testid="outside">Outside</div>
          <SpeedDial.Root
            open={true}
            onOpenChange={onOpenChange}
            closeOnClickOutside={true}
          >
            <SpeedDial.Trigger>Open</SpeedDial.Trigger>
            <SpeedDial.Actions>
              <SpeedDial.Action>Action 1</SpeedDial.Action>
            </SpeedDial.Actions>
          </SpeedDial.Root>
        </div>
      );

      await user.click(screen.getByTestId("outside"));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    // 외부 클릭 무시 (false)
    it("closeOnClickOutside가 false면 외부 클릭 시 닫히지 않음", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <div>
          <div data-testid="outside">Outside</div>
          <SpeedDial.Root
            open={true}
            onOpenChange={onOpenChange}
            closeOnClickOutside={false}
          >
            <SpeedDial.Trigger>Open</SpeedDial.Trigger>
            <SpeedDial.Actions>
              <SpeedDial.Action>Action 1</SpeedDial.Action>
            </SpeedDial.Actions>
          </SpeedDial.Root>
        </div>
      );

      await user.click(screen.getByTestId("outside"));

      expect(onOpenChange).not.toHaveBeenCalled();
    });

    // ESC 닫기 (true)
    it("closeOnEscapeKey가 true면 ESC 키로 닫힘", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <SpeedDial.Root
          open={true}
          onOpenChange={onOpenChange}
          closeOnEscapeKey={true}
        >
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      await user.keyboard("{Escape}");

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    // ESC 무시 (false)
    it("closeOnEscapeKey가 false면 ESC 키로 닫히지 않음", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();

      render(
        <SpeedDial.Root
          open={true}
          onOpenChange={onOpenChange}
          closeOnEscapeKey={false}
        >
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      await user.keyboard("{Escape}");

      expect(onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe("AsChild 패턴", () => {
    // Trigger asChild
    it("asChild가 true면 커스텀 trigger 엘리먼트가 렌더링됨", () => {
      render(
        <SpeedDial.Root open={false} onOpenChange={() => {}}>
          <SpeedDial.Trigger asChild>
            <a href="/home">Custom Trigger</a>
          </SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      const link = screen.getByRole("link", { name: "Custom Trigger" });
      expect(link).toBeInTheDocument();
      expect(link).toHaveClass("motile-speed-dial__trigger");
      expect(link).toHaveAttribute("href", "/home");
    });

    // Action asChild
    it("asChild가 true면 커스텀 action 엘리먼트가 렌더링됨", () => {
      render(
        <SpeedDial.Root open={true} onOpenChange={() => {}}>
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action asChild>
              <a href="/action">Custom Action</a>
            </SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      const action = screen.getByRole("menuitem", { name: "Custom Action" });
      expect(action).toBeInTheDocument();
      expect(action).toHaveClass("motile-speed-dial__action");
      expect(action).toHaveAttribute("href", "/action");
      expect(action.tagName).toBe("A");
    });
  });

  describe("CSS 변수와 Children", () => {
    // --action-index 주입
    it("action children에 --action-index가 주입됨", () => {
      const { container } = render(
        <SpeedDial.Root open={true} onOpenChange={() => {}}>
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action data-testid="action-0">Action 1</SpeedDial.Action>
            <SpeedDial.Action data-testid="action-1">Action 2</SpeedDial.Action>
            <SpeedDial.Action data-testid="action-2">Action 3</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      const action0 = container.querySelector('[data-testid="action-0"]');
      const action1 = container.querySelector('[data-testid="action-1"]');
      const action2 = container.querySelector('[data-testid="action-2"]');

      expect(action0?.getAttribute("style")).toContain("--action-index");
      expect(action1?.getAttribute("style")).toContain("--action-index");
      expect(action2?.getAttribute("style")).toContain("--action-index");
    });
  });

  describe("접근성", () => {
    // aria-expanded
    it("open 상태에 따라 aria-expanded가 설정됨", () => {
      const { rerender } = render(
        <SpeedDial.Root open={false} onOpenChange={() => {}}>
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute(
        "aria-expanded",
        "false"
      );

      rerender(
        <SpeedDial.Root open={true} onOpenChange={() => {}}>
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute(
        "aria-expanded",
        "true"
      );
    });

    // aria-haspopup
    it("trigger에 aria-haspopup='menu'가 있음", () => {
      render(
        <SpeedDial.Root open={false} onOpenChange={() => {}}>
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      expect(screen.getByRole("button", { name: "Open" })).toHaveAttribute(
        "aria-haspopup",
        "menu"
      );
    });

    // role="menu"
    it("actions container에 role='menu'가 있음", () => {
      render(
        <SpeedDial.Root open={true} onOpenChange={() => {}}>
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      expect(screen.getByRole("menu")).toBeInTheDocument();
    });

    // aria-labelledby
    it("actions가 trigger와 aria-labelledby로 연결됨", () => {
      render(
        <SpeedDial.Root open={true} onOpenChange={() => {}}>
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      const trigger = screen.getByRole("button", { name: "Open" });
      const triggerId = trigger.id;
      const actions = screen.getByRole("menu");

      expect(actions).toHaveAttribute("aria-labelledby", triggerId);
    });

    // role="menuitem"
    it("action 버튼에 role='menuitem'이 있음", () => {
      render(
        <SpeedDial.Root open={true} onOpenChange={() => {}}>
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      expect(
        screen.getByRole("menuitem", { name: "Action 1" })
      ).toBeInTheDocument();
    });
  });

  describe("Ref 전달", () => {
    // Trigger ref
    it("trigger 버튼으로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(
        <SpeedDial.Root open={false} onOpenChange={() => {}}>
          <SpeedDial.Trigger ref={ref}>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe("Open");
    });

    // Actions ref
    it("actions container로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <SpeedDial.Root open={true} onOpenChange={() => {}}>
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions ref={ref}>
            <SpeedDial.Action>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.getAttribute("role")).toBe("menu");
    });

    // Action ref
    it("action 버튼으로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(
        <SpeedDial.Root open={true} onOpenChange={() => {}}>
          <SpeedDial.Trigger>Open</SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action ref={ref}>Action 1</SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.textContent).toBe("Action 1");
    });
  });
});
