import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, waitFor } from "@/test/utils";
import { Popover } from "./Popover";

describe("Popover", () => {
  describe("핵심 기능", () => {
    // Trigger 클릭으로 열림/닫힘 토글
    it("Trigger 클릭 시 popover가 토글됨", async () => {
      const user = userEvent.setup();

      render(
        <Popover.Root>
          <Popover.Trigger asChild>
            <button>Toggle</button>
          </Popover.Trigger>
          <Popover.Content>Popover Content</Popover.Content>
        </Popover.Root>
      );

      // 초기: 닫혀있음
      expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();

      // 클릭 → 열림
      await user.click(screen.getByText("Toggle"));
      expect(screen.getByText("Popover Content")).toBeInTheDocument();

      // 다시 클릭 → 닫힘
      await user.click(screen.getByText("Toggle"));
      expect(screen.queryByText("Popover Content")).not.toBeInTheDocument();
    });

    // open일 때만 Content 렌더링
    it("open 상태일 때만 content가 렌더링됨", () => {
      const { rerender } = render(
        <Popover.Root open={false}>
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      // 닫혀있을 때: 렌더링 안 됨
      expect(screen.queryByText("Content")).not.toBeInTheDocument();

      // 열릴 때: 렌더링됨
      rerender(
        <Popover.Root open={true}>
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    // role="dialog" + aria-modal="false"
    it("content에 role='dialog'과 aria-modal 속성이 있음", () => {
      const { container } = render(
        <Popover.Root open={true}>
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      const content = container.querySelector(".motile-popover-content");
      expect(content).toHaveAttribute("role", "dialog");
      expect(content).toHaveAttribute("aria-modal", "false");
    });

    // Trigger: aria-expanded + aria-controls
    it("Trigger에 aria-expanded와 aria-controls 속성이 있음", async () => {
      const user = userEvent.setup();

      render(
        <Popover.Root>
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      const trigger = screen.getByRole("button");

      // 초기: aria-expanded="false"
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveAttribute("aria-controls");

      // 클릭 후: aria-expanded="true"
      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    // Trigger 기본 button 래핑 (asChild=false)
    it("기본적으로 Trigger children을 button으로 래핑함", () => {
      render(
        <Popover.Root>
          <Popover.Trigger>
            <span data-testid="trigger-child">Click me</span>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("type", "button");
      expect(screen.getByTestId("trigger-child")).toBeInTheDocument();
    });
  });

  describe("Context", () => {
    // Root 밖에서 사용 시 에러
    it("Root 밖에서 컴포넌트 사용 시 에러 발생", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
        );
      }).toThrow("Popover components must be used within Popover.Root");

      consoleError.mockRestore();
    });
  });

  describe("제어/비제어 모드", () => {
    // defaultOpen으로 uncontrolled
    it("defaultOpen으로 비제어 컴포넌트로 동작함", () => {
      render(
        <Popover.Root defaultOpen={true}>
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      // 초기부터 열려있음
      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    // open prop으로 controlled
    it("open prop으로 제어 컴포넌트로 동작함", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      const { rerender } = render(
        <Popover.Root open={false} onOpenChange={handleOpenChange}>
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      // 초기: 닫혀있음
      expect(screen.queryByText("Content")).not.toBeInTheDocument();

      // Trigger 클릭 → onOpenChange 호출되지만 상태는 외부에서 제어
      await user.click(screen.getByText("Trigger"));
      expect(handleOpenChange).toHaveBeenCalledWith(true);
      expect(screen.queryByText("Content")).not.toBeInTheDocument(); // 아직 닫힘

      // 외부에서 open=true로 변경
      rerender(
        <Popover.Root open={true} onOpenChange={handleOpenChange}>
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      expect(screen.getByText("Content")).toBeInTheDocument();
    });

    // onOpenChange 콜백
    it("토글 시 onOpenChange가 호출됨", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Popover.Root onOpenChange={handleOpenChange}>
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      // 열기
      await user.click(screen.getByText("Trigger"));
      expect(handleOpenChange).toHaveBeenCalledWith(true);

      // 닫기
      handleOpenChange.mockClear();
      await user.click(screen.getByText("Trigger"));
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("위치 설정", () => {
    // position="top" → data-placement
    it("position이 data-placement로 적용됨", () => {
      const { container } = render(
        <Popover.Root open={true} position="top">
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      const content = container.querySelector(".motile-popover-content");
      expect(content).toHaveAttribute("data-placement", "top");
    });

    // position="bottom" → data-placement
    it("다양한 position을 지원함", () => {
      const { container } = render(
        <Popover.Root open={true} position="bottom">
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      const content = container.querySelector(".motile-popover-content");
      expect(content).toHaveAttribute("data-placement", "bottom");
    });

    // align="center" (기본값)
    it("기본적으로 center 정렬을 사용함", () => {
      const { container } = render(
        <Popover.Root open={true}>
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      const content = container.querySelector(".motile-popover-content");
      expect(content).toHaveAttribute("data-align", "center");
    });

    // align="start"/"end"
    it("다양한 정렬을 지원함", () => {
      const { container, rerender } = render(
        <Popover.Root open={true} align="start">
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      let content = container.querySelector(".motile-popover-content");
      expect(content).toHaveAttribute("data-align", "start");

      rerender(
        <Popover.Root open={true} align="end">
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      content = container.querySelector(".motile-popover-content");
      expect(content).toHaveAttribute("data-align", "end");
    });

    // position + align 조합
    it("position과 align이 조합됨", () => {
      const { container } = render(
        <Popover.Root open={true} position="left" align="start">
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      const content = container.querySelector(".motile-popover-content");
      expect(content).toHaveAttribute("data-placement", "left");
      expect(content).toHaveAttribute("data-align", "start");
    });
  });

  describe("닫기 방법", () => {
    // ESC 키로 닫기
    it("autoClose가 true면 ESC 키로 닫힘", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Popover.Root open={true} onOpenChange={handleOpenChange}>
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    // 외부 클릭으로 닫기
    it("autoClose가 true면 외부 클릭으로 닫힘", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <div>
          <div data-testid="outside">Outside</div>
          <Popover.Root open={true} onOpenChange={handleOpenChange}>
            <Popover.Trigger asChild>
              <button>Trigger</button>
            </Popover.Trigger>
            <Popover.Content>Content</Popover.Content>
          </Popover.Root>
        </div>
      );

      await user.click(screen.getByTestId("outside"));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    // autoClose=false
    it("autoClose가 false면 닫히지 않음", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <div>
          <div data-testid="outside">Outside</div>
          <Popover.Root
            open={true}
            autoClose={false}
            onOpenChange={handleOpenChange}
          >
            <Popover.Trigger asChild>
              <button>Trigger</button>
            </Popover.Trigger>
            <Popover.Content>Content</Popover.Content>
          </Popover.Root>
        </div>
      );

      // ESC 키로도 안 닫힘
      await user.keyboard("{Escape}");
      expect(handleOpenChange).not.toHaveBeenCalled();

      // 외부 클릭으로도 안 닫힘
      await user.click(screen.getByTestId("outside"));
      expect(handleOpenChange).not.toHaveBeenCalled();
    });
  });

  describe("Variant와 화살표", () => {
    // variant="filled" (기본값)
    it("기본적으로 filled variant를 사용함", () => {
      const { container } = render(
        <Popover.Root open={true}>
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      const content = container.querySelector(".motile-popover-content");
      expect(content).toHaveClass("motile-popover-content--filled");
    });

    // variant="filled"
    it("filled variant를 지원함", () => {
      const { container } = render(
        <Popover.Root open={true} variant="filled">
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      const content = container.querySelector(".motile-popover-content");
      expect(content).toHaveClass("motile-popover-content--filled");
    });

    // showArrow + arrow 렌더링
    it("showArrow가 true면 화살표가 렌더링됨", () => {
      const { container } = render(
        <Popover.Root
          open={true}
          showArrow={true}
          position="top"
          align="center"
        >
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      const content = container.querySelector(".motile-popover-content");
      const arrow = content?.querySelector(".motile-popover-arrow");

      expect(arrow).toBeInTheDocument();
      // arrow는 부모 content의 data-placement/data-align 속성으로 CSS 스타일링됨
      expect(content).toHaveAttribute("data-placement", "top");
      expect(content).toHaveAttribute("data-align", "center");
    });
  });

  describe("커스텀 Props", () => {
    // color CSS variable
    it("color가 CSS 변수로 적용됨", () => {
      const { container } = render(
        <Popover.Root open={true} color="#ff0000">
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      const content = container.querySelector(".motile-popover-content");
      expect(content).toHaveStyle({ "--motile-popover-color": "#ff0000" });
    });

    // bounceCount (number + data-bounce)
    it("bounceCount가 CSS 변수와 data 속성으로 적용됨", () => {
      const { container } = render(
        <Popover.Root open={true} bounceCount={3}>
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      const content = container.querySelector(".motile-popover-content");
      expect(content).toHaveStyle({ "--bounce-count": "3" });
      expect(content).toHaveAttribute("data-bounce", "true");
    });

    // bounceCount="infinite"
    it("무한 bounceCount를 지원함", () => {
      const { container } = render(
        <Popover.Root open={true} bounceCount="infinite">
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      const content = container.querySelector(".motile-popover-content");
      expect(content).toHaveStyle({ "--bounce-count": "infinite" });
      expect(content).toHaveAttribute("data-bounce", "true");
    });

    // zIndex
    it("커스텀 zIndex가 적용됨", () => {
      const { container } = render(
        <Popover.Root open={true} zIndex={100}>
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      const content = container.querySelector(".motile-popover-content");
      expect(content).toHaveStyle({ zIndex: "100" });
    });
  });

  describe("AsChild 패턴", () => {
    // Trigger asChild
    it("asChild가 true면 Trigger가 자식 엘리먼트로 렌더링됨", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Popover.Root onOpenChange={handleOpenChange}>
          <Popover.Trigger asChild>
            <a href="#" data-testid="custom-trigger">
              Click me
            </a>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      const trigger = screen.getByTestId("custom-trigger");
      expect(trigger.tagName).toBe("A");
      expect(trigger).toHaveAttribute("aria-expanded", "false");

      await user.click(trigger);
      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });
  });

  describe("콜백", () => {
    // onClickOutside 호출
    it("외부 클릭 시 onClickOutside가 호출됨", async () => {
      const user = userEvent.setup();
      const handleClickOutside = vi.fn();

      render(
        <div>
          <div data-testid="outside">Outside</div>
          <Popover.Root open={true} onClickOutside={handleClickOutside}>
            <Popover.Trigger asChild>
              <button>Trigger</button>
            </Popover.Trigger>
            <Popover.Content>Content</Popover.Content>
          </Popover.Root>
        </div>
      );

      await user.click(screen.getByTestId("outside"));

      await waitFor(() => {
        expect(handleClickOutside).toHaveBeenCalled();
      });
    });

    // onDismiss (ESC)
    it("ESC 키 입력 시 onDismiss가 호출됨", async () => {
      const user = userEvent.setup();
      const handleDismiss = vi.fn();

      render(
        <Popover.Root open={true} onDismiss={handleDismiss}>
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content>Content</Popover.Content>
        </Popover.Root>
      );

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(handleDismiss).toHaveBeenCalled();
      });
    });

    // onDismiss (외부 클릭)
    it("외부 클릭 시 onDismiss가 호출됨", async () => {
      const user = userEvent.setup();
      const handleDismiss = vi.fn();

      render(
        <div>
          <div data-testid="outside">Outside</div>
          <Popover.Root open={true} onDismiss={handleDismiss}>
            <Popover.Trigger asChild>
              <button>Trigger</button>
            </Popover.Trigger>
            <Popover.Content>Content</Popover.Content>
          </Popover.Root>
        </div>
      );

      await user.click(screen.getByTestId("outside"));

      await waitFor(() => {
        expect(handleDismiss).toHaveBeenCalled();
      });
    });
  });

  describe("Props 전달", () => {
    // className
    it("content에 커스텀 className이 적용됨", () => {
      const { container } = render(
        <Popover.Root open={true}>
          <Popover.Trigger asChild>
            <button>Trigger</button>
          </Popover.Trigger>
          <Popover.Content className="custom-popover">Content</Popover.Content>
        </Popover.Root>
      );

      const content = container.querySelector(".motile-popover-content");
      expect(content).toHaveClass("motile-popover-content");
      expect(content).toHaveClass("custom-popover");
    });
  });
});
