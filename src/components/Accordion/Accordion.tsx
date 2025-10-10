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
import "./Accordion.css";

const BASE = "taeri-accordion";

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
// Accordion (Container)
// ===========================
export interface AccordionProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange"> {
  variant?: AccordionVariant;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onChange?: (expanded: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}

export const Accordion = forwardRef<HTMLDivElement, AccordionProps>(
  (
    {
      variant = "default",
      defaultExpanded = false,
      expanded,
      onChange,
      disabled = false,
      className,
      children,
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
        <div
          {...props}
          ref={ref}
          className={classes}
          data-state={isOpen ? "open" : "closed"}
          data-disabled={disabled ? "" : undefined}
        >
          {children}
        </div>
      </Context.Provider>
    );
  }
);
Accordion.displayName = "Accordion";

// ===========================
// AccordionHeader
// ===========================
export interface AccordionHeaderProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const AccordionHeader = forwardRef<
  HTMLButtonElement,
  AccordionHeaderProps
>(({ className, children, ...props }, ref) => {
  const { isOpen, toggle, disabled, panelId } = useAccordion();

  const classes = [`${BASE}__header`, className].filter(Boolean).join(" ");

  return (
    <button
      {...props}
      ref={ref}
      className={classes}
      onClick={toggle}
      aria-expanded={isOpen}
      aria-controls={panelId}
      aria-disabled={disabled}
      type="button"
      disabled={disabled}
      data-state={isOpen ? "open" : "closed"}
      data-disabled={disabled ? "" : undefined}
    >
      <div className={`${BASE}__title`}>{children}</div>
      <svg
        className={`${BASE}__chevron`}
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  );
});
AccordionHeader.displayName = "AccordionHeader";

// ===========================
// AccordionContent
// ===========================
export interface AccordionContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const AccordionContent = forwardRef<
  HTMLDivElement,
  AccordionContentProps
>(({ className, children, ...props }, ref) => {
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

  const classes = [`${BASE}__content`, className].filter(Boolean).join(" ");

  return (
    <div
      id={panelId}
      ref={panelRef}
      className={`${BASE}__panel`}
      aria-hidden={!isOpen}
      data-state={isOpen ? "open" : "closed"}
    >
      <div {...props} ref={ref} className={classes}>
        {children}
      </div>
    </div>
  );
});
AccordionContent.displayName = "AccordionContent";
