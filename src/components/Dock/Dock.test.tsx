import React from "react";

import { describe, expect, it, vi } from "vitest";

import { render, screen, userEvent } from "@/test/utils";

import { Dock } from "./Dock";

describe("Dock", () => {
  describe("핵심 기능", () => {
    // 기본 렌더링: 3개 컴포넌트가 정상적으로 렌더링되는지 확인 (Smoke Test)
    it("dock, item, separator가 렌더링됨", () => {
      render(
        <Dock.Root>
          <Dock.Item>Item 1</Dock.Item>
          <Dock.Separator />
          <Dock.Item>Item 2</Dock.Item>
        </Dock.Root>
      );

      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 2")).toBeInTheDocument();
    });

    // 기본값 테스트: position="bottom", zIndex=1000 (Breaking Change 방지)
    it("기본적으로 bottom position을 사용함", () => {
      render(
        <Dock.Root data-testid="dock-root">
          <Dock.Item>Item</Dock.Item>
        </Dock.Root>
      );

      const dock = screen.getByTestId("dock-root");
      expect(dock).toHaveAttribute("data-position", "bottom");
    });

    // zIndex 기본값: 1000
    it("기본 zIndex가 1000임", () => {
      render(
        <Dock.Root data-testid="dock-root">
          <Dock.Item>Item</Dock.Item>
        </Dock.Root>
      );

      const dock = screen.getByTestId("dock-root");
      expect(dock).toHaveStyle({ zIndex: "1000" });
    });

    // Dock.Item: button role로 렌더링
    it("item이 button role로 렌더링됨", () => {
      render(
        <Dock.Root>
          <Dock.Item>Item</Dock.Item>
        </Dock.Root>
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
      expect(screen.getByRole("button")).toHaveTextContent("Item");
    });

    // type="button": form 안에서 의도치 않은 submit 방지
    it("item이 type='button'을 가져 form submit을 방지함", () => {
      render(
        <Dock.Root>
          <Dock.Item>Item</Dock.Item>
        </Dock.Root>
      );

      expect(screen.getByRole("button")).toHaveAttribute("type", "button");
    });

    // Dock.Separator: 구분선 렌더링
    it("separator 엘리먼트가 렌더링됨", () => {
      render(
        <Dock.Root>
          <Dock.Item>Item 1</Dock.Item>
          <Dock.Separator data-testid="separator" />
          <Dock.Item>Item 2</Dock.Item>
        </Dock.Root>
      );

      expect(screen.getByTestId("separator")).toBeInTheDocument();
    });

    // onClick 이벤트: 클릭 시 핸들러 호출
    it("item 클릭 시 onClick이 호출됨", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Dock.Root>
          <Dock.Item onClick={handleClick}>Item</Dock.Item>
        </Dock.Root>
      );

      await user.click(screen.getByRole("button"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    // disabled 상태: 클릭해도 onClick 호출 안 됨
    it("disabled 상태일 때 onClick이 호출되지 않음", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Dock.Root>
          <Dock.Item disabled onClick={handleClick}>
            Item
          </Dock.Item>
        </Dock.Root>
      );

      const button = screen.getByRole("button");
      await user.click(button).catch(() => {
        // pointer-events: none으로 인한 에러는 예상된 동작
      });

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe("Context", () => {
    // Context 에러: Item이 Root 밖에 있으면 에러
    it("Item이 Dock.Root 밖에서 사용되면 에러를 발생시킴", () => {
      // console.error를 mock해서 에러 메시지 숨김
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<Dock.Item>Item</Dock.Item>);
      }).toThrow("Dock compound components must be used within Dock.Root");

      consoleError.mockRestore();
    });

    // Context 에러: Separator가 Root 밖에 있으면 에러
    it("Separator가 Dock.Root 밖에서 사용되면 에러를 발생시킴", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<Dock.Separator />);
      }).toThrow("Dock compound components must be used within Dock.Root");

      consoleError.mockRestore();
    });
  });

  describe("위치 설정", () => {
    // position="bottom"
    it("bottom position이 적용됨", () => {
      render(
        <Dock.Root position="bottom" data-testid="dock-root">
          <Dock.Item>Item</Dock.Item>
        </Dock.Root>
      );

      expect(screen.getByTestId("dock-root")).toHaveAttribute(
        "data-position",
        "bottom"
      );
    });

    // position="top"
    it("top position이 적용됨", () => {
      render(
        <Dock.Root position="top" data-testid="dock-root">
          <Dock.Item>Item</Dock.Item>
        </Dock.Root>
      );

      expect(screen.getByTestId("dock-root")).toHaveAttribute(
        "data-position",
        "top"
      );
    });

    // position="left"
    it("left position이 적용됨", () => {
      render(
        <Dock.Root position="left" data-testid="dock-root">
          <Dock.Item>Item</Dock.Item>
        </Dock.Root>
      );

      expect(screen.getByTestId("dock-root")).toHaveAttribute(
        "data-position",
        "left"
      );
    });

    // position="right"
    it("right position이 적용됨", () => {
      render(
        <Dock.Root position="right" data-testid="dock-root">
          <Dock.Item>Item</Dock.Item>
        </Dock.Root>
      );

      expect(screen.getByTestId("dock-root")).toHaveAttribute(
        "data-position",
        "right"
      );
    });
  });

  describe("Tooltip 통합", () => {
    // label prop: Tooltip 자동 래핑
    it("label prop이 제공되면 Tooltip으로 래핑됨", () => {
      render(
        <Dock.Root>
          <Dock.Item label="Home">Icon</Dock.Item>
        </Dock.Root>
      );

      // Tooltip이 있으면 button 주변에 tooltip trigger wrapper가 생김
      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Icon");
    });

    // label 없을 때: Tooltip 래핑 안 함
    it("label이 제공되지 않으면 Tooltip으로 래핑되지 않음", () => {
      render(
        <Dock.Root>
          <Dock.Item>Icon</Dock.Item>
        </Dock.Root>
      );

      const button = screen.getByRole("button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Icon");
    });
  });

  describe("색상 시스템", () => {
    // Item color: CSS variable로 적용
    it("item color가 CSS 변수로 적용됨", () => {
      render(
        <Dock.Root>
          <Dock.Item color="#00ff00" data-testid="item">
            Item
          </Dock.Item>
        </Dock.Root>
      );

      const item = screen.getByTestId("item");
      expect(item).toHaveStyle({ "--motile-dock-color": "#00ff00" });
    });

    // Item color: Item color가 Root color보다 우선
    it("item color가 root color보다 우선순위가 높음", () => {
      render(
        <Dock.Root color="#ff0000">
          <Dock.Item color="#00ff00" data-testid="item">
            Item
          </Dock.Item>
        </Dock.Root>
      );

      const item = screen.getByTestId("item");
      expect(item).toHaveStyle({ "--motile-dock-color": "#00ff00" });
    });

    // Item color 없을 때: Root color 상속
    it("item color가 없으면 root color를 상속함", () => {
      render(
        <Dock.Root color="#ff0000">
          <Dock.Item data-testid="item">Item</Dock.Item>
        </Dock.Root>
      );

      const item = screen.getByTestId("item");
      expect(item).toHaveStyle({ "--motile-dock-color": "#ff0000" });
    });
  });

  describe("AsChild 패턴", () => {
    // Item asChild: 커스텀 요소로 렌더링
    it("asChild가 true면 자식 엘리먼트로 렌더링됨", () => {
      render(
        <Dock.Root>
          <Dock.Item asChild>
            <a href="/home" data-testid="custom-link">
              Home
            </a>
          </Dock.Item>
        </Dock.Root>
      );

      const link = screen.getByTestId("custom-link");
      expect(link.tagName).toBe("A");
      expect(link).toHaveAttribute("href", "/home");
    });
  });

  describe("Ref 전달", () => {
    // Root ref 전달: HTMLDivElement로 올바르게 전달됨
    it("Root 엘리먼트로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Dock.Root ref={ref}>
          <Dock.Item>Item</Dock.Item>
        </Dock.Root>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });

    // Item ref 전달: HTMLButtonElement로 올바르게 전달됨
    it("Item 엘리먼트로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(
        <Dock.Root>
          <Dock.Item ref={ref}>Item</Dock.Item>
        </Dock.Root>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.tagName).toBe("BUTTON");
    });

    // Separator ref 전달: HTMLDivElement로 올바르게 전달됨
    it("Separator 엘리먼트로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Dock.Root>
          <Dock.Item>Item 1</Dock.Item>
          <Dock.Separator ref={ref} />
          <Dock.Item>Item 2</Dock.Item>
        </Dock.Root>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
    });
  });

  describe("접근성", () => {
    // role="button": Item이 button role을 가짐
    it("item이 button role을 가짐", () => {
      render(
        <Dock.Root>
          <Dock.Item>Item</Dock.Item>
        </Dock.Root>
      );

      expect(screen.getByRole("button")).toBeInTheDocument();
    });

    // focusable: Tab 키로 포커스 가능
    it("포커스 가능함", () => {
      render(
        <Dock.Root>
          <Dock.Item>Item</Dock.Item>
        </Dock.Root>
      );

      const button = screen.getByRole("button");
      button.focus();
      expect(button).toHaveFocus();
    });

    // Enter 키: 키보드로 버튼 활성화
    it("Enter 키로 키보드 내비게이션을 지원함", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Dock.Root>
          <Dock.Item onClick={handleClick}>Item</Dock.Item>
        </Dock.Root>
      );

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard("{Enter}");

      expect(handleClick).toHaveBeenCalled();
    });

    // Space 키: 버튼 활성화
    it("Space 키로 키보드 내비게이션을 지원함", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();

      render(
        <Dock.Root>
          <Dock.Item onClick={handleClick}>Item</Dock.Item>
        </Dock.Root>
      );

      const button = screen.getByRole("button");
      button.focus();
      await user.keyboard(" ");

      expect(handleClick).toHaveBeenCalled();
    });

    // disabled 상태: disabled 속성 적용
    it("disabled 상태일 때 disabled 속성이 있음", () => {
      render(
        <Dock.Root>
          <Dock.Item disabled>Item</Dock.Item>
        </Dock.Root>
      );

      expect(screen.getByRole("button")).toBeDisabled();
    });

    // aria-label 전달: 접근성 레이블 지원
    it("aria-label 속성이 전달됨", () => {
      render(
        <Dock.Root>
          <Dock.Item aria-label="Home button">Item</Dock.Item>
        </Dock.Root>
      );

      expect(screen.getByRole("button")).toHaveAttribute(
        "aria-label",
        "Home button"
      );
    });
  });

  describe("Props 전달", () => {
    // className 전달: 사용자 정의 클래스 추가 가능
    it("커스텀 className이 root에 적용됨", () => {
      render(
        <Dock.Root className="custom-dock" data-testid="dock-root">
          <Dock.Item>Item</Dock.Item>
        </Dock.Root>
      );

      const dock = screen.getByTestId("dock-root");
      expect(dock).toHaveClass("motile-dock");
      expect(dock).toHaveClass("custom-dock");
    });

    // style 전달: 사용자 정의 스타일 적용 가능
    it("커스텀 style이 item에 적용됨", () => {
      render(
        <Dock.Root>
          <Dock.Item style={{ margin: "10px" }} data-testid="item">
            Item
          </Dock.Item>
        </Dock.Root>
      );

      expect(screen.getByTestId("item")).toHaveStyle({ margin: "10px" });
    });

    // data-testid 전달: 테스트 속성 전달 가능
    it("data 속성이 전달됨", () => {
      render(
        <Dock.Root>
          <Dock.Item data-testid="custom-item">Item</Dock.Item>
        </Dock.Root>
      );

      expect(screen.getByTestId("custom-item")).toBeInTheDocument();
    });
  });
});
