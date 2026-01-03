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

import { useClickOutside } from "@/hooks/useClickOutside";
import { useEscapeKey } from "@/hooks/useEscapeKey";
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

  // 외부 클릭 시 닫기
  useClickOutside({
    refs: [contentRef, triggerRef],
    handler: () => {
      if (open) setOpen(false);
    },
    enabled: open,
  });

  // ESC 키로 닫기
  useEscapeKey({
    handler: () => {
      if (open) {
        setOpen(false);
        triggerRef.current?.focus();
      }
    },
    enabled: open,
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
 */
export const SelectContent = React.forwardRef<
  HTMLDivElement,
  SelectContentProps
>(({ children, className, style, ...props }, forwardedRef) => {
  const { open, contentRef, contentId, floatingStyles, zIndex, refs } =
    useSelectContext();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Merge refs (internal, floating-ui, and forwarded)
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

  // SSR 시에는 렌더링하지 않음
  if (!isMounted) {
    return null;
  }

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
        {isSelected && (
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
