import React, {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { Slot } from "@/utils/Slot";

import "./Tab.css";

const BASE = "motile-tab";

// ===========================
// 타입 정의
// ===========================

/**
 * Tab 스타일 variant
 * - `underlined`: 하단 언더라인 (기본)
 */
export type TabVariant = "underlined";

/**
 * Tab 방향
 * - `horizontal`: 좌우 배치 (기본)
 */
export type TabOrientation = "horizontal";

/**
 * Tab 활성화 모드
 * - `automatic`: 포커스 시 즉시 활성화 (기본)
 * - `manual`: Enter/Space로 활성화
 */
export type TabActivationMode = "automatic" | "manual";

// ===========================
// Context 정의
// ===========================

interface TabContextValue {
  value: string | undefined;
  onValueChange: (value: string) => void;
  orientation: TabOrientation;
  variant: TabVariant;
  activationMode: TabActivationMode;
  disabled: boolean;
  color?: string;
  // 내부 상태
  tabIds: Map<string, string>; // value -> trigger id
  panelIds: Map<string, string>; // value -> panel id
  triggerRefs: Map<string, React.RefObject<HTMLButtonElement>>;
  registerTab: (
    value: string,
    triggerId: string,
    panelId: string,
    ref: React.RefObject<HTMLButtonElement>
  ) => void;
  unregisterTab: (value: string) => void;
}

const TabContext = createContext<TabContextValue | null>(null);

const useTabContext = () => {
  const ctx = useContext(TabContext);
  if (!ctx) {
    throw new Error("Tab 컴포넌트는 Tab.Root 내에서 사용되어야 합니다");
  }
  return ctx;
};

// ===========================
// Tab.Root - Context Provider
// ===========================

export interface TabRootProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  /**
   * 선택된 Tab value (controlled)
   */
  value?: string;

  /**
   * 초기 선택 Tab value (uncontrolled)
   */
  defaultValue?: string;

  /**
   * 값 변경 콜백
   */
  onValueChange?: (value: string) => void;

  /**
   * Tab 활성화 모드
   * @default 'automatic'
   */
  activationMode?: TabActivationMode;

  /**
   * Tab 방향
   * @default 'horizontal'
   */
  orientation?: TabOrientation;

  /**
   * Tab 스타일 variant
   * @default 'underlined'
   */
  variant?: TabVariant;

  /**
   * 비활성화 여부
   * @default false
   */
  disabled?: boolean;

  /**
   * 커스텀 색상 (active tab, indicator)
   * @example '#10b981'
   */
  color?: string;

  /**
   * children을 wrapper 없이 직접 렌더링
   * @default false
   */
  asChild?: boolean;

  children: React.ReactNode;
}

const TabRoot = forwardRef<HTMLDivElement, TabRootProps>(
  (
    {
      value: controlledValue,
      defaultValue,
      onValueChange,
      activationMode = "automatic",
      orientation = "horizontal",
      variant = "underlined",
      disabled = false,
      color,
      className,
      children,
      asChild = false,
      style,
      ...props
    },
    ref
  ) => {
    const [uncontrolledValue, setUncontrolledValue] = useState<
      string | undefined
    >(defaultValue);

    // Controlled vs Uncontrolled 모드 처리
    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const handleValueChange = useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
      },
      [isControlled, onValueChange]
    );

    // Tab 레지스트리
    const tabIdsRef = useRef<Map<string, string>>(new Map());
    const panelIdsRef = useRef<Map<string, string>>(new Map());
    const triggerRefsRef = useRef<
      Map<string, React.RefObject<HTMLButtonElement>>
    >(new Map());

    const registerTab = useCallback(
      (
        tabValue: string,
        triggerId: string,
        panelId: string,
        triggerRef: React.RefObject<HTMLButtonElement>
      ) => {
        tabIdsRef.current.set(tabValue, triggerId);
        panelIdsRef.current.set(tabValue, panelId);
        triggerRefsRef.current.set(tabValue, triggerRef);
      },
      []
    );

    const unregisterTab = useCallback((tabValue: string) => {
      tabIdsRef.current.delete(tabValue);
      panelIdsRef.current.delete(tabValue);
      triggerRefsRef.current.delete(tabValue);
    }, []);

    const contextValue: TabContextValue = {
      value,
      onValueChange: handleValueChange,
      orientation,
      variant,
      activationMode,
      disabled,
      color,
      tabIds: tabIdsRef.current,
      panelIds: panelIdsRef.current,
      triggerRefs: triggerRefsRef.current,
      registerTab,
      unregisterTab,
    };

    const classes = [
      BASE,
      `${BASE}--${orientation}`,
      disabled && `${BASE}--disabled`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const inlineStyle: React.CSSProperties = {
      ...style,
      ...(color && ({ "--motile-tab-color": color } as React.CSSProperties)),
    };

    const rootProps = {
      ...props,
      "data-orientation": orientation,
      "data-disabled": disabled ? "" : undefined,
    };

    return (
      <TabContext.Provider value={contextValue}>
        {asChild ? (
          <Slot
            ref={ref}
            {...rootProps}
            className={className}
            style={inlineStyle}
          >
            {children}
          </Slot>
        ) : (
          <div {...rootProps} ref={ref} className={classes} style={inlineStyle}>
            {children}
          </div>
        )}
      </TabContext.Provider>
    );
  }
);

TabRoot.displayName = "Tab.Root";

// ===========================
// Tab.List - Tab 목록 컨테이너
// ===========================

export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * children을 wrapper 없이 직접 렌더링
   * @default false
   */
  asChild?: boolean;
}

const TabList = forwardRef<HTMLDivElement, TabListProps>(
  ({ className, children, asChild = false, ...props }, forwardedRef) => {
    const { orientation, variant } = useTabContext();
    const listRef = useRef<HTMLDivElement | null>(null);

    // forwardRef와 내부 ref 통합
    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        listRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef]
    );

    // 마우스 드래그 스크롤 구현
    useEffect(() => {
      const element = listRef.current;
      if (!element) return;

      let isDown = false;
      let hasMoved = false;
      let startX = 0;
      let scrollLeft = 0;
      let rafId: number | null = null;
      let lastScrollLeft = 0;

      const handleMouseDown = (e: MouseEvent) => {
        // 왼쪽 마우스 버튼만 처리
        if (e.button !== 0) return;

        isDown = true;
        hasMoved = false;
        startX = e.clientX; // clientX 사용으로 레이아웃 계산 제거
        scrollLeft = element.scrollLeft;
        element.style.scrollBehavior = "auto"; // 드래그 중 부드러운 스크롤 비활성화
      };

      const handleMouseMove = (e: MouseEvent) => {
        if (!isDown) return;

        const walk = e.clientX - startX; // clientX로 좌표 계산 최적화

        // 5px 이상 이동 시 드래그로 인식
        if (!hasMoved && Math.abs(walk) > 5) {
          hasMoved = true;
        }

        if (hasMoved) {
          e.preventDefault();
          lastScrollLeft = scrollLeft - walk * 1.5; // 스크롤 속도 배율

          // requestAnimationFrame으로 렌더링 최적화
          if (!rafId) {
            rafId = requestAnimationFrame(() => {
              element.scrollLeft = lastScrollLeft;
              rafId = null;
            });
          }
        }
      };

      const handleMouseUp = () => {
        // RAF 정리
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }

        isDown = false;
        element.style.scrollBehavior = "smooth"; // 부드러운 스크롤 재활성화

        // 드래그 후 클릭 이벤트 방지
        if (hasMoved) {
          const preventClick = (e: MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            element.removeEventListener("click", preventClick, true);
          };
          element.addEventListener("click", preventClick, true);
        }
      };

      const handleMouseLeave = () => {
        // RAF 정리
        if (rafId) {
          cancelAnimationFrame(rafId);
          rafId = null;
        }

        isDown = false;
        hasMoved = false;
        element.style.scrollBehavior = "smooth"; // 부드러운 스크롤 재활성화
      };

      element.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      element.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        // cleanup 시 RAF 정리
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        element.removeEventListener("mousedown", handleMouseDown);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        element.removeEventListener("mouseleave", handleMouseLeave);
      };
    }, []);

    const classes = [
      `${BASE}__list`,
      `${BASE}__list--${orientation}`,
      `${BASE}__list--${variant}`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const listProps = {
      ...props,
      role: "tablist" as const,
      "aria-orientation": orientation,
      "data-orientation": orientation,
      "data-variant": variant,
    };

    if (asChild) {
      return (
        <Slot ref={setRefs} {...listProps} className={className}>
          {children}
        </Slot>
      );
    }

    return (
      <div {...listProps} ref={setRefs} className={classes}>
        {children}
      </div>
    );
  }
);

TabList.displayName = "Tab.List";

// ===========================
// Tab.Trigger - 개별 Tab 버튼
// ===========================

export interface TabTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Tab의 고유 값 (필수)
   */
  value: string;

  /**
   * children을 wrapper 없이 직접 렌더링
   * @default false
   */
  asChild?: boolean;

  children: React.ReactNode;
}

const TabTrigger = forwardRef<HTMLButtonElement, TabTriggerProps>(
  (
    {
      value: tabValue,
      disabled: triggerDisabled,
      className,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const {
      value: selectedValue,
      onValueChange,
      activationMode,
      disabled: rootDisabled,
      orientation,
      variant,
      tabIds,
      panelIds,
      triggerRefs,
      registerTab,
      unregisterTab,
    } = useTabContext();

    const uid = useId();
    const triggerId = `tab-trigger-${uid}`;
    const panelId = `tab-panel-${uid}`;

    const triggerRef = useRef<HTMLButtonElement>(null);
    const disabled = rootDisabled || triggerDisabled;

    // 마운트 시 Tab 등록
    useEffect(() => {
      registerTab(tabValue, triggerId, panelId, triggerRef);
      return () => {
        unregisterTab(tabValue);
      };
    }, [tabValue, triggerId, panelId, registerTab, unregisterTab]);

    // 키보드 네비게이션
    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;

      const allValues = Array.from(triggerRefs.keys());
      const currentIndex = allValues.indexOf(tabValue);

      let nextIndex: number | null = null;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          nextIndex = (currentIndex + 1) % allValues.length;
          break;
        case "ArrowLeft":
          e.preventDefault();
          nextIndex = (currentIndex - 1 + allValues.length) % allValues.length;
          break;
        case "Enter":
        case " ":
          if (activationMode === "manual") {
            e.preventDefault();
            onValueChange(tabValue);
          }
          break;
        default:
          break;
      }

      if (nextIndex !== null) {
        const nextValue = allValues[nextIndex];
        const nextRef = triggerRefs.get(nextValue);

        if (nextRef?.current) {
          nextRef.current.focus();

          // 자동 활성화: 포커스 시 값 변경
          if (activationMode === "automatic") {
            onValueChange(nextValue);
          }
        }
      }

      props.onKeyDown?.(e);
    };

    const handleClick = () => {
      if (!disabled) {
        onValueChange(tabValue);
      }
    };

    const isActive = selectedValue === tabValue;

    // aria 속성 설정
    const ariaProps = {
      id: tabIds.get(tabValue) || "",
      role: "tab" as const,
      "aria-selected": isActive,
      "aria-controls": panelIds.get(tabValue) || "",
      "data-state": (isActive ? "active" : "inactive") as "active" | "inactive",
      tabIndex: isActive ? 0 : -1,
    };

    const classes = [
      `${BASE}__trigger`,
      `${BASE}__trigger--${variant}`,
      isActive && `${BASE}__trigger--active`,
      disabled && `${BASE}__trigger--disabled`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const triggerProps = {
      ...props,
      ...ariaProps,
      ref: (node: HTMLButtonElement | null) => {
        (
          triggerRef as React.MutableRefObject<HTMLButtonElement | null>
        ).current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      type: "button" as const,
      disabled,
      onClick: handleClick,
      onKeyDown: handleKeyDown,
      "data-value": tabValue,
      "data-orientation": orientation,
      "data-disabled": disabled ? "" : undefined,
    };

    if (asChild) {
      return (
        <Slot {...triggerProps} className={className}>
          {children}
        </Slot>
      );
    }

    return (
      <button {...triggerProps} className={classes}>
        {children}
      </button>
    );
  }
);

TabTrigger.displayName = "Tab.Trigger";

// ===========================
// Tab.Content - Tab 컨텐츠 영역
// ===========================

export interface TabContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 이 Content와 연결된 Tab의 value (필수)
   */
  value: string;

  /**
   * 선택되지 않아도 항상 DOM에 마운트
   * @default false
   */
  forceMount?: boolean;

  /**
   * children을 wrapper 없이 직접 렌더링
   * @default false
   */
  asChild?: boolean;

  children: React.ReactNode;
}

const TabContent = forwardRef<HTMLDivElement, TabContentProps>(
  (
    {
      value: tabValue,
      forceMount = false,
      className,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const { value: selectedValue, tabIds, panelIds } = useTabContext();

    const isActive = selectedValue === tabValue;
    const shouldRender = forceMount || isActive;

    if (!shouldRender) {
      return null;
    }

    // aria 속성 설정
    const ariaProps = {
      id: panelIds.get(tabValue) || "",
      role: "tabpanel" as const,
      "aria-labelledby": tabIds.get(tabValue) || "",
      "data-state": (isActive ? "active" : "inactive") as "active" | "inactive",
      tabIndex: 0,
    };

    const classes = [
      `${BASE}__content`,
      isActive && `${BASE}__content--active`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const contentProps = {
      ...props,
      ...ariaProps,
      hidden: !isActive,
      "data-value": tabValue,
    };

    if (asChild) {
      return (
        <Slot ref={ref} {...contentProps} className={className}>
          {children}
        </Slot>
      );
    }

    return (
      <div {...contentProps} ref={ref} className={classes}>
        {children}
      </div>
    );
  }
);

TabContent.displayName = "Tab.Content";

// ===========================
// Namespace Export
// ===========================

export const Tab = Object.assign(TabRoot, {
  Root: TabRoot,
  List: TabList,
  Trigger: TabTrigger,
  Content: TabContent,
});
