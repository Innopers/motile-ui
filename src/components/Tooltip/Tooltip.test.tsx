import { describe, it, expect, vi, beforeAll, afterEach } from "vitest";
import { render, screen, userEvent, waitFor } from "@/test/utils";
import { Tooltip } from "./Tooltip";

const {
  Root: TooltipRoot,
  Trigger: TooltipTrigger,
  Content: TooltipContent,
} = Tooltip;

describe("Tooltip", () => {
  beforeAll(() => {
    // JSDOM에 ResizeObserver가 없으면 mock 추가
    if (!global.ResizeObserver) {
      global.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      } as any;
    }
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("복합 컴포넌트와 Context", () => {
    it("TooltipRoot가 children을 렌더링함", () => {
      render(
        <TooltipRoot>
          <div data-testid="child">Child content</div>
        </TooltipRoot>
      );

      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("TooltipRoot 밖에서 TooltipTrigger 사용 시 에러 발생", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
        );
      }).toThrow("Tooltip components must be used within Tooltip.Root");

      spy.mockRestore();
    });

    it("TooltipRoot 밖에서 TooltipContent 사용 시 에러 발생", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(<TooltipContent>Content</TooltipContent>);
      }).toThrow("Tooltip components must be used within Tooltip.Root");

      spy.mockRestore();
    });
  });

  describe("Trigger 상호작용", () => {
    it("마우스를 올리면 tooltip이 표시되고 떼면 사라짐", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot>
          <TooltipTrigger>
            <button>Hover me</button>
          </TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </TooltipRoot>
      );

      const trigger = screen.getByRole("button");

      // 초기: tooltip 없음
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

      // hover → tooltip 표시
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
        expect(screen.getByText("Tooltip content")).toBeInTheDocument();
      });

      // unhover → tooltip 사라짐
      await user.unhover(trigger);

      await waitFor(() => {
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      });
    });

    it("포커스하면 tooltip이 표시되고 블러하면 사라짐", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot>
          <TooltipTrigger>
            <button>Focus me</button>
          </TooltipTrigger>
          <TooltipContent>Tooltip content</TooltipContent>
        </TooltipRoot>
      );

      const trigger = screen.getByRole("button");

      // focus → tooltip 표시
      await user.tab();
      expect(trigger).toHaveFocus();

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });

      // blur → tooltip 사라짐
      await user.tab();

      await waitFor(() => {
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      });
    });

    it("aria-describedby로 trigger와 content가 연결됨", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot>
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </TooltipRoot>
      );

      const trigger = screen.getByRole("button");

      // hover로 tooltip 열기
      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole("tooltip");
        const tooltipId = tooltip.id;

        // ID는 React useId 형식 (예: r3-tooltip)
        expect(tooltipId).toBeTruthy();
        expect(trigger).toHaveAttribute("aria-describedby", tooltipId);
      });
    });

    it("커스텀 tabIndex가 유지됨", () => {
      render(
        <TooltipRoot>
          <TooltipTrigger>
            <button tabIndex={5}>Custom tabIndex</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </TooltipRoot>
      );

      const trigger = screen.getByRole("button");
      expect(trigger).toHaveAttribute("tabIndex", "5");
    });

    it("trigger에서 asChild 패턴을 지원함", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot>
          <TooltipTrigger asChild>
            <a href="#" data-testid="custom-trigger">
              Custom trigger
            </a>
          </TooltipTrigger>
          <TooltipContent>Tooltip</TooltipContent>
        </TooltipRoot>
      );

      const trigger = screen.getByTestId("custom-trigger");

      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });
    });
  });

  describe("Content 표시", () => {
    it("Portal을 통해 document.body에 tooltip이 렌더링됨", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot>
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Portal content</TooltipContent>
        </TooltipRoot>
      );

      await user.hover(screen.getByRole("button"));

      await waitFor(() => {
        const tooltip = screen.getByRole("tooltip");
        expect(document.body.contains(tooltip)).toBe(true);
      });
    });

    it("content에 role='tooltip' 속성이 있음", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot>
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </TooltipRoot>
      );

      await user.hover(screen.getByRole("button"));

      await waitFor(() => {
        const tooltip = screen.getByRole("tooltip");
        expect(tooltip).toHaveAttribute("role", "tooltip");
      });
    });

    it("닫혀있을 때 content가 렌더링되지 않음", () => {
      render(
        <TooltipRoot>
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </TooltipRoot>
      );

      // 초기: tooltip 렌더링 안 됨
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
    });

    it("open 상태에 따라 content가 조건부 렌더링됨", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot>
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Dynamic content</TooltipContent>
        </TooltipRoot>
      );

      // 초기: 렌더링 안 됨
      expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();

      // hover → 표시
      await user.hover(screen.getByRole("button"));

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });
    });
  });

  describe("keepOpen 모드", () => {
    it("keepOpen이 없으면 마우스 떼자마자 즉시 닫힘", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot>
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </TooltipRoot>
      );

      const trigger = screen.getByRole("button");

      // hover → tooltip 표시
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });

      // unhover → 즉시 닫힘 (delay = 0)
      await user.unhover(trigger);

      await waitFor(() => {
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      });
    });

    it("keepOpen이 있으면 100ms 딜레이 후 닫힘", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot keepOpen>
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </TooltipRoot>
      );

      const trigger = screen.getByRole("button");

      // hover → tooltip 표시
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });

      // unhover → tooltip은 100ms 딜레이 후 닫힘
      await user.unhover(trigger);

      // 최종적으로 닫힘 (100ms 딜레이 있음)
      await waitFor(
        () => {
          expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
        },
        { timeout: 300 }
      );
    });

    it("keepOpen이 활성화되면 data-keep-open 속성이 있음", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot keepOpen>
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </TooltipRoot>
      );

      const trigger = screen.getByRole("button");

      // hover trigger → tooltip 표시
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });

      // keepOpen이 활성화되어 있는지 확인 (data attribute)
      const tooltip = screen.getByRole("tooltip");
      expect(tooltip).toHaveAttribute("data-keep-open");
    });
  });

  describe("스크롤 동작", () => {
    it("윈도우 스크롤 시 tooltip이 닫힘", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot>
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </TooltipRoot>
      );

      const trigger = screen.getByRole("button");

      // hover → tooltip 열기
      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });

      // scroll 이벤트 발생
      window.dispatchEvent(new Event("scroll", { bubbles: true }));

      // tooltip 닫힘
      await waitFor(() => {
        expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
      });
    });
  });

  describe("Props와 스타일링", () => {
    it("position prop이 data-placement 속성으로 적용됨", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot position="bottom">
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </TooltipRoot>
      );

      await user.hover(screen.getByRole("button"));

      await waitFor(() => {
        const tooltip = screen.getByRole("tooltip");
        // position은 계산 후 data-placement로 반영
        expect(tooltip).toHaveAttribute("data-placement", "bottom");
      });
    });

    it("기본적으로 filled variant를 사용함", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot>
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </TooltipRoot>
      );

      await user.hover(screen.getByRole("button"));

      await waitFor(() => {
        const tooltip = screen.getByRole("tooltip");
        expect(tooltip).toHaveClass("motile-tooltip-bubble--filled");
      });
    });

    it("variant prop에 따라 클래스가 적용됨", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot variant="outlined">
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </TooltipRoot>
      );

      await user.hover(screen.getByRole("button"));

      await waitFor(() => {
        const tooltip = screen.getByRole("tooltip");
        expect(tooltip).toHaveClass("motile-tooltip-bubble--outlined");
      });
    });

    it("showArrow가 true면 data-show-arrow 속성이 설정됨", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot showArrow>
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </TooltipRoot>
      );

      await user.hover(screen.getByRole("button"));

      await waitFor(() => {
        const tooltip = screen.getByRole("tooltip");
        expect(tooltip).toHaveAttribute("data-show-arrow");
      });
    });

    it("color prop이 CSS 변수로 적용됨", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot color="#10b981">
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </TooltipRoot>
      );

      await user.hover(screen.getByRole("button"));

      await waitFor(() => {
        const tooltip = screen.getByRole("tooltip");
        expect(tooltip.style.getPropertyValue("--motile-tooltip-color")).toBe(
          "#10b981"
        );
      });
    });

    it("outlined variant와 arrow를 함께 사용할 수 있음", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot variant="outlined" showArrow>
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </TooltipRoot>
      );

      await user.hover(screen.getByRole("button"));

      await waitFor(() => {
        const tooltip = screen.getByRole("tooltip");
        expect(tooltip).toHaveClass("motile-tooltip-bubble--outlined");
        expect(tooltip).toHaveAttribute("data-show-arrow");
      });
    });
  });

  describe("AsChild 패턴", () => {
    it("TooltipTrigger에서 asChild를 지원함", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot>
          <TooltipTrigger asChild>
            <div data-testid="custom-trigger">Custom element</div>
          </TooltipTrigger>
          <TooltipContent>Content</TooltipContent>
        </TooltipRoot>
      );

      const trigger = screen.getByTestId("custom-trigger");

      await user.hover(trigger);

      await waitFor(() => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      });
    });
  });

  describe("접근성", () => {
    it("스크린 리더를 위한 role='tooltip' 속성이 있음", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot>
          <TooltipTrigger>
            <button>Accessible trigger</button>
          </TooltipTrigger>
          <TooltipContent>Accessible content</TooltipContent>
        </TooltipRoot>
      );

      await user.hover(screen.getByRole("button"));

      await waitFor(() => {
        const tooltip = screen.getByRole("tooltip");
        expect(tooltip).toHaveTextContent("Accessible content");
      });
    });

    it("aria-describedby로 trigger와 content가 연결됨", async () => {
      const user = userEvent.setup();

      render(
        <TooltipRoot>
          <TooltipTrigger>
            <button>Trigger</button>
          </TooltipTrigger>
          <TooltipContent>Description text</TooltipContent>
        </TooltipRoot>
      );

      const trigger = screen.getByRole("button");

      await user.hover(trigger);

      await waitFor(() => {
        const tooltip = screen.getByRole("tooltip");
        const tooltipId = tooltip.id;

        expect(trigger).toHaveAttribute("aria-describedby", tooltipId);
        expect(tooltip).toHaveAttribute("id", tooltipId);
      });
    });
  });
});
