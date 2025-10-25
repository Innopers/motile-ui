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
import "./Accordion.css";

const BASE = "motile-accordion";

// ===========================
// Types
// ===========================
export type AccordionVariant = "default" | "outlined";

// ===========================
// Context
// ===========================
interface AccordionContext {
  isOpen: boolean;
  toggle: () => void;
  disabled: boolean;
  variant: AccordionVariant;
  panelId: string;
  panelRef: React.RefObject<HTMLDivElement>;
}
const Context = createContext<AccordionContext | null>(null);

const useAccordion = () => {
  const ctx = useContext(Context);
  if (!ctx) {
    throw new Error("AccordionHeader/Content must be used within <Accordion>");
  }
  return ctx;
};

// ===========================
// Accordion Root (Container)
// ===========================
export interface AccordionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  variant?: AccordionVariant;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onChange?: (expanded: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
  /**
   * children을 wrapper 없이 직접 렌더링
   * @default false
   */
  asChild?: boolean;
}

const AccordionRoot = forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      variant = "default",
      defaultExpanded = false,
      expanded,
      onChange,
      disabled = false,
      className,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultExpanded);
    const isControlled = expanded !== undefined;
    const isOpen = isControlled ? expanded! : internalOpen;

    const uid = useId();
    const panelId = `accordion-panel-${uid}`;
    const panelRef = useRef<HTMLDivElement>(null);

    const toggle = useCallback(() => {
      if (disabled) return;
      const next = !isOpen;
      if (!isControlled) setInternalOpen(next);
      onChange?.(next);
    }, [disabled, isOpen, isControlled, onChange]);

    const accordionProps = {
      ...props,
      "data-state": isOpen ? "open" : "closed",
      "data-disabled": disabled ? "" : undefined,
      "data-variant": variant,
    };

    const classes = [
      BASE,
      `${BASE}--${variant}`,
      isOpen && `${BASE}--expanded`,
      disabled && `${BASE}--disabled`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <Context.Provider
        value={{ isOpen, toggle, disabled, variant, panelId, panelRef }}
      >
        {asChild ? (
          <Slot ref={ref} {...accordionProps} className={className}>
            {children}
          </Slot>
        ) : (
          <div {...accordionProps} ref={ref} className={classes}>
            {children}
          </div>
        )}
      </Context.Provider>
    );
  }
);
AccordionRoot.displayName = "Accordion";

// ===========================
// Accordion Header
// ===========================
export interface AccordionHeaderProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  /**
   * children을 wrapper 없이 직접 렌더링
   * true일 경우, children이 직접 button 역할을 함
   * @default false
   */
  asChild?: boolean;
}

const AccordionHeader = forwardRef<HTMLButtonElement, AccordionHeaderProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const { isOpen, toggle, disabled, panelId } = useAccordion();

    const sharedProps = {
      ...props,
      onClick: (e: React.MouseEvent<HTMLButtonElement>) => {
        props.onClick?.(e);
        toggle();
      },
      "aria-expanded": isOpen,
      "aria-controls": panelId,
      "aria-disabled": disabled,
      type: "button" as const,
      disabled,
      "data-state": isOpen ? "open" : "closed",
      "data-disabled": disabled ? "" : undefined,
    };

    if (asChild) {
      return (
        <Slot ref={ref} {...sharedProps} className={className}>
          {children}
        </Slot>
      );
    }

    const classes = [`${BASE}__header`, className].filter(Boolean).join(" ");

    return (
      <button {...sharedProps} ref={ref} className={classes}>
        {children}
      </button>
    );
  }
);
AccordionHeader.displayName = "Accordion.Header";

// ===========================
// Accordion Content
// ===========================
export interface AccordionContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /**
   * children을 wrapper 없이 직접 렌더링
   * @default false
   */
  asChild?: boolean;
}

const AccordionContent = forwardRef<HTMLDivElement, AccordionContentProps>(
  ({ className, children, asChild = false, ...props }, ref) => {
    const { isOpen, panelId, panelRef } = useAccordion();

    const animate = useCallback(() => {
      const el = panelRef.current;
      if (!el) return;

      const prefersReduced =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReduced) {
        el.style.height = isOpen ? "auto" : "0px";
        return;
      }

      if (isOpen) {
        if (el.style.height === "" || el.style.height === "auto") {
          el.style.height = "0px";
        }
        el.getBoundingClientRect(); // reflow
        el.style.height = `${el.scrollHeight}px`;

        const onEnd = () => {
          if (isOpen) el.style.height = "auto";
          el.removeEventListener("transitionend", onEnd);
        };
        el.addEventListener("transitionend", onEnd);
      } else {
        if (el.style.height === "" || el.style.height === "auto") {
          el.style.height = `${el.scrollHeight}px`;
        }
        el.getBoundingClientRect(); // reflow
        el.style.height = "0px";
      }
    }, [isOpen, panelRef]);

    useEffect(() => {
      const el = panelRef.current;
      if (!el) return;
      el.style.willChange = "height";
      animate();
      return () => {
        el.style.willChange = "";
      };
    }, [animate, panelRef]);

    const contentProps = {
      ...props,
      "aria-hidden": !isOpen,
      "data-state": isOpen ? "open" : "closed",
    };

    const classes = [`${BASE}__content`, className].filter(Boolean).join(" ");

    return (
      <div
        id={panelId}
        ref={panelRef}
        className={`${BASE}__panel`}
        aria-hidden={!isOpen}
        data-state={isOpen ? "open" : "closed"}
      >
        {asChild ? (
          <Slot ref={ref} {...contentProps} className={className}>
            {children}
          </Slot>
        ) : (
          <div {...contentProps} ref={ref} className={classes}>
            {children}
          </div>
        )}
      </div>
    );
  }
);
AccordionContent.displayName = "Accordion.Content";

// ===========================
// Namespace Export
// ===========================
export const Accordion = Object.assign(AccordionRoot, {
  Header: AccordionHeader,
  Content: AccordionContent,
});
