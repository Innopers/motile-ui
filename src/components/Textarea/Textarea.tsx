import React, {
  forwardRef,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useAutoBlur } from "@/hooks/useAutoBlur";

import "./Textarea.css";

export interface AutoSizeConfig {
  minRows?: number;
  maxRows?: number;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * 자동 포커스 여부
   * @default false
   */
  autoFocus?: boolean;

  /**
   * 자동 텍스트 선택 여부 (autoFocus와 함께 사용)
   * @default false
   */
  autoSelect?: boolean;

  /**
   * 에러 상태
   * @default false
   */
  isError?: boolean;

  /**
   * 에러 메시지 (isError가 명시되지 않으면 에러 상태로 표시)
   */
  errorMessage?: string;

  /**
   * Textarea 테두리/포커스 색상 (우선순위 1)
   * @example '#10b981'
   */
  color?: string;

  /**
   * 최대 글자수 (설정 시 자동으로 글자수 카운터 표시)
   */
  maxLength?: number;

  /**
   * Floating label (focus 전에는 placeholder 위치, focus/값 있을 때 위로 이동)
   */
  label?: string;

  /**
   * 기본 행(줄) 수 (autoSize 사용 시 minRows 기본값으로 사용)
   * @default 4
   */
  rows?: number;

  /**
   * Resize 제어 (autoSize 활성화 시 무시됨)
   * @default 'none'
   * @type {'none' | 'vertical' | 'horizontal' | 'both'}
   */
  resize?: "none" | "vertical" | "horizontal" | "both";

  /**
   * 자동 높이 조절 (내용에 따라 높이가 자동으로 늘어남)
   * - true: rows를 minRows로 사용
   * - { minRows, maxRows }: 세밀한 제어
   * @default false
   */
  autoSize?: boolean | AutoSizeConfig;

  /**
   * 모바일에서 이 입력에 포커스된 채 스크롤하면 포커스를 해제해 소프트 키보드를
   * 닫습니다 (useAutoBlur 내장). 데스크톱(비터치)에는 영향이 없습니다.
   * @default false
   */
  autoBlur?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      autoFocus = false,
      autoSelect = false,
      isError,
      errorMessage,
      className,
      value,
      color,
      style,
      maxLength,
      label,
      placeholder,
      rows = 4,
      resize = "none",
      autoSize = false,
      autoBlur = false,
      ...props
    },
    ref
  ) => {
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef =
      (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
    const rootRef = useRef<HTMLDivElement>(null);

    // 모바일: 이 입력에 포커스된 채 스크롤하면 키보드 닫기 (opt-in, 기본 off)
    useAutoBlur({ containerRef: rootRef, enabled: autoBlur });

    const [sizeState, setSizeState] = useState<{
      height?: number;
      isMaxHeight: boolean;
    }>({ height: undefined, isMaxHeight: false });

    // isError가 명시되지 않으면 errorMessage로 판단
    const hasError = isError ?? !!errorMessage;

    // autoSize 설정 파싱
    const autoSizeConfig = useMemo(() => {
      if (typeof autoSize === "boolean") {
        return autoSize ? { minRows: rows, maxRows: undefined } : undefined;
      }
      return autoSize
        ? {
            minRows: autoSize.minRows ?? rows,
            maxRows: autoSize.maxRows,
          }
        : undefined;
    }, [autoSize, rows]);

    // autoFocus & autoSelect 처리
    useEffect(() => {
      if (autoFocus && textareaRef.current) {
        const timer = setTimeout(() => {
          if (textareaRef.current) {
            textareaRef.current.focus();
            if (autoSelect) {
              textareaRef.current.select();
            }
          }
        }, 50);

        return () => clearTimeout(timer);
      }
    }, [autoFocus, autoSelect]);

    // autoSize 높이 계산
    useLayoutEffect(() => {
      if (!autoSizeConfig || !textareaRef.current) return;

      const textarea = textareaRef.current;
      const hasContent = value && String(value).length > 0;

      // 첫 렌더 + 내용 없음: native rows 유지 (깜빡임 방지)
      if (!hasContent && sizeState.height === undefined) {
        return;
      }

      // 정확한 측정을 위해 높이 초기화
      textarea.style.height = "auto";

      // scrollHeight로 실제 필요한 높이 측정
      const scrollHeight = textarea.scrollHeight;

      // 스타일에서 line-height 가져오기
      const computedStyle = window.getComputedStyle(textarea);
      const lineHeight = parseInt(computedStyle.lineHeight, 10);
      const paddingTop = parseInt(computedStyle.paddingTop, 10);
      const paddingBottom = parseInt(computedStyle.paddingBottom, 10);
      const borderTop = parseInt(computedStyle.borderTopWidth, 10);
      const borderBottom = parseInt(computedStyle.borderBottomWidth, 10);

      // minHeight, maxHeight 계산
      const verticalPadding =
        paddingTop + paddingBottom + borderTop + borderBottom;
      const minHeight = autoSizeConfig.minRows
        ? lineHeight * autoSizeConfig.minRows + verticalPadding
        : undefined;
      const maxHeight = autoSizeConfig.maxRows
        ? lineHeight * autoSizeConfig.maxRows + verticalPadding
        : undefined;

      // 높이 결정
      let newHeight = scrollHeight;
      let reachedMaxHeight = false;

      if (minHeight !== undefined && newHeight < minHeight) {
        newHeight = minHeight;
      }
      if (maxHeight !== undefined && newHeight > maxHeight) {
        newHeight = maxHeight;
        reachedMaxHeight = true;
      }

      // 즉시 DOM에 높이 적용 (깜빡임 방지)
      textarea.style.height = `${newHeight}px`;

      // 상태 업데이트 (React의 상태 관리와 동기화)
      setSizeState((prev) => {
        if (
          newHeight !== prev.height ||
          reachedMaxHeight !== prev.isMaxHeight
        ) {
          return { height: newHeight, isMaxHeight: reachedMaxHeight };
        }
        return prev;
      });
    }, [value, autoSizeConfig]);

    const baseClass = "motile-textarea";

    const textareaClasses = [
      baseClass,
      hasError && `${baseClass}--error`,
      hasError && `${baseClass}--shake`,
      label && `${baseClass}--with-label`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const wrapperClasses = [
      `${baseClass}-wrapper`,
      label && `${baseClass}-wrapper--with-label`,
    ]
      .filter(Boolean)
      .join(" ");

    const labelClasses = [
      `${baseClass}__label`,
      hasError && `${baseClass}__label--error`,
    ]
      .filter(Boolean)
      .join(" ");

    const wrapperStyle = color
      ? ({ "--motile-textarea-color": color } as React.CSSProperties)
      : undefined;

    const textareaStyle: React.CSSProperties = {
      ...style,
      resize: autoSizeConfig ? "none" : resize,
      ...(autoSizeConfig
        ? {
            // 계산된 후에만 height 적용 (첫 렌더에서는 native rows 사용)
            ...(sizeState.height !== undefined && { height: sizeState.height }),
            // 계산된 후에만 minHeight 오버라이드
            ...(sizeState.height !== undefined && { minHeight: "auto" }),
            overflowY: sizeState.isMaxHeight ? "auto" : "hidden",
          }
        : {}),
    };

    const currentLength = value ? String(value).length : 0;
    const showCounter = maxLength !== undefined;

    // aria-describedby 병합 (외부 값 + 내부 에러 ID)
    const ariaDescribedBy =
      [
        props["aria-describedby"],
        errorMessage ? `${baseClass}-error` : undefined,
      ]
        .filter(Boolean)
        .join(" ") || undefined;

    return (
      <div className={`${baseClass}-root`} ref={rootRef}>
        <div className={wrapperClasses} style={wrapperStyle}>
          {label && <label className={labelClasses}>{label}</label>}

          <textarea
            {...{ ...props, "aria-describedby": ariaDescribedBy }}
            ref={textareaRef}
            className={textareaClasses}
            value={value}
            maxLength={maxLength}
            rows={autoSizeConfig?.minRows ?? rows}
            style={textareaStyle}
            placeholder={label ? placeholder || " " : placeholder}
          />
        </div>

        {(errorMessage || showCounter) && (
          <div
            className={`${baseClass}__helper-text ${
              errorMessage && showCounter
                ? `${baseClass}__helper-text--both`
                : errorMessage
                  ? `${baseClass}__helper-text--error-only`
                  : `${baseClass}__helper-text--counter-only`
            }`}
          >
            {errorMessage && (
              <span
                id={`${baseClass}-error`}
                className={`${baseClass}__error-message`}
                role="alert"
              >
                {errorMessage}
              </span>
            )}
            {showCounter && (
              <span className={`${baseClass}__counter`}>
                {currentLength}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
