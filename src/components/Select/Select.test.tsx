import React from "react";

import { describe, expect, it, vi } from "vitest";

import { render, screen, userEvent, waitFor } from "@/test/utils";

import { Select } from "./Select";

describe("Select", () => {
  describe("핵심 기능", () => {
    // 기본 렌더링: combobox role로 렌더링 확인
    it("combobox role을 가진 trigger가 렌더링됨", () => {
      render(
        <Select.Root>
          <Select.Trigger>
            <Select.Value placeholder="선택하세요" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    // placeholder 표시
    it("placeholder가 표시됨", () => {
      render(
        <Select.Root>
          <Select.Trigger>
            <Select.Value placeholder="과일 선택" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      expect(screen.getByText("과일 선택")).toBeInTheDocument();
    });

    // 초기 상태: 닫혀있음
    it("초기에는 드롭다운이 닫혀있음", () => {
      render(
        <Select.Root>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    // disabled 상태: 클릭 불가
    it("disabled prop이 true면 비활성화됨", () => {
      render(
        <Select.Root disabled>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toBeDisabled();
    });

    // disabled 상태: 클릭해도 열리지 않음
    it("disabled 상태에서는 클릭해도 열리지 않음", async () => {
      const user = userEvent.setup();

      render(
        <Select.Root disabled>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger).catch(() => {
        // pointer-events: none으로 인한 에러는 예상된 동작
      });

      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("인터랙션", () => {
    // Trigger 클릭: 드롭다운 열림
    it("trigger 클릭 시 드롭다운이 열림", async () => {
      const user = userEvent.setup();

      render(
        <Select.Root>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
            <Select.Item value="banana">바나나</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      expect(trigger).toHaveAttribute("aria-expanded", "true");
      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // Item 클릭: 값 선택 + onValueChange 호출 + 드롭다운 닫힘
    it("item 클릭 시 값이 선택되고 onValueChange가 호출됨", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Select.Root onValueChange={handleChange}>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
            <Select.Item value="banana">바나나</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const appleItem = screen.getByText("사과");
      await user.click(appleItem);

      expect(handleChange).toHaveBeenCalledWith("apple");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    // Item disabled: 클릭해도 선택 안됨
    it("disabled item은 클릭해도 선택되지 않음", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Select.Root onValueChange={handleChange}>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
            <Select.Item value="banana" disabled>
              바나나 (품절)
            </Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const disabledItem = screen.getByText("바나나 (품절)");
      await user.click(disabledItem);

      expect(handleChange).not.toHaveBeenCalled();
    });

    // 외부 클릭: 드롭다운 닫힘
    it("외부 클릭 시 드롭다운이 닫힘", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <Select.Root>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="apple">사과</Select.Item>
            </Select.Content>
          </Select.Root>
          <button>외부 버튼</button>
        </div>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      const outsideButton = screen.getByText("외부 버튼");
      await user.click(outsideButton);

      await waitFor(() => {
        expect(trigger).toHaveAttribute("aria-expanded", "false");
      });
    });

    // 선택된 값 표시: Value 컴포넌트가 선택된 Item의 label 표시
    it("선택된 item의 label이 value로 표시됨", async () => {
      const user = userEvent.setup();

      render(
        <Select.Root>
          <Select.Trigger>
            <Select.Value placeholder="선택하세요" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
            <Select.Item value="banana">바나나</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const bananaItem = screen.getByText("바나나");
      await user.click(bananaItem);

      expect(trigger).toHaveTextContent("바나나");
    });

    // closeOnBackdrop={false}: 외부 클릭해도 닫히지 않음
    it("closeOnBackdrop={false}일 때 외부 클릭해도 드롭다운이 닫히지 않음", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <Select.Root closeOnBackdrop={false}>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="apple">사과</Select.Item>
            </Select.Content>
          </Select.Root>
          <button>외부 버튼</button>
        </div>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      const outsideButton = screen.getByText("외부 버튼");
      await user.click(outsideButton);

      // closeOnBackdrop={false}이므로 드롭다운이 여전히 열려있어야 함
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    // closeOnBackdrop={{ clickOutside: false }}: 외부 클릭은 막히지만 다른 방법은 가능
    it("closeOnBackdrop={{ clickOutside: false }}일 때 외부 클릭이 막힘", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <Select.Root closeOnBackdrop={{ clickOutside: false }}>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="apple">사과</Select.Item>
              <Select.Item value="banana">바나나</Select.Item>
            </Select.Content>
          </Select.Root>
          <button>외부 버튼</button>
        </div>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      // 외부 클릭 시도
      const outsideButton = screen.getByText("외부 버튼");
      await user.click(outsideButton);

      // 외부 클릭이 막혀야 함
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      // 하지만 item 선택은 가능해야 함
      const appleItem = screen.getByText("사과");
      await user.click(appleItem);

      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    // closeOnBackdrop={{ clickOutside: true }}: 외부 클릭으로 닫힘
    it("closeOnBackdrop={{ clickOutside: true }}일 때 외부 클릭으로 닫힘", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <Select.Root closeOnBackdrop={{ clickOutside: true }}>
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="apple">사과</Select.Item>
            </Select.Content>
          </Select.Root>
          <button>외부 버튼</button>
        </div>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      const outsideButton = screen.getByText("외부 버튼");
      await user.click(outsideButton);

      await waitFor(() => {
        expect(trigger).toHaveAttribute("aria-expanded", "false");
      });
    });
  });

  describe("onClick 이벤트", () => {
    it("item onClick이 onValueChange보다 먼저 호출됨", async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();
      const mockOnValueChange = vi.fn();

      render(
        <Select.Root onValueChange={mockOnValueChange}>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple" onClick={mockOnClick}>
              사과
            </Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const appleItem = screen.getByText("사과");
      await user.click(appleItem);

      // onClick과 onValueChange 모두 호출됨
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnValueChange).toHaveBeenCalledWith("apple");

      // onClick이 먼저 호출됨을 확인
      const onClickOrder = mockOnClick.mock.invocationCallOrder[0];
      const onValueChangeOrder = mockOnValueChange.mock.invocationCallOrder[0];
      expect(onClickOrder).toBeLessThan(onValueChangeOrder);
    });

    it("preventDefault 호출 시 onValueChange가 실행되지 않음", async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn((e: React.MouseEvent) => {
        e.preventDefault();
      });
      const mockOnValueChange = vi.fn();

      render(
        <Select.Root onValueChange={mockOnValueChange}>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple" onClick={mockOnClick}>
              사과
            </Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const appleItem = screen.getByText("사과");
      await user.click(appleItem);

      // onClick은 호출되지만 onValueChange는 호출되지 않음
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      expect(mockOnValueChange).not.toHaveBeenCalled();
    });

    it("disabled item의 onClick은 호출되지 않음", async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Select.Root>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple" disabled onClick={mockOnClick}>
              사과
            </Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const appleItem = screen.getByText("사과");
      await user.click(appleItem);

      // disabled 상태이므로 onClick도 호출되지 않음
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("onClick에 이벤트 객체가 전달됨", async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Select.Root>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple" onClick={mockOnClick}>
              사과
            </Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const appleItem = screen.getByText("사과");
      await user.click(appleItem);

      // 이벤트 객체가 전달되었는지 확인
      expect(mockOnClick).toHaveBeenCalledTimes(1);
      const event = mockOnClick.mock.calls[0][0];
      expect(event).toBeInstanceOf(Object);
      expect(event.type).toBe("click");
    });
  });

  describe("키보드 네비게이션", () => {
    // ESC 키: 드롭다운 닫힘 + focus 복귀
    it("ESC 키로 드롭다운이 닫힘", async () => {
      const user = userEvent.setup();

      render(
        <Select.Root>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      await user.keyboard("{Escape}");

      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    // closeOnBackdrop={false}: ESC 키를 눌러도 닫히지 않음
    it("closeOnBackdrop={false}일 때 ESC 키를 눌러도 드롭다운이 닫히지 않음", async () => {
      const user = userEvent.setup();

      render(
        <Select.Root closeOnBackdrop={false}>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      await user.keyboard("{Escape}");

      // closeOnBackdrop={false}이므로 ESC 키를 눌러도 여전히 열려있어야 함
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });

    // closeOnBackdrop={{ escapeKey: false, clickOutside: true }}: ESC 키는 막히지만 외부 클릭은 가능
    it("closeOnBackdrop={{ escapeKey: false, clickOutside: true }}일 때 ESC 키가 막힘", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <Select.Root
            closeOnBackdrop={{ escapeKey: false, clickOutside: true }}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="apple">사과</Select.Item>
            </Select.Content>
          </Select.Root>
          <button>외부 버튼</button>
        </div>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      // ESC 키 시도
      await user.keyboard("{Escape}");

      // ESC 키가 막혀야 함
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      // 하지만 외부 클릭은 가능해야 함 (명시적으로 true로 설정)
      const outsideButton = screen.getByText("외부 버튼");
      await user.click(outsideButton);

      await waitFor(() => {
        expect(trigger).toHaveAttribute("aria-expanded", "false");
      });
    });

    // closeOnBackdrop={{ escapeKey: true }}: ESC 키로 닫힘
    it("closeOnBackdrop={{ escapeKey: true }}일 때 ESC 키로 닫힘", async () => {
      const user = userEvent.setup();

      render(
        <Select.Root closeOnBackdrop={{ escapeKey: true }}>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      await user.keyboard("{Escape}");

      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    // closeOnBackdrop={{ clickOutside: false, escapeKey: true }}: ESC만 가능
    it("closeOnBackdrop={{ clickOutside: false, escapeKey: true }}일 때 ESC 키만 가능", async () => {
      const user = userEvent.setup();

      render(
        <div>
          <Select.Root
            closeOnBackdrop={{ clickOutside: false, escapeKey: true }}
          >
            <Select.Trigger>
              <Select.Value />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="apple">사과</Select.Item>
            </Select.Content>
          </Select.Root>
          <button>외부 버튼</button>
        </div>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      // 외부 클릭 시도 - 막혀야 함
      const outsideButton = screen.getByText("외부 버튼");
      await user.click(outsideButton);
      expect(trigger).toHaveAttribute("aria-expanded", "true");

      // ESC 키 - 닫혀야 함
      await user.keyboard("{Escape}");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });
  });

  describe("Controlled/Uncontrolled", () => {
    // Uncontrolled: defaultValue로 초기값 설정
    it("defaultValue로 초기값이 설정됨", async () => {
      const user = userEvent.setup();

      render(
        <Select.Root defaultValue="banana">
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
            <Select.Item value="banana">바나나</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const options = screen.getAllByRole("option");
      const bananaOption = options.find((opt) => opt.textContent === "바나나");
      expect(bananaOption).toHaveAttribute("aria-selected", "true");
    });

    // Controlled: value prop으로 제어
    it("value prop으로 외부에서 값이 제어됨", async () => {
      const user = userEvent.setup();

      const ControlledSelect = () => {
        const [value, setValue] = React.useState<string | number>("apple");

        return (
          <div>
            <Select.Root value={value} onValueChange={setValue}>
              <Select.Trigger>
                <Select.Value />
              </Select.Trigger>
              <Select.Content>
                <Select.Item value="apple">사과</Select.Item>
                <Select.Item value="banana">바나나</Select.Item>
              </Select.Content>
            </Select.Root>
            <button onClick={() => setValue("banana")}>바나나로 변경</button>
          </div>
        );
      };

      render(<ControlledSelect />);

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const options = screen.getAllByRole("option");
      const appleOption = options.find((opt) => opt.textContent === "사과");
      expect(appleOption).toHaveAttribute("aria-selected", "true");

      await user.click(trigger); // 드롭다운 닫기

      const changeButton = screen.getByText("바나나로 변경");
      await user.click(changeButton);

      await user.click(trigger); // 드롭다운 다시 열기

      const updatedOptions = screen.getAllByRole("option");
      const bananaOption = updatedOptions.find(
        (opt) => opt.textContent === "바나나"
      );
      expect(bananaOption).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("접근성", () => {
    // ARIA 속성: combobox role + haspopup + expanded + controls
    it("trigger에 올바른 ARIA 속성이 설정됨", () => {
      render(
        <Select.Root>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveAttribute("aria-haspopup", "listbox");
      expect(trigger).toHaveAttribute("aria-expanded", "false");
      expect(trigger).toHaveAttribute("aria-controls");
    });

    // listbox role: Content에 listbox role 설정
    it("content에 listbox role이 설정됨", async () => {
      const user = userEvent.setup();

      render(
        <Select.Root>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      expect(screen.getByRole("listbox")).toBeInTheDocument();
    });

    // option role: Item에 option role 설정
    it("item에 option role이 설정됨", async () => {
      const user = userEvent.setup();

      render(
        <Select.Root>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
            <Select.Item value="banana">바나나</Select.Item>
            <Select.Item value="orange">오렌지</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const options = screen.getAllByRole("option");
      expect(options).toHaveLength(3);
    });

    // aria-selected: 선택된 Item에만 true
    it("선택된 item에 aria-selected='true'가 설정됨", async () => {
      const user = userEvent.setup();

      render(
        <Select.Root>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
            <Select.Item value="banana">바나나</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const appleItem = screen.getByText("사과");
      await user.click(appleItem);

      await user.click(trigger); // 드롭다운 다시 열기

      const options = screen.getAllByRole("option");
      const selectedApple = options.find((opt) => opt.textContent === "사과");
      expect(selectedApple).toHaveAttribute("aria-selected", "true");
    });

    // aria-disabled: disabled Item에 설정
    it("disabled item에 aria-disabled='true'가 설정됨", async () => {
      const user = userEvent.setup();

      render(
        <Select.Root>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
            <Select.Item value="banana" disabled>
              바나나
            </Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const bananaItem = screen.getByText("바나나");
      expect(bananaItem).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("AsChild 패턴", () => {
    // asChild: Trigger를 다른 요소로 렌더링
    it("asChild가 true면 자식 요소로 렌더링됨", async () => {
      const user = userEvent.setup();

      render(
        <Select.Root>
          <Select.Trigger asChild>
            <button className="custom-button">
              <Select.Value placeholder="선택" />
            </button>
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      // combobox role로 Trigger 찾기 (asChild로 button이지만 role은 유지됨)
      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveClass("custom-button");
      expect(trigger.tagName).toBe("BUTTON");

      await user.click(trigger);
      expect(trigger).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Ref 전달", () => {
    // Ref 전달: Trigger에 ref 전달
    it("trigger로 ref가 전달됨", () => {
      const ref = React.createRef<HTMLButtonElement>();

      render(
        <Select.Root>
          <Select.Trigger ref={ref}>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
      expect(ref.current?.tagName).toBe("BUTTON");
    });

    // Ref 전달: Content에 ref 전달
    it("content로 ref가 전달됨", async () => {
      const user = userEvent.setup();
      const ref = React.createRef<HTMLDivElement>();

      render(
        <Select.Root>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content ref={ref}>
            <Select.Item value="apple">사과</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.tagName).toBe("DIV");
    });
  });

  describe("Context", () => {
    // Context 에러: Trigger를 Root 밖에서 사용
    it("Trigger를 Root 밖에서 사용 시 에러 발생", () => {
      // console.error를 mock하여 에러 메시지 숨김
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
        );
      }).toThrow("Select components must be used within Select.Root");

      consoleError.mockRestore();
    });

    // Context 에러: Content를 Root 밖에서 사용
    it("Content를 Root 밖에서 사용 시 에러 발생", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
          </Select.Content>
        );
      }).toThrow("Select components must be used within Select.Root");

      consoleError.mockRestore();
    });

    // Context 에러: Item을 Root 밖에서 사용
    it("Item을 Root 밖에서 사용 시 에러 발생", () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<Select.Item value="apple">사과</Select.Item>);
      }).toThrow("Select components must be used within Select.Root");

      consoleError.mockRestore();
    });
  });

  describe("커스터마이징", () => {
    // color prop: CSS 변수로 설정
    it("color prop이 CSS 변수로 설정됨", () => {
      render(
        <Select.Root color="#10b981">
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      expect(trigger).toHaveStyle({ "--motile-select-color": "#10b981" });
    });

    // zIndex prop: z-index 설정
    it("zIndex prop이 적용됨", async () => {
      const user = userEvent.setup();

      render(
        <Select.Root zIndex={9999}>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content data-testid="content">
            <Select.Item value="apple">사과</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const content = screen.getByTestId("content");
      expect(content).toHaveStyle({ zIndex: 9999 });
    });

    // hideCheckIcon prop: 체크 아이콘 숨김
    it("hideCheckIcon이 true면 체크 아이콘이 표시되지 않음", async () => {
      const user = userEvent.setup();

      render(
        <Select.Root hideCheckIcon>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
            <Select.Item value="banana">바나나</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const appleItem = screen.getByText("사과");
      await user.click(appleItem);

      await user.click(trigger); // 드롭다운 다시 열기

      // 체크 아이콘(svg)이 없어야 함
      const appleOption = screen
        .getAllByRole("option")
        .find((opt) => opt.textContent === "사과");
      const checkIcon = appleOption?.querySelector("svg");
      expect(checkIcon).not.toBeInTheDocument();
    });
  });

  describe("하이브리드 패턴 (Hybrid Pattern)", () => {
    // Number 타입 값 지원
    it("number 타입 값을 지원함", async () => {
      const user = userEvent.setup();
      const handleChange = vi.fn();

      render(
        <Select.Root onValueChange={handleChange}>
          <Select.Trigger>
            <Select.Value />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value={1}>Option 1</Select.Item>
            <Select.Item value={2}>Option 2</Select.Item>
            <Select.Item value={3}>Option 3</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const option2 = screen.getByText("Option 2");
      await user.click(option2);

      expect(handleChange).toHaveBeenCalledWith(2);
    });

    // selected prop으로 외부에서 선택 상태 제어
    it("selected prop으로 선택 상태가 제어됨", async () => {
      const user = userEvent.setup();

      interface Item {
        id: number;
        label: string;
      }

      const items: Item[] = [
        { id: 1, label: "항목 1" },
        { id: 2, label: "항목 2" },
      ];

      const TestComponent = () => {
        const [selectedItem, setSelectedItem] = React.useState<Item | null>(
          items[0]
        );

        return (
          <Select.Root>
            <Select.Trigger>
              <Select.Value placeholder="선택" />
            </Select.Trigger>
            <Select.Content>
              {items.map((item) => (
                <Select.Item
                  key={item.id}
                  selected={selectedItem?.id === item.id}
                  onClick={() => setSelectedItem(item)}
                >
                  {item.label}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        );
      };

      render(<TestComponent />);

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      // 항목 1이 선택되어 있어야 함
      const options = screen.getAllByRole("option");
      const item1 = options.find((opt) => opt.textContent === "항목 1");
      expect(item1).toHaveAttribute("aria-selected", "true");
    });

    // value prop 없이 onClick만으로 동작
    it("value prop 없이 onClick만으로 동작함", async () => {
      const user = userEvent.setup();
      const mockOnClick = vi.fn();

      render(
        <Select.Root>
          <Select.Trigger>
            <Select.Value placeholder="선택" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item onClick={mockOnClick}>항목</Select.Item>
          </Select.Content>
        </Select.Root>
      );

      const trigger = screen.getByRole("combobox");
      await user.click(trigger);

      const item = screen.getByText("항목");
      await user.click(item);

      // onClick이 호출되어야 함
      expect(mockOnClick).toHaveBeenCalledTimes(1);

      // 드롭다운이 닫혀야 함 (value prop이 없어도 자동으로 닫힘)
      expect(trigger).toHaveAttribute("aria-expanded", "false");
    });

    // 객체 데이터 패턴 통합 테스트
    it("객체 데이터 패턴이 정상 동작함", async () => {
      const user = userEvent.setup();

      interface User {
        id: number;
        name: string;
        email: string;
      }

      const users: User[] = [
        { id: 1, name: "Alice", email: "alice@example.com" },
        { id: 2, name: "Bob", email: "bob@example.com" },
      ];

      const TestComponent = () => {
        const [selectedUser, setSelectedUser] = React.useState<User | null>(
          null
        );

        return (
          <div>
            <Select.Root>
              <Select.Trigger>
                {selectedUser ? (
                  <span>{selectedUser.name}</span>
                ) : (
                  <Select.Value placeholder="사용자 선택" />
                )}
              </Select.Trigger>
              <Select.Content>
                {users.map((user) => (
                  <Select.Item
                    key={user.id}
                    selected={selectedUser?.id === user.id}
                    onClick={() => setSelectedUser(user)}
                  >
                    {user.name}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
            {selectedUser && (
              <div data-testid="email">{selectedUser.email}</div>
            )}
          </div>
        );
      };

      render(<TestComponent />);

      const trigger = screen.getByRole("combobox");

      // 초기 상태: placeholder 표시
      expect(trigger).toHaveTextContent("사용자 선택");

      // Alice 선택
      await user.click(trigger);
      const aliceItem = screen.getByText("Alice");
      await user.click(aliceItem);

      // 드롭다운이 닫혀야 함
      expect(trigger).toHaveAttribute("aria-expanded", "false");

      // Trigger에 Alice 이름이 표시되어야 함
      expect(trigger).toHaveTextContent("Alice");

      // 이메일이 표시되어야 함
      expect(screen.getByTestId("email")).toHaveTextContent(
        "alice@example.com"
      );

      // Bob으로 변경
      await user.click(trigger);
      const bobItem = screen.getByText("Bob");
      await user.click(bobItem);

      // Bob의 정보로 업데이트되어야 함
      expect(trigger).toHaveTextContent("Bob");
      expect(screen.getByTestId("email")).toHaveTextContent("bob@example.com");
    });
  });
});
