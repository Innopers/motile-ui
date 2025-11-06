import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, waitFor } from "@/test/utils";
import { Sheet } from "./Sheet";

describe("Sheet", () => {
  describe("핵심 기능", () => {
    // 기본 렌더링: closed 상태에서는 보이지 않음
    it("닫힌 상태일 때 content가 렌더링되지 않음", () => {
      render(
        <Sheet.Root>
          <Sheet.Trigger asChild>
            <button>Open Sheet</button>
          </Sheet.Trigger>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
              <Sheet.Body>Sheet Content</Sheet.Body>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      expect(
        screen.getByRole("button", { name: "Open Sheet" })
      ).toBeInTheDocument();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    // open={true}로 열기
    it("open이 true일 때 content가 렌더링됨", async () => {
      render(
        <Sheet.Root open={true}>
          <Sheet.Trigger asChild>
            <button>Open Sheet</button>
          </Sheet.Trigger>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
              <Sheet.Body>Sheet Content</Sheet.Body>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    // Trigger 클릭으로 열기
    it("Trigger 클릭 시 열림", async () => {
      const user = userEvent.setup();

      render(
        <Sheet.Root>
          <Sheet.Trigger asChild>
            <button>Open Sheet</button>
          </Sheet.Trigger>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
              <Sheet.Body>Sheet Content</Sheet.Body>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await user.click(screen.getByRole("button", { name: "Open Sheet" }));

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    // defaultOpen (uncontrolled)
    it("비제어 모드에서 defaultOpen을 지원함", async () => {
      render(
        <Sheet.Root defaultOpen={true}>
          <Sheet.Trigger asChild>
            <button>Open Sheet</button>
          </Sheet.Trigger>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
              <Sheet.Body>Sheet Content</Sheet.Body>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    // open + onOpenChange (controlled)
    it("제어 모드에서 open과 onOpenChange를 지원함", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Sheet.Root open={false} onOpenChange={handleOpenChange}>
          <Sheet.Trigger asChild>
            <button>Open Sheet</button>
          </Sheet.Trigger>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
              <Sheet.Body>Sheet Content</Sheet.Body>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await user.click(screen.getByRole("button", { name: "Open Sheet" }));
      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });

    // position left/right
    it("올바른 position 클래스가 적용됨", async () => {
      const { rerender } = render(
        <Sheet.Root open={true} position="left">
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() => {
        const content = screen.getByRole("dialog");
        expect(content).toHaveClass("motile-sheet__content--left");
      });

      rerender(
        <Sheet.Root open={true} position="right">
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() => {
        const content = screen.getByRole("dialog");
        expect(content).toHaveClass("motile-sheet__content--right");
      });
    });
  });

  describe("하위 컴포넌트", () => {
    // Trigger 렌더링
    it("Trigger 컴포넌트가 렌더링됨", () => {
      render(
        <Sheet.Root>
          <Sheet.Trigger asChild>
            <button>Open Sheet</button>
          </Sheet.Trigger>
        </Sheet.Root>
      );

      expect(
        screen.getByRole("button", { name: "Open Sheet" })
      ).toBeInTheDocument();
    });

    // Overlay 렌더링
    it("열렸을 때 Overlay가 렌더링됨", async () => {
      render(
        <Sheet.Root open={true}>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() => {
        expect(screen.getByRole("presentation")).toBeInTheDocument();
      });
    });

    // Content 렌더링
    it("Content가 dialog role로 렌더링됨", async () => {
      render(
        <Sheet.Root open={true}>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() => {
        expect(screen.getByRole("dialog")).toBeInTheDocument();
      });
    });

    // Header 렌더링
    it("Header 컴포넌트가 렌더링됨", async () => {
      render(
        <Sheet.Root open={true}>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Header>
                <Sheet.Title>Sheet Title</Sheet.Title>
              </Sheet.Header>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() => {
        const header = document.querySelector(".motile-sheet__header");
        expect(header).toBeTruthy();
      });
    });

    // Title 렌더링
    it("Title 컴포넌트가 렌더링됨", async () => {
      render(
        <Sheet.Root open={true}>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() => {
        expect(screen.getByText("Sheet Title")).toBeInTheDocument();
      });
    });

    // Body 렌더링
    it("Body 컴포넌트가 렌더링됨", async () => {
      render(
        <Sheet.Root open={true}>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
              <Sheet.Body>Sheet Body Content</Sheet.Body>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() => {
        expect(screen.getByText("Sheet Body Content")).toBeInTheDocument();
      });
    });

    // Close 렌더링
    it("Close 버튼이 렌더링됨", async () => {
      render(
        <Sheet.Root open={true}>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
              <Sheet.Close>
                <></>
              </Sheet.Close>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() => {
        expect(screen.getByLabelText("닫기")).toBeInTheDocument();
      });
    });
  });

  describe("닫기 동작", () => {
    // Close 버튼 클릭
    it("Close 버튼 클릭 시 닫힘", async () => {
      const user = userEvent.setup();

      render(
        <Sheet.Root defaultOpen={true}>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
              <Sheet.Close>
                <></>
              </Sheet.Close>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() =>
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      );

      await user.click(screen.getByLabelText("닫기"));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    // Escape 키로 닫기
    it("Escape 키를 누르면 닫힘", async () => {
      const user = userEvent.setup();

      render(
        <Sheet.Root defaultOpen={true}>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() =>
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      );

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    // Overlay 클릭으로 닫기
    it("overlay 클릭 시 닫힘", async () => {
      const user = userEvent.setup();

      render(
        <Sheet.Root defaultOpen={true}>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() =>
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      );

      await user.click(screen.getByRole("presentation"));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    // useClickOutside로 닫기 (Content 밖 클릭)
    it("sheet content 밖을 클릭하면 닫힘", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <div data-testid="outside">Outside Element</div>
          <Sheet.Root defaultOpen={true}>
            <Sheet.Portal>
              <Sheet.Overlay />
              <Sheet.Content>
                <Sheet.Title>Sheet Title</Sheet.Title>
              </Sheet.Content>
            </Sheet.Portal>
          </Sheet.Root>
        </div>
      );

      await waitFor(() =>
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      );

      await user.click(screen.getByTestId("outside"));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    // closeOnBackdrop=false (둘 다 막기)
    it("closeOnBackdrop이 false면 backdrop으로 닫히지 않음", async () => {
      const user = userEvent.setup();

      render(
        <Sheet.Root defaultOpen={true} closeOnBackdrop={false}>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() =>
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      );

      // Escape 키 - 막혀야 함
      await user.keyboard("{Escape}");
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Overlay 클릭 - 막혀야 함
      await user.click(screen.getByRole("presentation"));
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // closeOnBackdrop 개별 제어
    it("closeOnBackdrop으로 개별 제어를 지원함", async () => {
      const user = userEvent.setup();

      render(
        <Sheet.Root
          defaultOpen={true}
          closeOnBackdrop={{ escapeKey: false, clickOutside: true }}
        >
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() =>
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      );

      // Escape 키 - 막혀야 함
      await user.keyboard("{Escape}");
      expect(screen.getByRole("dialog")).toBeInTheDocument();

      // Overlay 클릭 - 닫혀야 함
      await user.click(screen.getByRole("presentation"));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });
  });

  describe("접근성", () => {
    // role="dialog", aria-modal="true"
    it("올바른 ARIA 속성을 가짐", async () => {
      render(
        <Sheet.Root open={true}>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(dialog).toHaveAttribute("aria-modal", "true");
      });
    });

    // Trigger aria-expanded, aria-controls
    it("Trigger에 올바른 ARIA 속성이 있음", async () => {
      const user = userEvent.setup();

      render(
        <Sheet.Root>
          <Sheet.Trigger asChild>
            <button>Open Sheet</button>
          </Sheet.Trigger>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      const trigger = screen.getByRole("button", { name: "Open Sheet" });
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveAttribute("aria-controls");

      await user.click(trigger);

      await waitFor(() => {
        expect(trigger).toHaveAttribute("aria-expanded", "true");
      });
    });

    // Title 렌더링 및 id 확인
    it("Title이 고정된 id로 렌더링됨", async () => {
      render(
        <Sheet.Root open={true}>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() => {
        const title = screen.getByText("Sheet Title");
        expect(title).toHaveAttribute("id", "sheet-title");
      });
    });
  });

  describe("뒤로가기로 닫기 (모바일)", () => {
    // popstate 이벤트로 닫기
    it("popstate 이벤트 발생 시 닫힘", async () => {
      render(
        <Sheet.Root defaultOpen={true}>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() =>
        expect(screen.getByRole("dialog")).toBeInTheDocument()
      );

      // popstate 이벤트 dispatch
      window.dispatchEvent(new PopStateEvent("popstate"));

      await waitFor(() => {
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
      });
    });

    // 이미 닫힌 상태에서 popstate (무시)
    it("이미 닫힌 상태에서 popstate를 무시함", () => {
      render(
        <Sheet.Root>
          <Sheet.Trigger asChild>
            <button>Open Sheet</button>
          </Sheet.Trigger>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      // popstate 이벤트 dispatch (닫힌 상태)
      window.dispatchEvent(new PopStateEvent("popstate"));

      // 여전히 닫혀있어야 함
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Portal과 스타일", () => {
    // Portal to document.body
    it("Portal을 통해 document.body에 content가 렌더링됨", async () => {
      const { baseElement } = render(
        <Sheet.Root open={true}>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() => {
        const content = screen.getByRole("dialog");
        expect(baseElement.contains(content)).toBe(true);
      });
    });

    // Portal to custom container
    it("커스텀 container가 제공되면 해당 container에 렌더링됨", async () => {
      const container = document.createElement("div");
      container.setAttribute("id", "custom");
      document.body.appendChild(container);

      render(
        <Sheet.Root open={true}>
          <Sheet.Portal container={container}>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() => {
        const dialog = screen.getByRole("dialog");
        expect(container.contains(dialog)).toBe(true);
      });

      document.body.removeChild(container);
    });

    // maxWidth prop (CSS variable)
    it("maxWidth가 CSS 변수로 적용됨", async () => {
      render(
        <Sheet.Root open={true} maxWidth="500px">
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() => {
        const content = screen.getByRole("dialog");
        expect(content).toHaveStyle({ "--sheet-max-width": "500px" });
      });
    });

    // zIndex prop
    it("zIndex 스타일이 적용됨", async () => {
      render(
        <Sheet.Root open={true} zIndex={2000}>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() => {
        const overlay = screen.getByRole("presentation");
        const content = screen.getByRole("dialog");
        expect(overlay).toHaveStyle({ zIndex: "2000" });
        expect(content).toHaveStyle({ zIndex: "2001" });
      });
    });
  });

  describe("AsChild 패턴", () => {
    // Trigger asChild
    it("Trigger에서 asChild 패턴을 지원함", () => {
      render(
        <Sheet.Root>
          <Sheet.Trigger asChild>
            <a href="#sheet">Open Sheet Link</a>
          </Sheet.Trigger>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      const trigger = screen.getByRole("link", { name: "Open Sheet Link" });
      expect(trigger).toBeInTheDocument();
      expect(trigger).toHaveAttribute("href", "#sheet");
    });

    // Close asChild
    it("Close에서 asChild 패턴을 지원함", async () => {
      render(
        <Sheet.Root open={true}>
          <Sheet.Portal>
            <Sheet.Overlay />
            <Sheet.Content>
              <Sheet.Title>Sheet Title</Sheet.Title>
              <Sheet.Close asChild>
                <button type="button" className="custom-close">
                  Custom Close
                </button>
              </Sheet.Close>
            </Sheet.Content>
          </Sheet.Portal>
        </Sheet.Root>
      );

      await waitFor(() => {
        const closeButton = screen.getByLabelText("닫기");
        expect(closeButton).toHaveClass("custom-close");
        expect(closeButton).toHaveTextContent("Custom Close");
      });
    });
  });
});
