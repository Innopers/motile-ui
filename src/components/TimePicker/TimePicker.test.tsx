import React from "react";

import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@/test/utils";

import { TimePicker } from "./TimePicker";

// 기본 렌더링 헬퍼
const renderTimePicker = (
  props: Omit<React.ComponentProps<typeof TimePicker.Root>, "children"> = {}
) => {
  return render(
    <TimePicker.Root {...props}>
      <TimePicker.Column type="hour" />
      <TimePicker.Column type="minute" />
      <TimePicker.Column type="period" />
      <TimePicker.Highlight />
    </TimePicker.Root>
  );
};

// 24시간 형식 헬퍼
const renderTimePicker24 = (
  props: Omit<
    React.ComponentProps<typeof TimePicker.Root>,
    "children" | "format"
  > = {}
) => {
  return render(
    <TimePicker.Root format="24" {...props}>
      <TimePicker.Column type="hour" />
      <TimePicker.Column type="minute" />
      <TimePicker.Highlight />
    </TimePicker.Root>
  );
};

describe("TimePicker", () => {
  describe("TimePicker.Root", () => {
    it("기본으로 렌더링되어야 한다", () => {
      renderTimePicker();

      const root = screen.getByRole("group");
      expect(root).toBeInTheDocument();
      expect(root).toHaveClass("motile-timepicker");
    });

    it("커스텀 className이 적용되어야 한다", () => {
      renderTimePicker({ className: "custom-class" });

      const root = screen.getByRole("group");
      expect(root).toHaveClass("custom-class");
      expect(root).toHaveClass("motile-timepicker");
    });

    it("disabled 상태가 적용되어야 한다", () => {
      renderTimePicker({ disabled: true });

      const root = screen.getByRole("group");
      expect(root).toHaveClass("motile-timepicker--disabled");
      expect(root).toHaveAttribute("aria-disabled", "true");
    });

    it("aria-label이 기본값으로 설정되어야 한다", () => {
      renderTimePicker();

      const root = screen.getByLabelText("시간 선택");
      expect(root).toBeInTheDocument();
    });

    it("커스텀 aria-label이 적용되어야 한다", () => {
      renderTimePicker({ "aria-label": "회의 시간" });

      const root = screen.getByLabelText("회의 시간");
      expect(root).toBeInTheDocument();
    });

    it("itemHeight가 CSS 변수로 설정되어야 한다", () => {
      renderTimePicker({ itemHeight: 50 });

      const root = screen.getByRole("group");
      expect(root).toHaveStyle({ "--timepicker-item-height": "50px" });
    });
  });

  describe("TimePicker.Column", () => {
    it("12시간 형식에서 hour 컬럼이 12개 옵션을 가져야 한다", () => {
      renderTimePicker({ format: "12" });

      const hourColumn = screen.getByRole("listbox", { name: /hour/i });
      const options = hourColumn.querySelectorAll('[role="option"]');
      expect(options).toHaveLength(12);
    });

    it("24시간 형식에서 hour 컬럼이 24개 옵션을 가져야 한다", () => {
      renderTimePicker24();

      const hourColumn = screen.getByRole("listbox", { name: /hour/i });
      const options = hourColumn.querySelectorAll('[role="option"]');
      expect(options).toHaveLength(24);
    });

    it("minuteStep에 따라 minute 옵션 개수가 달라져야 한다", () => {
      // minuteStep: 5 (기본값) -> 12개 옵션
      const { unmount } = renderTimePicker({ minuteStep: 5 });
      let minuteColumn = screen.getByRole("listbox", { name: /minute/i });
      let options = minuteColumn.querySelectorAll('[role="option"]');
      expect(options).toHaveLength(12);
      unmount();

      // minuteStep: 15 -> 4개 옵션
      renderTimePicker({ minuteStep: 15 });
      minuteColumn = screen.getByRole("listbox", { name: /minute/i });
      options = minuteColumn.querySelectorAll('[role="option"]');
      expect(options).toHaveLength(4);
    });

    it("period 컬럼이 AM/PM 2개 옵션을 가져야 한다", () => {
      renderTimePicker({ format: "12" });

      const periodColumn = screen.getByRole("listbox", { name: /period/i });
      const options = periodColumn.querySelectorAll('[role="option"]');
      expect(options).toHaveLength(2);
      expect(options[0].textContent).toBe("AM");
      expect(options[1].textContent).toBe("PM");
    });

    it("24시간 형식에서 period 컬럼이 없어야 한다", () => {
      renderTimePicker24();

      const periodColumn = screen.queryByRole("listbox", { name: /period/i });
      expect(periodColumn).not.toBeInTheDocument();
    });

    it("컬럼에 aria-orientation이 설정되어야 한다", () => {
      renderTimePicker();

      const columns = screen.getAllByRole("listbox");
      columns.forEach((column) => {
        expect(column).toHaveAttribute("aria-orientation", "vertical");
      });
    });

    it("커스텀 className이 컬럼에 적용되어야 한다", () => {
      render(
        <TimePicker.Root>
          <TimePicker.Column type="hour" className="custom-column" />
        </TimePicker.Root>
      );

      const column = screen.getByRole("listbox");
      expect(column).toHaveClass("custom-column");
      expect(column).toHaveClass("motile-timepicker__column");
    });

    it("시간이 2자리로 포맷팅되어야 한다", () => {
      renderTimePicker24();

      const hourColumn = screen.getByRole("listbox", { name: /hour/i });
      const options = hourColumn.querySelectorAll('[role="option"]');
      expect(options[0].textContent).toBe("00");
      expect(options[9].textContent).toBe("09");
    });

    it("분이 2자리로 포맷팅되어야 한다", () => {
      renderTimePicker({ minuteStep: 5 });

      const minuteColumn = screen.getByRole("listbox", { name: /minute/i });
      const options = minuteColumn.querySelectorAll('[role="option"]');
      expect(options[0].textContent).toBe("00");
      expect(options[1].textContent).toBe("05");
    });
  });

  describe("TimePicker.Highlight", () => {
    it("하이라이트가 렌더링되어야 한다", () => {
      const { container } = renderTimePicker();

      const highlight = container.querySelector(
        ".motile-timepicker__highlight"
      );
      expect(highlight).toBeInTheDocument();
    });

    it("하이라이트에 aria-hidden이 설정되어야 한다", () => {
      const { container } = renderTimePicker();

      const highlight = container.querySelector(
        ".motile-timepicker__highlight"
      );
      expect(highlight).toHaveAttribute("aria-hidden", "true");
    });

    it("커스텀 className이 하이라이트에 적용되어야 한다", () => {
      render(
        <TimePicker.Root>
          <TimePicker.Column type="hour" />
          <TimePicker.Highlight className="custom-highlight" />
        </TimePicker.Root>
      );

      const highlight = document.querySelector(".motile-timepicker__highlight");
      expect(highlight).toHaveClass("custom-highlight");
    });

    it("하이라이트 없이 사용할 수 있어야 한다", () => {
      const { container } = render(
        <TimePicker.Root>
          <TimePicker.Column type="hour" />
          <TimePicker.Column type="minute" />
        </TimePicker.Root>
      );

      const highlight = container.querySelector(
        ".motile-timepicker__highlight"
      );
      expect(highlight).not.toBeInTheDocument();
    });
  });

  describe("값 제어", () => {
    it("defaultValue가 올바르게 설정되어야 한다", () => {
      renderTimePicker({
        defaultValue: { hour: 3, minute: 45, period: "PM" },
      });

      const hourColumn = screen.getByRole("listbox", { name: /hour/i });
      expect(hourColumn).toBeInTheDocument();
    });

    it("controlled value가 올바르게 작동해야 한다", () => {
      const onChange = vi.fn();

      const { rerender } = render(
        <TimePicker.Root
          value={{ hour: 10, minute: 30, period: "AM" }}
          onChange={onChange}
        >
          <TimePicker.Column type="hour" />
          <TimePicker.Column type="minute" />
          <TimePicker.Column type="period" />
        </TimePicker.Root>
      );

      expect(
        screen.getByRole("listbox", { name: /hour/i })
      ).toBeInTheDocument();

      // 값 변경
      rerender(
        <TimePicker.Root
          value={{ hour: 11, minute: 45, period: "PM" }}
          onChange={onChange}
        >
          <TimePicker.Column type="hour" />
          <TimePicker.Column type="minute" />
          <TimePicker.Column type="period" />
        </TimePicker.Root>
      );

      expect(
        screen.getByRole("listbox", { name: /hour/i })
      ).toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    it("각 옵션에 aria-selected가 설정되어야 한다", () => {
      renderTimePicker();

      const options = screen.getAllByRole("option");
      expect(options.length).toBeGreaterThan(0);

      options.forEach((option) => {
        expect(option).toHaveAttribute("aria-selected");
      });
    });

    it("spacer에 aria-hidden이 설정되어야 한다", () => {
      const { container } = renderTimePicker();

      const spacers = container.querySelectorAll(".motile-timepicker__spacer");
      expect(spacers.length).toBeGreaterThan(0);

      spacers.forEach((spacer) => {
        expect(spacer).toHaveAttribute("aria-hidden", "true");
      });
    });
  });

  describe("Ref 전달", () => {
    it("Root에 ref가 전달되어야 한다", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <TimePicker.Root ref={ref}>
          <TimePicker.Column type="hour" />
        </TimePicker.Root>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.className).toContain("motile-timepicker");
    });

    it("Column에 ref가 전달되어야 한다", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <TimePicker.Root>
          <TimePicker.Column type="hour" ref={ref} />
        </TimePicker.Root>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.className).toContain("motile-timepicker__column");
    });

    it("Highlight에 ref가 전달되어야 한다", () => {
      const ref = React.createRef<HTMLDivElement>();

      render(
        <TimePicker.Root>
          <TimePicker.Column type="hour" />
          <TimePicker.Highlight ref={ref} />
        </TimePicker.Root>
      );

      expect(ref.current).toBeInstanceOf(HTMLDivElement);
      expect(ref.current?.className).toContain("motile-timepicker__highlight");
    });
  });

  describe("Context 에러", () => {
    it("Root 외부에서 Column 사용 시 에러가 발생해야 한다", () => {
      // 콘솔 에러 억제
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<TimePicker.Column type="hour" />);
      }).toThrow("TimePicker components must be used within TimePicker.Root");

      consoleSpy.mockRestore();
    });

    it("Root 외부에서 Highlight 사용 시 에러가 발생해야 한다", () => {
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        render(<TimePicker.Highlight />);
      }).toThrow("TimePicker components must be used within TimePicker.Root");

      consoleSpy.mockRestore();
    });
  });

  describe("스타일링", () => {
    it("커스텀 style이 Root에 적용되어야 한다", () => {
      renderTimePicker({ style: { backgroundColor: "red" } });

      const root = screen.getByRole("group");
      expect(root).toHaveStyle({ backgroundColor: "red" });
    });

    it("커스텀 style이 Column에 적용되어야 한다", () => {
      render(
        <TimePicker.Root>
          <TimePicker.Column type="hour" style={{ minWidth: "100px" }} />
        </TimePicker.Root>
      );

      const column = screen.getByRole("listbox");
      expect(column).toHaveStyle({ minWidth: "100px" });
    });

    it("커스텀 style이 Highlight에 적용되어야 한다", () => {
      const { container } = render(
        <TimePicker.Root>
          <TimePicker.Column type="hour" />
          <TimePicker.Highlight style={{ backgroundColor: "blue" }} />
        </TimePicker.Root>
      );

      const highlight = container.querySelector(
        ".motile-timepicker__highlight"
      );
      expect(highlight).toHaveStyle({ backgroundColor: "blue" });
    });
  });
});
