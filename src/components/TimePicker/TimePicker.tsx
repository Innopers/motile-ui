import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import "./TimePicker.css";

// ============================================================================
// 타입 정의
// ============================================================================

export type TimeFormat = "12" | "24";
export type TimePeriod = "AM" | "PM";
export type MinuteStep = 1 | 5 | 10 | 15 | 30;

export interface TimeValue {
  hour: number;
  minute: number;
  period?: TimePeriod;
}

// ============================================================================
// Context
// ============================================================================

interface TimePickerContextValue {
  value: TimeValue;
  format: TimeFormat;
  minuteStep: MinuteStep;
  disabled: boolean;
  itemHeight: number;
  updateValue: (
    type: "hour" | "minute" | "period",
    newValue: number | TimePeriod
  ) => void;
  hourOptions: number[];
  minuteOptions: number[];
  periodOptions: TimePeriod[];
}

const TimePickerContext = createContext<TimePickerContextValue | null>(null);

const useTimePickerContext = () => {
  const context = useContext(TimePickerContext);
  if (!context) {
    throw new Error(
      "TimePicker components must be used within TimePicker.Root"
    );
  }
  return context;
};

// ============================================================================
// TimePicker.Root
// 시간 선택기 상태를 관리하는 최상위 컴포넌트
// Controlled/Uncontrolled 모드 모두 지원
// ============================================================================

export interface TimePickerRootProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> {
  value?: TimeValue;
  defaultValue?: TimeValue;
  onChange?: (time: TimeValue) => void;
  format?: TimeFormat;
  minuteStep?: MinuteStep;
  disabled?: boolean;
  itemHeight?: number;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const TimePickerRoot = forwardRef<HTMLDivElement, TimePickerRootProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onChange,
      format = "12",
      minuteStep = 5,
      disabled = false,
      itemHeight = 40,
      fullWidth = false,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const [internalValue, setInternalValue] = useState<TimeValue>(() => {
      if (controlledValue) return controlledValue;
      if (defaultValue) return defaultValue;
      return {
        hour: format === "12" ? 12 : 0,
        minute: 0,
        period: format === "12" ? "AM" : undefined,
      };
    });

    const isControlled = controlledValue !== undefined;
    const currentValue = isControlled ? controlledValue : internalValue;

    const hourOptions = useMemo(() => {
      if (format === "12") {
        return Array.from({ length: 12 }, (_, i) => i + 1);
      } else {
        return Array.from({ length: 24 }, (_, i) => i);
      }
    }, [format]);

    const minuteOptions = useMemo(() => {
      const length = 60 / minuteStep;
      return Array.from({ length }, (_, i) => i * minuteStep);
    }, [minuteStep]);

    const periodOptions: TimePeriod[] = useMemo(() => ["AM", "PM"], []);

    const updateValue = useCallback(
      (type: "hour" | "minute" | "period", newValue: number | TimePeriod) => {
        const newTimeValue: TimeValue = { ...currentValue };

        if (type === "hour") {
          newTimeValue.hour = newValue as number;
        } else if (type === "minute") {
          newTimeValue.minute = newValue as number;
        } else {
          newTimeValue.period = newValue as TimePeriod;
        }

        if (!isControlled) {
          setInternalValue(newTimeValue);
        }
        onChange?.(newTimeValue);
      },
      [currentValue, isControlled, onChange]
    );

    const contextValue: TimePickerContextValue = {
      value: currentValue,
      format,
      minuteStep,
      disabled,
      itemHeight,
      updateValue,
      hourOptions,
      minuteOptions,
      periodOptions,
    };

    const rootStyle: React.CSSProperties = {
      "--timepicker-item-height": `${itemHeight}px`,
      ...style,
    } as React.CSSProperties;

    return (
      <TimePickerContext.Provider value={contextValue}>
        <div
          ref={ref}
          className={`motile-timepicker ${disabled ? "motile-timepicker--disabled" : ""} ${fullWidth ? "motile-timepicker--full-width" : ""} ${className || ""}`}
          style={rootStyle}
          aria-disabled={disabled}
          role="group"
          aria-label="시간 선택"
          {...props}
        >
          {children}
        </div>
      </TimePickerContext.Provider>
    );
  }
);

TimePickerRoot.displayName = "TimePicker.Root";

// ============================================================================
// TimePicker.Column
// 시간, 분, AM/PM 선택을 위한 스크롤 가능한 컬럼
// scroll-snap과 wheel 이벤트로 PC/모바일 모두 지원
// ============================================================================

export interface TimePickerColumnProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  type: "hour" | "minute" | "period";
}

export const TimePickerColumn = forwardRef<
  HTMLDivElement,
  TimePickerColumnProps
>(({ type, className, ...props }, ref) => {
  const {
    value,
    disabled,
    itemHeight,
    updateValue,
    hourOptions,
    minuteOptions,
    periodOptions,
  } = useTimePickerContext();

  const columnRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isExternalUpdateRef = useRef(false);
  const isWheelScrollingRef = useRef(false);
  const accumulatedDeltaRef = useRef(0);
  const wheelDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isInitialMountRef = useRef(true);

  // PC 드래그 스크롤 관련 refs
  const isDraggingRef = useRef(false);
  const dragStartYRef = useRef(0);
  const dragStartScrollTopRef = useRef(0);

  const options = useMemo(() => {
    switch (type) {
      case "hour":
        return hourOptions;
      case "minute":
        return minuteOptions;
      case "period":
        return periodOptions;
      default:
        return [];
    }
  }, [type, hourOptions, minuteOptions, periodOptions]);

  const currentValue = useMemo(() => {
    switch (type) {
      case "hour":
        return value.hour;
      case "minute":
        return value.minute;
      case "period":
        return value.period;
      default:
        return undefined;
    }
  }, [type, value]);

  const formatValue = useCallback(
    (val: number | TimePeriod): string => {
      if (type === "period") {
        return val as string;
      }
      return (val as number).toString().padStart(2, "0");
    },
    [type]
  );

  const scrollToValue = useCallback(
    (targetValue: number | TimePeriod | undefined, smooth = true) => {
      const container = columnRef.current;
      if (!container || targetValue === undefined) return;

      const index = options.indexOf(targetValue as never);
      if (index === -1) return;

      const scrollTop = index * itemHeight;
      container.scrollTo({
        top: scrollTop,
        behavior: smooth ? "smooth" : "auto",
      });
    },
    [options, itemHeight]
  );

  const isTouchDevice = useCallback(() => {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(hover: none) and (pointer: coarse)").matches
    );
  }, []);

  // PC 휠 이벤트 처리 (단일/다중 스텝 스크롤 지원)
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (isTouchDevice()) return;

      e.preventDefault();

      const container = columnRef.current;
      if (!container) return;

      accumulatedDeltaRef.current += e.deltaY;

      if (wheelDebounceRef.current) {
        clearTimeout(wheelDebounceRef.current);
      }

      isWheelScrollingRef.current = true;

      wheelDebounceRef.current = setTimeout(() => {
        const delta = accumulatedDeltaRef.current;
        const minThreshold = 20;
        const pixelsPerStep = 80;

        let steps = 0;
        if (Math.abs(delta) >= minThreshold) {
          const direction = Math.sign(delta);
          steps =
            direction *
            Math.max(1, Math.round(Math.abs(delta) / pixelsPerStep));
        }

        if (steps !== 0) {
          const currentIndex = options.indexOf(currentValue as never);
          const nextIndex = Math.max(
            0,
            Math.min(currentIndex + steps, options.length - 1)
          );

          if (nextIndex !== currentIndex) {
            const nextValue = options[nextIndex];
            const scrollTop = nextIndex * itemHeight;

            container.scrollTo({ top: scrollTop, behavior: "smooth" });
            updateValue(type, nextValue as number | TimePeriod);
          }
        }

        accumulatedDeltaRef.current = 0;

        setTimeout(() => {
          isWheelScrollingRef.current = false;
        }, 150);
      }, 50);
    },
    [options, itemHeight, currentValue, updateValue, type, isTouchDevice]
  );

  // PC 드래그 스크롤 - 드래그 시작
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (isTouchDevice() || disabled) return;

      const container = columnRef.current;
      if (!container) return;

      isDraggingRef.current = true;
      dragStartYRef.current = e.clientY;
      dragStartScrollTopRef.current = container.scrollTop;
      container.style.cursor = "grabbing";

      e.preventDefault();
    },
    [isTouchDevice, disabled]
  );

  // PC 드래그 스크롤 - 드래그 중 (document에 등록)
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDraggingRef.current) return;

    const container = columnRef.current;
    if (!container) return;

    const deltaY = dragStartYRef.current - e.clientY;
    container.scrollTop = dragStartScrollTopRef.current + deltaY;
  }, []);

  // PC 드래그 스크롤 - 드래그 종료 + 스냅 (document에 등록)
  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;

    const container = columnRef.current;
    if (!container) return;

    container.style.cursor = "grab";

    // 현재 스크롤 위치에서 가장 가까운 아이템으로 스냅
    const scrollTop = container.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
    const targetScrollTop = clampedIndex * itemHeight;

    container.scrollTo({ top: targetScrollTop, behavior: "smooth" });

    const selectedValue = options[clampedIndex];
    if (selectedValue !== undefined && selectedValue !== currentValue) {
      updateValue(type, selectedValue as number | TimePeriod);
    }
  }, [options, itemHeight, currentValue, updateValue, type]);

  // 스크롤 종료 감지 후 값 업데이트
  const handleScroll = useCallback(() => {
    // 휠 스크롤 또는 드래그 중에는 무시
    if (isWheelScrollingRef.current || isDraggingRef.current) return;

    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    // 터치: 50ms, PC: 100ms
    const debounceTime = isTouchDevice() ? 50 : 100;

    scrollTimeoutRef.current = setTimeout(() => {
      const container = columnRef.current;
      if (!container) return;

      if (isExternalUpdateRef.current) {
        isExternalUpdateRef.current = false;
        return;
      }

      const scrollTop = container.scrollTop;
      const index = Math.round(scrollTop / itemHeight);
      const clampedIndex = Math.max(0, Math.min(index, options.length - 1));
      const selectedValue = options[clampedIndex];

      if (selectedValue !== undefined && selectedValue !== currentValue) {
        updateValue(type, selectedValue as number | TimePeriod);
      }
    }, debounceTime);
  }, [options, itemHeight, currentValue, updateValue, type, isTouchDevice]);

  // 초기 스크롤 위치 설정
  useEffect(() => {
    if (!isInitialMountRef.current) return;
    isInitialMountRef.current = false;

    const timeoutId = setTimeout(() => {
      scrollToValue(currentValue, false);
    }, 0);

    return () => clearTimeout(timeoutId);
  }, [scrollToValue, currentValue]);

  // 외부 값 변경 시 스크롤 동기화
  useEffect(() => {
    const container = columnRef.current;
    if (!container || currentValue === undefined) return;

    const targetIndex = options.indexOf(currentValue as never);
    if (targetIndex === -1) return;

    const targetScrollTop = targetIndex * itemHeight;
    const currentScrollTop = container.scrollTop;

    if (Math.abs(currentScrollTop - targetScrollTop) > 1) {
      isExternalUpdateRef.current = true;
      scrollToValue(currentValue, true);

      setTimeout(() => {
        isExternalUpdateRef.current = false;
      }, 200);
    }
  }, [currentValue, scrollToValue, options, itemHeight]);

  // PC 휠 이벤트 리스너 등록
  useEffect(() => {
    const container = columnRef.current;
    if (!container) return;

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel]);

  // PC 드래그 스크롤 - document 이벤트 리스너 등록
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current !== null) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={(node) => {
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
        (columnRef as React.MutableRefObject<HTMLDivElement | null>).current =
          node;
      }}
      className={`motile-timepicker__column ${className || ""}`}
      onScroll={handleScroll}
      onMouseDown={handleMouseDown}
      role="listbox"
      aria-label={`${type} selector`}
      aria-orientation="vertical"
      {...props}
    >
      <div
        className="motile-timepicker__spacer"
        style={{ height: itemHeight }}
        aria-hidden="true"
      />

      {options.map((option, index) => {
        const isSelected = option === currentValue;

        return (
          <div
            key={index}
            className={`motile-timepicker__item ${isSelected ? "motile-timepicker__item--selected" : ""} ${disabled ? "motile-timepicker__item--disabled" : ""}`}
            style={{ height: itemHeight }}
            role="option"
            aria-selected={isSelected}
            data-value={option}
          >
            {formatValue(option)}
          </div>
        );
      })}

      <div
        className="motile-timepicker__spacer"
        style={{ height: itemHeight }}
        aria-hidden="true"
      />
    </div>
  );
});

TimePickerColumn.displayName = "TimePicker.Column";

// ============================================================================
// TimePicker.Highlight
// 현재 선택된 값을 시각적으로 표시하는 하이라이트 영역 (선택적)
// ============================================================================

export interface TimePickerHighlightProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TimePickerHighlight = forwardRef<
  HTMLDivElement,
  TimePickerHighlightProps
>(({ className, style, ...props }, ref) => {
  const { itemHeight } = useTimePickerContext();

  const highlightStyle: React.CSSProperties = {
    height: itemHeight,
    ...style,
  };

  return (
    <div
      ref={ref}
      className={`motile-timepicker__highlight ${className || ""}`}
      style={highlightStyle}
      aria-hidden="true"
      {...props}
    />
  );
});

TimePickerHighlight.displayName = "TimePicker.Highlight";

// ============================================================================
// Export
// ============================================================================

export const TimePicker = {
  Root: TimePickerRoot,
  Column: TimePickerColumn,
  Highlight: TimePickerHighlight,
};
