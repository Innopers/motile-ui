import React from "react";

/**
 * Slot 컴포넌트
 * asChild 패턴을 구현하기 위한 유틸리티
 *
 * @example
 * <Slot {...props}>
 *   <button>Click me</button>
 * </Slot>
 */

type SlotProps = React.HTMLAttributes<HTMLElement> & {
  children?: React.ReactNode;
};

type PossibleRef<T> = React.Ref<T> | undefined;

export const Slot = React.forwardRef<HTMLElement, SlotProps>(
  ({ children, ...props }, forwardedRef) => {
    if (!React.isValidElement(children)) {
      return null;
    }

    // children의 ref 추출 (타입 안전하게)
    const childrenRef = getElementRef(children);

    // children의 props와 Slot의 props를 병합
    return React.cloneElement(children, {
      ...mergeProps(props, children.props),
      ref: forwardedRef ? composeRefs(forwardedRef, childrenRef) : childrenRef,
    });
  }
);

Slot.displayName = "Slot";

/**
 * React Element에서 ref 추출 (타입 안전)
 */
function getElementRef<T extends React.ReactElement>(
  element: T
): React.Ref<unknown> | undefined {
  // React 19 이상에서는 element.props.ref 사용
  // React 18 이하에서는 element.ref 사용
  let getter = Object.getOwnPropertyDescriptor(element.props, "ref")?.get;
  let mayWarn = getter && "isReactWarning" in getter && getter.isReactWarning;

  if (mayWarn) {
    return (element as unknown as { ref: React.Ref<unknown> }).ref;
  }

  return (
    element.props.ref || (element as unknown as { ref: React.Ref<unknown> }).ref
  );
}

/**
 * Props 병합 함수
 * 이벤트 핸들러와 className을 적절히 병합
 */
function mergeProps(
  slotProps: Record<string, unknown>,
  childProps: Record<string, unknown>
): Record<string, unknown> {
  const overrideProps: Record<string, unknown> = { ...childProps };

  // className 병합
  if (slotProps.className && childProps.className) {
    overrideProps.className = `${childProps.className} ${slotProps.className}`;
  } else if (slotProps.className) {
    overrideProps.className = slotProps.className;
  }

  // style 병합
  if (slotProps.style || childProps.style) {
    overrideProps.style = {
      ...(childProps.style as React.CSSProperties),
      ...(slotProps.style as React.CSSProperties),
    };
  }

  // 이벤트 핸들러 병합 (onClick, onFocus 등)
  for (const propName in childProps) {
    const slotPropValue = slotProps[propName];
    const childPropValue = childProps[propName];

    const isHandler = /^on[A-Z]/.test(propName);
    if (isHandler) {
      if (
        typeof slotPropValue === "function" &&
        typeof childPropValue === "function"
      ) {
        overrideProps[propName] = (...args: unknown[]) => {
          childPropValue(...args);
          slotPropValue(...args);
        };
      } else if (typeof slotPropValue === "function") {
        overrideProps[propName] = slotPropValue;
      }
    } else if (propName !== "className" && propName !== "style") {
      overrideProps[propName] = slotPropValue ?? childPropValue;
    }
  }

  // slotProps에만 있는 props 추가
  for (const propName in slotProps) {
    if (!(propName in overrideProps)) {
      overrideProps[propName] = slotProps[propName];
    }
  }

  return overrideProps;
}

/**
 * Ref 합성 함수 (타입 안전)
 */
function composeRefs<T>(
  ...refs: (PossibleRef<T> | PossibleRef<unknown>)[]
): React.RefCallback<T> {
  return (node: T) => {
    refs.forEach((ref) => {
      if (typeof ref === "function") {
        ref(node);
      } else if (ref != null && typeof ref === "object") {
        (ref as React.MutableRefObject<T>).current = node;
      }
    });
  };
}
