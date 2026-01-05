import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";

import {
  autoUpdate,
  flip,
  offset,
  shift,
  size,
  useFloating,
} from "@floating-ui/react";

import { Drawer } from "@/components/Drawer/Drawer";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscapeKey } from "@/hooks/useEscapeKey";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Slot } from "@/utils/Slot";

import "./Select.css";

/**
 * Select Context
 */
interface SelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  value: string | undefined;
  onValueChange: (value: string) => void;
  disabled: boolean;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
  contentId: string;
  itemLabels: Map<string, React.ReactNode>;
  registerItem: (value: string, label: React.ReactNode) => void;
  unregisterItem: (value: string) => void;
  zIndex: number;
  hideCheckIcon: boolean;
  isMobile: boolean;
  maxWidth?: string | number;
  // Floating UI
  refs: {
    setReference: (node: HTMLButtonElement | null) => void;
    setFloating: (node: HTMLDivElement | null) => void;
  };
  floatingStyles: React.CSSProperties;
}

const SelectContext = createContext<SelectContextValue | null>(null);

const useSelectContext = () => {
  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within Select.Root");
  }
  return context;
};

/**
 * SelectRoot Props
 */
export interface SelectRootProps {
  /**
   * 선택된 값 (Controlled)
   */
  value?: string;

  /**
   * 초기 선택 값 (Uncontrolled)
   */
  defaultValue?: string;

  /**
   * 값 변경 콜백
   */
  onValueChange?: (value: string) => void;

  /**
   * 비활성화 여부
   * @default false
   */
  disabled?: boolean;

  /**
   * z-index 값
   * @default 40
   *
   * @example
   * // 다른 오버레이보다 위에 표시
   * <Select.Root zIndex={60}>
   */
  zIndex?: number;

  /**
   * 체크 아이콘 숨김 여부
   * @default false
   *
   * @example
   * // 커스텀 레이아웃 사용 시 체크 아이콘 숨기기
   * <Select.Root hideCheckIcon>
   */
  hideCheckIcon?: boolean;

  /**
   * Select의 breakpoint (모바일/데스크톱 전환점)
   * @default 768
   *
   * @example
   * // 600px 이하: Drawer, 초과: Floating dropdown
   * <Select.Root maxWidth="600px">
   *
   * // 1024px 이하: Drawer, 초과: Floating dropdown
   * <Select.Root maxWidth={1024}>
   *
   * @remarks
   * - maxWidth는 오직 mobile/desktop 전환 breakpoint로만 사용됩니다
   * - viewport <= maxWidth: Drawer 사용 (전체 화면)
   * - viewport > maxWidth: Floating dropdown 사용 (Trigger 너비와 동일)
   * - Content 너비는 항상 Trigger 너비를 따라갑니다
   * - 기본값: 768px breakpoint
   */
  maxWidth?: string | number;

  /**
   * 자식 컴포넌트
   */
  children: React.ReactNode;
}

/**
 * SelectRoot - Context Provider
 */
export const SelectRoot: React.FC<SelectRootProps> = ({
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled = false,
  zIndex = 40,
  hideCheckIcon = false,
  maxWidth = 768,
  children,
}) => {
  const [uncontrolledValue, setUncontrolledValue] = useState<
    string | undefined
  >(defaultValue);
  const [open, setOpen] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Item labels를 저장하는 Map
  const itemLabelsRef = useRef<Map<string, React.ReactNode>>(new Map());

  const id = useId();
  const contentId = `select-content-${id}`;

  // maxWidth를 breakpoint로 사용 (기본값: 768px)
  const mediaQueryString = maxWidth
    ? `(max-width: ${typeof maxWidth === "number" ? `${maxWidth}px` : maxWidth})`
    : "(max-width: 768px)";

  const isMobile = useMediaQuery(mediaQueryString);

  // Floating UI setup
  const { refs, floatingStyles } = useFloating({
    middleware: [
      offset(4), // trigger와 4px 간격
      flip(), // viewport 끝에서 자동 뒤집기
      shift({ padding: 8 }), // viewport 내부로 이동
      size({
        apply({ rects, elements }) {
          // content width를 trigger width와 동일하게
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
          });
        },
      }),
    ],
    whileElementsMounted: autoUpdate, // 스크롤/리사이즈 시 자동 업데이트
  });

  // Controlled vs Uncontrolled
  const isControlled = controlledValue !== undefined;
  const value = isControlled ? controlledValue : uncontrolledValue;

  const handleValueChange = (newValue: string) => {
    if (!isControlled) {
      setUncontrolledValue(newValue);
    }
    onValueChange?.(newValue);
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Item 등록/해제 함수 (useCallback으로 안정화)
  const registerItem = useCallback(
    (itemValue: string, label: React.ReactNode) => {
      itemLabelsRef.current.set(itemValue, label);
    },
    []
  );

  const unregisterItem = useCallback((itemValue: string) => {
    itemLabelsRef.current.delete(itemValue);
  }, []);

  // 외부 클릭 시 닫기 (모바일에서는 Drawer가 처리)
  useClickOutside({
    refs: [contentRef, triggerRef],
    handler: () => {
      if (open) setOpen(false);
    },
    enabled: open && !isMobile,
  });

  // ESC 키로 닫기 (모바일에서는 Drawer가 처리)
  useEscapeKey({
    handler: () => {
      if (open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    },
    enabled: open && !isMobile,
  });

  const contextValue: SelectContextValue = {
    open,
    setOpen,
    value,
    onValueChange: handleValueChange,
    disabled,
    triggerRef,
    contentRef,
    contentId,
    itemLabels: itemLabelsRef.current,
    registerItem,
    unregisterItem,
    zIndex,
    hideCheckIcon,
    isMobile,
    maxWidth,
    refs,
    floatingStyles,
  };

  return (
    <SelectContext.Provider value={contextValue}>
      {children}
    </SelectContext.Provider>
  );
};

/**
 * SelectTrigger Props
 */
export interface SelectTriggerProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  /**
   * 자식 컴포넌트
   */
  children: React.ReactNode;

  /**
   * 커스텀 색상 (focus border)
   * @example '#10b981'
   */
  color?: string;

  /**
   * 자식 요소를 렌더링할지 여부 (Slot 패턴)
   * @default false
   */
  asChild?: boolean;
}

/**
 * SelectTrigger - 버튼
 */
export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  SelectTriggerProps
>(
  (
    { children, color, className, style, asChild = false, ...props },
    forwardedRef
  ) => {
    const { open, setOpen, disabled, triggerRef, contentId, zIndex, refs } =
      useSelectContext();

    const handleClick = () => {
      if (disabled) return;
      setOpen(!open);
    };

    // Ref callback for merging internal, floating-ui, and forwarded refs
    const mergedRef = React.useCallback(
      (node: HTMLButtonElement | null) => {
        // Internal ref (for useClickOutside)
        (
          triggerRef as React.MutableRefObject<HTMLButtonElement | null>
        ).current = node;
        // Floating UI ref
        refs.setReference(node);
        // Forwarded ref
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          forwardedRef.current = node;
        }
      },
      [forwardedRef, triggerRef, refs]
    );

    const classes = ["motile-select__trigger", className]
      .filter(Boolean)
      .join(" ");

    const inlineStyle: React.CSSProperties = {
      zIndex,
      ...style,
      ...(color && ({ "--motile-select-color": color } as React.CSSProperties)),
    };

    const triggerProps = {
      ref: mergedRef,
      type: "button" as const,
      role: "combobox",
      "aria-controls": contentId,
      "aria-expanded": open,
      "aria-haspopup": "listbox" as const,
      disabled,
      className: classes,
      style: inlineStyle,
      onClick: handleClick,
      ...props,
    };

    const icon = (
      <svg
        className="motile-select__icon"
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 7.5L10 12.5L15 7.5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );

    if (asChild) {
      return (
        <Slot {...triggerProps}>
          {children}
          {icon}
        </Slot>
      );
    }

    return (
      <button {...triggerProps}>
        {children}
        {icon}
      </button>
    );
  }
);

SelectTrigger.displayName = "SelectTrigger";

/**
 * SelectValue Props
 */
export interface SelectValueProps {
  /**
   * 값이 없을 때 표시할 placeholder
   */
  placeholder?: string;
}

/**
 * SelectValue - 선택된 값 표시
 */
export const SelectValue: React.FC<SelectValueProps> = ({
  placeholder = "선택하세요",
}) => {
  const { value, itemLabels } = useSelectContext();

  // value에 해당하는 Item의 children(label)을 Map에서 찾아서 표시
  const selectedLabel = value ? itemLabels.get(value) : undefined;

  return (
    <span className="motile-select__value">{selectedLabel || placeholder}</span>
  );
};

/**
 * SelectContent Props
 */
export interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * 자식 컴포넌트 (SelectItem들)
   */
  children: React.ReactNode;
}

/**
 * SelectContent - 드롭다운 컨테이너 (Portal)
 * 모바일에서는 Drawer로, 데스크톱에서는 floating dropdown으로 렌더링
 */
export const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(({ children, className, style, ...props }, forwardedRef) => {
  const {
    open,
    setOpen,
    contentRef,
    contentId,
    floatingStyles,
    zIndex,
    refs,
    isMobile,
  } = useSelectContext();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Merge refs (internal, floating-ui, and forwarded) - 항상 호출 (hooks 규칙)
  // 모바일에서는 사용하지 않지만, hooks는 조건부 호출 불가
  const mergedRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      // Internal ref (for useClickOutside)
      (contentRef as React.MutableRefObject<HTMLDivElement | null>).current =
        node;
      // Floating UI ref
      refs.setFloating(node);
      // Forwarded ref
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef, contentRef, refs]
  );

  // SSR 시에는 렌더링하지 않음
  if (!isMounted) {
    return null;
  }

  // 모바일: Drawer로 렌더링
  if (isMobile) {
    return (
      <Drawer.Root
        open={open}
        onOpenChange={setOpen}
        closeOnBackdrop={true}
        closeOnDrag={true}
        maxHeight="70dvh"
        zIndex={9999} // Drawer의 기본 z-index 사용 (Select의 zIndex는 desktop용)
      >
        <Drawer.Portal>
          <Drawer.Overlay />
          <Drawer.Content>
            <Drawer.Handle />
            <Drawer.Body
              style={{ padding: 0 }} // SelectItem이 자체 padding 가짐
            >
              {/* listbox role wrapper for accessibility */}
              <div
                id={contentId}
                role="listbox"
                className={`motile-select__mobile-list ${className || ""}`}
                {...props}
              >
                {children}
              </div>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  }

  // 데스크톱: 기존 floating dropdown

  const classes = [
    "motile-select__content",
    open && "motile-select__content--open",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  // Combine floating-ui styles with user styles
  const combinedStyles: React.CSSProperties = {
    ...floatingStyles,
    zIndex,
    ...style,
  };

  const content = (
    <div
      ref={mergedRef}
      id={contentId}
      role="listbox"
      className={classes}
      style={combinedStyles}
      tabIndex={-1}
      {...props}
    >
      {children}
    </div>
  );

  // Portal to body (클라이언트 사이드에서만)
  return createPortal(content, document.body);
});

SelectContent.displayName = "SelectContent";

/**
 * SelectItem Props
 */
export interface SelectItemProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /**
   * 옵션 값
   */
  value: string;

  /**
   * 비활성화 여부
   * @default false
   */
  disabled?: boolean;

  /**
   * 표시할 내용
   */
  children: React.ReactNode;
}

/**
 * SelectItem - 개별 옵션
 */
export const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  (
    {
      value: itemValue,
      disabled: itemDisabled = false,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const {
      value: selectedValue,
      onValueChange,
      registerItem,
      unregisterItem,
      hideCheckIcon,
    } = useSelectContext();

    const isSelected = selectedValue === itemValue;

    // Item이 마운트될 때 label을 등록하고, 언마운트될 때 제거
    useEffect(() => {
      registerItem(itemValue, children);

      return () => {
        unregisterItem(itemValue);
      };
    }, [itemValue, children, registerItem, unregisterItem]);

    const handleClick = () => {
      if (itemDisabled) return;
      onValueChange(itemValue);
    };

    const classes = [
      "motile-select__item",
      isSelected && "motile-select__item--selected",
      itemDisabled && "motile-select__item--disabled",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={isSelected}
        aria-disabled={itemDisabled}
        className={classes}
        onClick={handleClick}
        {...props}
      >
        {children}
        {isSelected && !hideCheckIcon && (
          <svg
            className="motile-select__check"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M13.3334 4L6.00008 11.3333L2.66675 8"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </div>
    );
  }
);

SelectItem.displayName = "SelectItem";

/**
 * Select Namespace
 */
export const Select = {
  Root: SelectRoot,
  Trigger: SelectTrigger,
  Value: SelectValue,
  Content: SelectContent,
  Item: SelectItem,
};
