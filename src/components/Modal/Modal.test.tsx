import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, userEvent } from "@/test/utils";
import { Modal } from "./Modal";

describe("Modal", () => {
  describe("핵심 기능", () => {
    // 8개 컴포넌트 렌더링 (Smoke Test)
    it("모든 modal 컴포넌트가 렌더링됨", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content>
              <Modal.Header>
                <Modal.Title>Title</Modal.Title>
              </Modal.Header>
              <Modal.Body>Description</Modal.Body>
              <Modal.Footer>
                <Modal.Close>Close</Modal.Close>
              </Modal.Footer>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(screen.getByText("Title")).toBeInTheDocument();
      expect(screen.getByText("Description")).toBeInTheDocument();
      expect(screen.getByText("Close")).toBeInTheDocument();
    });

    // open=false일 때 렌더링 안 됨
    it("open이 false면 overlay가 렌더링되지 않음", () => {
      render(
        <Modal.Root open={false} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content data-testid="content">Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    });

    // open=true일 때 렌더링됨
    it("open이 true면 overlay가 렌더링됨", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content data-testid="content">Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      expect(screen.getByTestId("content")).toBeInTheDocument();
    });

    // Close 버튼 클릭 시 onOpenChange(false) 호출
    it("Close 버튼 클릭 시 onOpenChange가 호출됨", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Modal.Root open={true} onOpenChange={handleOpenChange}>
          <Modal.Overlay>
            <Modal.Content>
              <Modal.Close>Close</Modal.Close>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      await user.click(screen.getByText("Close"));
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    // data-state attribute
    it("overlay와 content에 data-state 속성이 있음", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content data-testid="content">Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const backdrop = document.querySelector(".motile-modal__backdrop");
      const content = screen.getByTestId("content");

      expect(backdrop).toHaveAttribute("data-state", "open");
      expect(content).toHaveAttribute("data-state", "open");
    });
  });

  describe("Context", () => {
    // Content가 Root 밖에서 에러
    it("Content를 Root 밖에서 사용 시 에러 발생", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<Modal.Content>Content</Modal.Content>);
      }).toThrow("Modal compound components must be used within Modal.Root");

      consoleError.mockRestore();
    });

    // Title이 Root 밖에서 에러
    it("Title을 Root 밖에서 사용 시 에러 발생", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<Modal.Title>Title</Modal.Title>);
      }).toThrow("Modal compound components must be used within Modal.Root");

      consoleError.mockRestore();
    });

    // Description이 Root 밖에서 에러
    it("Description을 Root 밖에서 사용 시 에러 발생", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<Modal.Body>Description</Modal.Body>);
      }).toThrow("Modal compound components must be used within Modal.Root");

      consoleError.mockRestore();
    });

    // Close가 Root 밖에서 에러
    it("Close를 Root 밖에서 사용 시 에러 발생", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<Modal.Close>Close</Modal.Close>);
      }).toThrow("Modal compound components must be used within Modal.Root");

      consoleError.mockRestore();
    });

    // Overlay가 Root 밖에서 에러
    it("Overlay를 Root 밖에서 사용 시 에러 발생", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(
          <Modal.Overlay>
            <div>Content</div>
          </Modal.Overlay>
        );
      }).toThrow("Modal compound components must be used within Modal.Root");

      consoleError.mockRestore();
    });
  });

  describe("Variant", () => {
    // scale (기본값)
    it("기본적으로 scale variant를 사용함", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content>Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const backdrop = document.querySelector(".motile-modal__backdrop");
      const modal = document.querySelector(".motile-modal");

      expect(backdrop).toHaveAttribute("data-variant", "scale");
      expect(modal).toHaveAttribute("data-variant", "scale");
    });

    // slideDown
    it("slideDown variant를 지원함", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay variant="slideDown">
            <Modal.Content>Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const backdrop = document.querySelector(".motile-modal__backdrop");
      const modal = document.querySelector(".motile-modal");

      expect(backdrop).toHaveAttribute("data-variant", "slideDown");
      expect(modal).toHaveAttribute("data-variant", "slideDown");
    });
  });

  describe("Portal", () => {
    // document.body에 렌더링 (기본값)
    it("기본적으로 document.body에 Portal이 렌더링됨", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content data-testid="content">Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const content = screen.getByTestId("content");
      expect(content).toBeInTheDocument();
      expect(document.body.contains(content)).toBe(true);
    });

    // custom container
    it("커스텀 컨테이너에 Portal이 렌더링됨", () => {
      const container = document.createElement("div");
      container.setAttribute("id", "custom-portal");
      document.body.appendChild(container);

      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay container={container}>
            <Modal.Content data-testid="content">Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const content = screen.getByTestId("content");
      expect(container.contains(content)).toBe(true);

      // cleanup
      document.body.removeChild(container);
    });

    // Portal cleanup (open=false → unmount)
    it("modal이 닫히면 Portal이 정리됨", () => {
      const { rerender } = render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content data-testid="content">Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      expect(screen.getByTestId("content")).toBeInTheDocument();

      // close
      rerender(
        <Modal.Root open={false} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content data-testid="content">Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    });
  });

  describe("closeOnBackdrop 옵션", () => {
    // true (기본값): ESC + clickOutside 둘 다
    it("기본적으로 ESC 키와 backdrop 클릭으로 닫힘", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Modal.Root open={true} onOpenChange={handleOpenChange}>
          <Modal.Overlay>
            <Modal.Content>Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      // ESC 키
      await user.keyboard("{Escape}");
      expect(handleOpenChange).toHaveBeenCalledWith(false);

      handleOpenChange.mockClear();

      // backdrop 클릭
      const backdrop = document.querySelector(".motile-modal__backdrop");
      await user.click(backdrop!);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    // false: 둘 다 비활성화
    it("closeOnBackdrop이 false면 ESC 키와 backdrop 클릭으로 닫히지 않음", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Modal.Root open={true} onOpenChange={handleOpenChange}>
          <Modal.Overlay closeOnBackdrop={false}>
            <Modal.Content>Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      // ESC 키
      await user.keyboard("{Escape}");
      expect(handleOpenChange).not.toHaveBeenCalled();

      // backdrop 클릭
      const backdrop = document.querySelector(".motile-modal__backdrop");
      await user.click(backdrop!);
      expect(handleOpenChange).not.toHaveBeenCalled();
    });

    // { escapeKey: true }: ESC만
    it("closeOnBackdrop={ escapeKey: true }면 ESC 키로만 닫힘", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Modal.Root open={true} onOpenChange={handleOpenChange}>
          <Modal.Overlay closeOnBackdrop={{ escapeKey: true }}>
            <Modal.Content>Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      // ESC 키
      await user.keyboard("{Escape}");
      expect(handleOpenChange).toHaveBeenCalledWith(false);

      handleOpenChange.mockClear();

      // backdrop 클릭 (비활성화)
      const backdrop = document.querySelector(".motile-modal__backdrop");
      await user.click(backdrop!);
      expect(handleOpenChange).not.toHaveBeenCalled();
    });

    // content 클릭 시 닫히지 않음 (e.target !== e.currentTarget)
    it("modal content 클릭 시 닫히지 않음", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Modal.Root open={true} onOpenChange={handleOpenChange}>
          <Modal.Overlay>
            <Modal.Content data-testid="content">Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      // content 클릭
      await user.click(screen.getByTestId("content"));
      expect(handleOpenChange).not.toHaveBeenCalled();
    });

    // backdrop 직접 클릭만 닫힘
    it("backdrop을 직접 클릭할 때만 닫힘", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Modal.Root open={true} onOpenChange={handleOpenChange}>
          <Modal.Overlay>
            <Modal.Content>
              <div data-testid="inner">Inner element</div>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      // inner element 클릭 (닫히지 않음)
      await user.click(screen.getByTestId("inner"));
      expect(handleOpenChange).not.toHaveBeenCalled();

      // backdrop 직접 클릭 (닫힘)
      const backdrop = document.querySelector(".motile-modal__backdrop");
      await user.click(backdrop!);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("접근성", () => {
    // role="dialog"
    it("content에 role='dialog' 속성이 있음", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content>Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeInTheDocument();
    });

    // aria-modal="true"
    it("content에 aria-modal='true' 속성이 있음", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content>Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-modal", "true");
    });

    // aria-labelledby → Title ID
    it("content와 title이 aria-labelledby로 연결됨", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content>
              <Modal.Title>Modal Title</Modal.Title>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const dialog = screen.getByRole("dialog");
      const title = screen.getByText("Modal Title");
      const titleId = title.getAttribute("id");

      expect(titleId).toBeTruthy();
      expect(dialog).toHaveAttribute("aria-labelledby", titleId!);
    });

    // aria-describedby → Description ID
    it("content와 description이 aria-describedby로 연결됨", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content>
              <Modal.Body>Modal Description</Modal.Body>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const dialog = screen.getByRole("dialog");
      const description = screen.getByText("Modal Description");
      const descriptionId = description.getAttribute("id");

      expect(descriptionId).toBeTruthy();
      expect(dialog).toHaveAttribute("aria-describedby", descriptionId!);
    });

    // Close button aria-label
    it("Close 버튼에 aria-label이 있음", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content>
              <Modal.Close />
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      expect(screen.getByLabelText("닫기")).toBeInTheDocument();
    });

    // Title과 Description ID가 다름
    it("Title과 Description이 서로 다른 ID를 가짐", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content>
              <Modal.Title>Title</Modal.Title>
              <Modal.Body>Description</Modal.Body>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const title = screen.getByText("Title");
      const description = screen.getByText("Description");
      const titleId = title.getAttribute("id");
      const descriptionId = description.getAttribute("id");

      expect(titleId).not.toBe(descriptionId);
    });
  });

  describe("Width와 MaxWidth", () => {
    // width CSS 변수
    it("width가 CSS 변수로 적용됨", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay width="500px">
            <Modal.Content>Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const modal = document.querySelector(".motile-modal");
      expect(modal).toHaveStyle({ "--modal-width": "500px" });
    });

    // maxWidth CSS 변수
    it("maxWidth가 CSS 변수로 적용됨", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay maxWidth="800px">
            <Modal.Content>Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const modal = document.querySelector(".motile-modal");
      expect(modal).toHaveStyle({ "--modal-max-width": "800px" });
    });
  });

  describe("zIndex", () => {
    // 기본값 1000
    it("기본 zIndex는 1000임", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content>Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const backdrop = document.querySelector(".motile-modal__backdrop");
      expect(backdrop).toHaveStyle({ zIndex: "1000" });
    });

    // custom zIndex
    it("커스텀 zIndex가 적용됨", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay zIndex={2000}>
            <Modal.Content>Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const backdrop = document.querySelector(".motile-modal__backdrop");
      expect(backdrop).toHaveStyle({ zIndex: "2000" });
    });
  });

  describe("forceMount", () => {
    // forceMount=true: open=false여도 렌더링
    it("forceMount가 true여도 open이 false면 content가 렌더링되지 않음", () => {
      render(
        <Modal.Root open={false} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content forceMount data-testid="content">
              Content
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      // Overlay는 렌더링 안 됨
      expect(screen.queryByTestId("content")).not.toBeInTheDocument();
    });
  });

  describe("Close 버튼", () => {
    // 클릭 시 onOpenChange(false)
    it("클릭 시 onOpenChange가 호출됨", async () => {
      const user = userEvent.setup();
      const handleOpenChange = vi.fn();

      render(
        <Modal.Root open={true} onOpenChange={handleOpenChange}>
          <Modal.Overlay>
            <Modal.Content>
              <Modal.Close>Close</Modal.Close>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      await user.click(screen.getByText("Close"));
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });

    // type="button"
    it("폼 제출을 방지하기 위해 type='button' 속성이 있음", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content>
              <Modal.Close>Close</Modal.Close>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const button = screen.getByText("Close");
      expect(button).toHaveAttribute("type", "button");
    });

    // onClick prop 전파
    it("커스텀 onClick과 onOpenChange 둘 다 호출됨", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const handleOpenChange = vi.fn();

      render(
        <Modal.Root open={true} onOpenChange={handleOpenChange}>
          <Modal.Overlay>
            <Modal.Content>
              <Modal.Close onClick={handleClick}>Close</Modal.Close>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      await user.click(screen.getByText("Close"));
      expect(handleClick).toHaveBeenCalledTimes(1);
      expect(handleOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe("AsChild 패턴", () => {
    // Close asChild로 커스텀 요소
    it("asChild가 true면 Close가 자식 엘리먼트로 렌더링됨", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content>
              <Modal.Close asChild>
                <a href="#close" data-testid="custom-close">
                  Close Link
                </a>
              </Modal.Close>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const link = screen.getByTestId("custom-close");
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "#close");
    });
  });

  describe("Ref 전달", () => {
    // Overlay ref
    it("Overlay로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay ref={ref}>
            <Modal.Content>Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.className).toContain("motile-modal__backdrop");
    });

    // Content ref
    it("Content로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content ref={ref}>Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.className).toContain("motile-modal__content");
    });
  });

  describe("Props 전달", () => {
    // className
    it("overlay에 커스텀 className이 적용됨", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay className="custom-overlay">
            <Modal.Content>Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const backdrop = document.querySelector(".motile-modal__backdrop");
      expect(backdrop).toHaveClass("motile-modal__backdrop");
      expect(backdrop).toHaveClass("custom-overlay");
    });

    // data-testid
    it("data 속성이 전달됨", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content data-testid="custom-content">Content</Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      expect(screen.getByTestId("custom-content")).toBeInTheDocument();
    });
  });

  describe("Header와 Footer", () => {
    // Footer 렌더링
    it("Footer가 렌더링됨", () => {
      render(
        <Modal.Root open={true} onOpenChange={vi.fn()}>
          <Modal.Overlay>
            <Modal.Content>
              <Modal.Footer data-testid="footer">Footer</Modal.Footer>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      );

      const footer = screen.getByTestId("footer");
      expect(footer).toBeInTheDocument();
      expect(footer).toHaveClass("motile-modal__footer");
    });
  });
});
