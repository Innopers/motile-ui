import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent, waitFor, fireEvent } from "@/test/utils";
import { Drawer } from "./Drawer";

describe("Drawer", () => {
  describe("핵심 기능", () => {
    // 기본 렌더링: Trigger 클릭 시 Drawer 열림
    it("Trigger 클릭 시 drawer가 열림", async () => {
      const user = userEvent.setup();

      render(
        <Drawer.Root>
          <Drawer.Trigger asChild>
            <button>Open Drawer</button>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Content>
              <Drawer.Title>Drawer Title</Drawer.Title>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      // 초기: Drawer 닫혀있음
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      // Trigger 클릭
      await user.click(screen.getByText("Open Drawer"));

      // Drawer 열림
      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Drawer Title")).toBeInTheDocument();
    });

    // Portal이 열렸을 때만 렌더링
    it("open 상태일 때만 Portal이 렌더링됨", () => {
      const { rerender } = render(
        <Drawer.Root open={false}>
          <Drawer.Portal>
            <Drawer.Content>Content</Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      // 닫혀있을 때: 렌더링 안 됨
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      // 열릴 때: 렌더링됨
      rerender(
        <Drawer.Root open={true}>
          <Drawer.Portal>
            <Drawer.Content>Content</Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Close 버튼 클릭 시 Drawer 닫힘
    it("Close 버튼 클릭 시 drawer가 닫힘", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Drawer.Root open={true} onOpenChange={handleOpenChange}>
          <Drawer.Portal>
            <Drawer.Content>
              <Drawer.Close asChild>
                <button>Close</button>
              </Drawer.Close>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();

      await user.click(screen.getByText("Close"));

      // onOpenChange가 false로 호출됨 (300ms animation delay)
      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    // Overlay + Content + Title + Body + Handle 렌더링
    it("모든 drawer 컴포넌트가 올바른 속성과 함께 렌더링됨", () => {
      render(
        <Drawer.Root open={true}>
          <Drawer.Portal>
            <Drawer.Overlay data-testid="overlay" />
            <Drawer.Content>
              <Drawer.Handle data-testid="handle" />
              <Drawer.Title>My Drawer</Drawer.Title>
              <Drawer.Body data-testid="body">Body Content</Drawer.Body>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      // Overlay: role="presentation"
      expect(screen.getByTestId("overlay")).toHaveAttribute(
        "role",
        "presentation"
      );

      // Content: dialog + aria-modal
      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");

      // Title: h2 + id
      const title = screen.getByText("My Drawer");
      expect(title.tagName).toBe("H2");
      expect(title).toHaveAttribute("id", "motile-drawer-title");

      // Body: data-scroll-allowed
      const body = screen.getByTestId("body");
      expect(body).toHaveAttribute("data-scroll-allowed");

      // Handle: aria-hidden
      const handleBar = screen
        .getByTestId("handle")
        .querySelector(".motile-drawer__handle");
      expect(handleBar).toHaveAttribute("aria-hidden", "true");
    });
  });

  describe("Context", () => {
    // Context 에러: Root 밖에서 사용 시
    it("Root 밖에서 컴포넌트 사용 시 에러 발생", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(
          <Drawer.Trigger asChild>
            <button>Open</button>
          </Drawer.Trigger>
        );
      }).toThrow("Drawer components must be used within Drawer.Root");

      consoleError.mockRestore();
    });
  });

  describe("제어/비제어 모드", () => {
    // Uncontrolled: defaultOpen prop
    it("defaultOpen으로 비제어 컴포넌트로 동작함", () => {
      render(
        <Drawer.Root defaultOpen={true}>
          <Drawer.Portal>
            <Drawer.Content>Content</Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      // 초기부터 열려있음
      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Controlled: open prop + onOpenChange
    it("open prop으로 제어 컴포넌트로 동작함", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      const { rerender } = render(
        <Drawer.Root open={false} onOpenChange={handleOpenChange}>
          <Drawer.Trigger asChild>
            <button>Open</button>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Content>Content</Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      // 초기: 닫혀있음
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

      // Trigger 클릭 → onOpenChange 호출되지만 상태는 외부에서 제어
      await user.click(screen.getByText("Open"));
      expect(handleOpenChange).toHaveBeenCalledWith(true);
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument(); // 아직 닫힘

      // 외부에서 open=true로 변경
      rerender(
        <Drawer.Root open={true} onOpenChange={handleOpenChange}>
          <Drawer.Trigger asChild>
            <button>Open</button>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Content>Content</Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    // Trigger/Close 클릭 시 onOpenChange 호출
    it("Trigger나 Close 클릭 시 onOpenChange가 호출됨", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      const { rerender } = render(
        <Drawer.Root onOpenChange={handleOpenChange}>
          <Drawer.Trigger asChild>
            <button>Open</button>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Content>
              <Drawer.Close asChild>
                <button>Close</button>
              </Drawer.Close>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      // Trigger → onOpenChange(true)
      await user.click(screen.getByText("Open"));
      expect(handleOpenChange).toHaveBeenCalledWith(true);

      // open=true로 rerender
      rerender(
        <Drawer.Root open={true} onOpenChange={handleOpenChange}>
          <Drawer.Trigger asChild>
            <button>Open</button>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Content>
              <Drawer.Close asChild>
                <button>Close</button>
              </Drawer.Close>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      // Close → onOpenChange(false)
      handleOpenChange.mockClear();
      await user.click(screen.getByText("Close"));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("닫기 방법", () => {
    // closeOnBackdrop 기본값: ESC로 닫기
    it("기본적으로 ESC 키로 닫힘", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Drawer.Root open={true} onOpenChange={handleOpenChange}>
          <Drawer.Portal>
            <Drawer.Content>Content</Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    // closeOnBackdrop=false: ESC로 안 닫힘
    it("closeOnBackdrop이 false면 ESC 키로 닫히지 않음", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Drawer.Root
          open={true}
          closeOnBackdrop={false}
          onOpenChange={handleOpenChange}
        >
          <Drawer.Portal>
            <Drawer.Content>Content</Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      await user.keyboard("{Escape}");
      expect(handleOpenChange).not.toHaveBeenCalled();
    });

    // closeOnBackdrop 객체: escapeKey 옵션
    it("closeOnBackdrop의 escapeKey 옵션을 지원함", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Drawer.Root
          open={true}
          closeOnBackdrop={{ escapeKey: true, clickOutside: false }}
          onOpenChange={handleOpenChange}
        >
          <Drawer.Portal>
            <Drawer.Content>Content</Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      await user.keyboard("{Escape}");

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    // closeOnBackdrop 객체: clickOutside 옵션
    it("closeOnBackdrop의 clickOutside 옵션을 지원함", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Drawer.Root
          open={true}
          closeOnBackdrop={{ escapeKey: false, clickOutside: true }}
          onOpenChange={handleOpenChange}
        >
          <Drawer.Portal>
            <Drawer.Overlay data-testid="overlay" />
            <Drawer.Content>Content</Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      // ESC는 안 닫힘
      await user.keyboard("{Escape}");
      expect(handleOpenChange).not.toHaveBeenCalled();

      // 외부 클릭은 닫힘
      await user.click(screen.getByTestId("overlay"));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    // overlay 클릭으로 닫기 (기본값)
    it("기본적으로 overlay 클릭 시 닫힘", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Drawer.Root open={true} onOpenChange={handleOpenChange}>
          <Drawer.Portal>
            <Drawer.Overlay data-testid="overlay" />
            <Drawer.Content>Content</Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      await user.click(screen.getByTestId("overlay"));

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("드래그로 닫기", () => {
    // 드래그 거리가 임계값 초과 시 닫힘
    it("드래그 거리가 임계값을 초과하면 닫힘", async () => {
      const handleOpenChange = vi.fn();
      // jsdom에서 window.innerHeight 설정
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 1000,
      });

      render(
        <Drawer.Root open={true} onOpenChange={handleOpenChange}>
          <Drawer.Portal>
            <Drawer.Content>
              <Drawer.Handle data-testid="handle" />
              <Drawer.Body>Body</Drawer.Body>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      const handle = screen.getByTestId("handle");

      // 마우스 드래그: 시작 → 아래로 충분히 이동 → 끝
      fireEvent.mouseDown(handle, { clientY: 100 });
      fireEvent.mouseMove(window, { clientY: 400 }); // 300px 이동
      fireEvent.mouseUp(window);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    // 드래그 거리가 임계값 미만 시 안 닫힘
    it("드래그 거리가 임계값 미만이면 닫히지 않음", async () => {
      const handleOpenChange = vi.fn();
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 1000,
      });

      render(
        <Drawer.Root open={true} onOpenChange={handleOpenChange}>
          <Drawer.Portal>
            <Drawer.Content>
              <Drawer.Handle data-testid="handle" />
              <Drawer.Body>Body</Drawer.Body>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      const handle = screen.getByTestId("handle");

      // 살짝만 드래그 (임계값 미만)
      fireEvent.mouseDown(handle, { clientY: 200 });
      fireEvent.mouseMove(window, { clientY: 250 }); // 50px 이동
      fireEvent.mouseUp(window);

      // 닫히지 않아야 함
      expect(handleOpenChange).not.toHaveBeenCalled();
    });

    // 터치 드래그로도 닫기 가능
    it("터치 드래그로도 닫힘", async () => {
      const handleOpenChange = vi.fn();
      Object.defineProperty(window, "innerHeight", {
        writable: true,
        configurable: true,
        value: 1000,
      });

      render(
        <Drawer.Root open={true} onOpenChange={handleOpenChange}>
          <Drawer.Portal>
            <Drawer.Content>
              <Drawer.Handle data-testid="handle" />
              <Drawer.Body>Body</Drawer.Body>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      const handle = screen.getByTestId("handle");

      // 터치 드래그
      fireEvent.touchStart(handle, { touches: [{ clientY: 100 }] });
      fireEvent.touchMove(handle, { touches: [{ clientY: 400 }] });
      fireEvent.touchEnd(handle);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });
  });

  describe("Portal", () => {
    // Portal이 document.body에 렌더링
    it("기본적으로 document.body에 Portal이 렌더링됨", () => {
      render(
        <Drawer.Root open={true}>
          <Drawer.Portal>
            <Drawer.Content data-testid="content">Content</Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      const content = screen.getByTestId("content");
      expect(content).toBeInTheDocument();
      expect(document.body.contains(content)).toBe(true);
    });
  });

  describe("AsChild 패턴", () => {
    // Trigger asChild: 커스텀 요소로 렌더링
    it("asChild가 true면 Trigger가 자식 엘리먼트로 렌더링됨", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Drawer.Root onOpenChange={handleOpenChange}>
          <Drawer.Trigger asChild>
            <a href="#" data-testid="custom-trigger">
              Open Drawer
            </a>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Content>Content</Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      const trigger = screen.getByTestId("custom-trigger");
      expect(trigger.tagName).toBe("A");

      await user.click(trigger);
      expect(handleOpenChange).toHaveBeenCalledWith(true);
    });

    // Close asChild: 커스텀 요소로 렌더링
    it("asChild가 true면 Close가 자식 엘리먼트로 렌더링됨", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Drawer.Root open={true} onOpenChange={handleOpenChange}>
          <Drawer.Portal>
            <Drawer.Content>
              <Drawer.Close asChild>
                <a href="#" data-testid="custom-close">
                  Close
                </a>
              </Drawer.Close>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      const closeLink = screen.getByTestId("custom-close");
      expect(closeLink.tagName).toBe("A");

      await user.click(closeLink);

      await waitFor(() => {
        expect(handleOpenChange).toHaveBeenCalledWith(false);
      });
    });

    // Title asChild: 커스텀 요소로 렌더링
    it("asChild가 true면 Title이 자식 엘리먼트로 렌더링됨", () => {
      render(
        <Drawer.Root open={true}>
          <Drawer.Portal>
            <Drawer.Content>
              <Drawer.Title asChild>
                <h1 data-testid="custom-title">Custom Title</h1>
              </Drawer.Title>
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      const title = screen.getByTestId("custom-title");
      expect(title.tagName).toBe("H1");
      expect(title).toHaveTextContent("Custom Title");
    });
  });

  describe("Ref 전달", () => {
    // Trigger ref 전달
    it("Trigger로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(
        <Drawer.Root>
          <Drawer.Trigger asChild ref={ref}>
            <button>Open</button>
          </Drawer.Trigger>
          <Drawer.Portal>
            <Drawer.Content>Content</Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    // Content ref 전달
    it("Content로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Drawer.Root open={true}>
          <Drawer.Portal>
            <Drawer.Content ref={ref}>Content</Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("Props 전달", () => {
    // className 전달
    it("content에 커스텀 className이 적용됨", () => {
      render(
        <Drawer.Root open={true}>
          <Drawer.Portal>
            <Drawer.Content className="custom-drawer" data-testid="content">
              Content
            </Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      const content = screen.getByTestId("content");
      expect(content).toHaveClass("motile-drawer__content");
      expect(content).toHaveClass("custom-drawer");
    });
  });

  describe("커스텀 Props", () => {
    // maxHeight, width, maxWidth CSS variables
    it("커스텀 크기가 CSS 변수로 적용됨", () => {
      render(
        <Drawer.Root
          open={true}
          maxHeight="80vh"
          width="600px"
          maxWidth="1200px"
        >
          <Drawer.Portal>
            <Drawer.Content data-testid="content">Content</Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      const content = screen.getByTestId("content");
      expect(content).toHaveStyle({ "--drawer-max-height": "80vh" });
      expect(content).toHaveStyle({ "--drawer-width": "600px" });
      expect(content).toHaveStyle({ "--drawer-max-width": "1200px" });
    });

    // zIndex 커스텀 값
    it("커스텀 zIndex가 적용됨", () => {
      render(
        <Drawer.Root open={true} zIndex={5000}>
          <Drawer.Portal>
            <Drawer.Overlay data-testid="overlay" />
            <Drawer.Content data-testid="content">Content</Drawer.Content>
          </Drawer.Portal>
        </Drawer.Root>
      );

      expect(screen.getByTestId("overlay")).toHaveStyle({ zIndex: "5000" });
      expect(screen.getByTestId("content")).toHaveStyle({ zIndex: "5001" });
    });
  });
});
