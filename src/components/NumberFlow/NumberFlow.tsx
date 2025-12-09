import React, { useEffect, useMemo, useRef, useState } from "react";

import "./NumberFlow.css";

// ============================================================================
// Types
// ============================================================================

export interface NumberFlowProps {
  /**
   * 표시할 숫자 값
   */
  value: number;

  /**
   * 로케일 (기본값: 'ko-KR')
   * @example 'en-US', 'ko-KR', 'ja-JP'
   */
  locale?: string;

  /**
   * 애니메이션 지속 시간 (ms)
   * @default 600
   */
  duration?: number;

  /**
   * 컨테이너 className
   */
  className?: string;

  /**
   * 인라인 스타일
   */
  style?: React.CSSProperties;

  /**
   * 마운트 시 애니메이션 적용 여부
   * @default true
   */
  animateOnMount?: boolean;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * 숫자를 포맷팅된 문자 배열로 변환
 */
function formatNumber(value: number, locale: string): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * 문자가 숫자인지 확인
 */
function isDigit(char: string): boolean {
  return /^\d$/.test(char);
}

// ============================================================================
// Digit Component - 슬롯머신 스타일 애니메이션
// ============================================================================

interface DigitProps {
  value: string;
  prevValue: string | null;
  direction: "up" | "down";
  duration: number;
  index: number;
  animateOnMount: boolean;
}

// 0-9를 3번 반복하여 스핀 효과를 위한 배열 생성
const SPIN_DIGITS = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];

const Digit: React.FC<DigitProps> = React.memo(
  ({ value, prevValue, direction, duration, index, animateOnMount }) => {
    const currentDigit = parseInt(value, 10);
    // 초기 렌더링 + animateOnMount면 0에서 시작, 아니면 이전 값 또는 현재 값
    const isInitialMount = prevValue === null;
    const prevDigit = isInitialMount
      ? animateOnMount
        ? 0
        : currentDigit
      : parseInt(prevValue, 10);

    // 이전 숫자에서 시작해서 현재 숫자로 애니메이션
    const [currentOffset, setCurrentOffset] = useState(prevDigit);

    // 각 자릿수마다 약간의 딜레이를 주어 물결 효과
    const staggerDelay = index * 50;

    useEffect(() => {
      // 같은 숫자면 아무것도 하지 않음
      if (prevDigit === currentDigit) {
        return;
      }

      // 최소 이동 거리 계산
      let steps: number;

      if (direction === "up") {
        steps =
          currentDigit >= prevDigit
            ? currentDigit - prevDigit
            : 10 - prevDigit + currentDigit;
      } else {
        steps =
          prevDigit >= currentDigit
            ? prevDigit - currentDigit
            : prevDigit + 10 - currentDigit;
      }

      // 다음 프레임에서 애니메이션 시작
      const timeoutId = setTimeout(() => {
        setCurrentOffset((prev) =>
          direction === "up" ? prev + steps : prev - steps
        );
      }, staggerDelay + 10);

      return () => clearTimeout(timeoutId);
    }, [value, prevDigit, currentDigit, direction, staggerDelay]);

    // translateY 계산 (음수 offset 처리)
    const normalizedOffset = ((currentOffset % 30) + 30) % 30;
    const translateY = -normalizedOffset * (100 / 30);

    const columnStyle: React.CSSProperties = {
      transform: `translateY(${translateY}%)`,
      transition: `transform ${duration}ms ease-out`,
    };

    return (
      <span className="motile-number-flow__digit">
        <span className="motile-number-flow__digit-column" style={columnStyle}>
          {SPIN_DIGITS.map((digit, i) => (
            <span key={i} className="motile-number-flow__digit-value">
              {digit}
            </span>
          ))}
        </span>
      </span>
    );
  }
);

Digit.displayName = "NumberFlow.Digit";

// ============================================================================
// Separator Component
// ============================================================================

interface SeparatorProps {
  value: string;
}

const Separator: React.FC<SeparatorProps> = React.memo(({ value }) => {
  return <span className="motile-number-flow__separator">{value}</span>;
});

Separator.displayName = "NumberFlow.Separator";

// ============================================================================
// Main Component
// ============================================================================

export const NumberFlow = React.forwardRef<HTMLSpanElement, NumberFlowProps>(
  (
    {
      value,
      locale = "ko-KR",
      duration = 600,
      className,
      style,
      animateOnMount = true,
    },
    ref
  ) => {
    const prevValueRef = useRef<number | null>(null);
    const prevFormattedRef = useRef<string | null>(null);

    // 포맷팅된 문자열
    const formatted = useMemo(
      () => formatNumber(value, locale),
      [value, locale]
    );

    // 이전 값의 포맷팅된 문자열
    const prevFormatted = prevFormattedRef.current;

    // 전체 방향 결정 (값 변화에 따라 자동)
    const overallDirection = useMemo((): "up" | "down" => {
      if (prevValueRef.current === null) return "up";

      const prev = prevValueRef.current;

      // 둘 다 음수: 절대값(크기) 비교로 방향 결정
      // -100 → -200: |200| > |100| → 숫자가 커지므로 "up"
      // -200 → -100: |100| < |200| → 숫자가 작아지므로 "down"
      if (prev < 0 && value < 0) {
        return Math.abs(value) >= Math.abs(prev) ? "up" : "down";
      }

      // 일반 케이스 (양수 또는 0 통과)
      return value >= prev ? "up" : "down";
    }, [value]);

    // 값 변경 추적
    useEffect(() => {
      prevValueRef.current = value;
      prevFormattedRef.current = formatted;
    }, [value, formatted]);

    // 문자열을 개별 문자로 분리하여 렌더링
    const characters = useMemo(() => {
      const chars = formatted.split("");
      const prevChars = prevFormatted?.split("") || [];

      // 숫자 인덱스 카운터 (물결 효과용)
      let digitIndex = 0;

      return chars.map((char, index) => {
        const key = `${index}-${char}`;
        const prevChar = prevChars[index] || null;

        if (isDigit(char)) {
          const currentDigitIndex = digitIndex;
          digitIndex++;

          return (
            <Digit
              key={key}
              value={char}
              prevValue={isDigit(prevChar || "") ? prevChar : null}
              direction={overallDirection}
              duration={duration}
              index={currentDigitIndex}
              animateOnMount={animateOnMount}
            />
          );
        }

        return <Separator key={key} value={char} />;
      });
    }, [formatted, prevFormatted, overallDirection, duration, animateOnMount]);

    return (
      <span
        ref={ref}
        className={`motile-number-flow ${className || ""}`}
        style={style}
        aria-label={formatted}
        role="text"
      >
        {/* 스크린 리더용 실제 값 */}
        <span className="motile-number-flow__sr-only">{formatted}</span>

        {/* 숫자 */}
        <span className="motile-number-flow__value" aria-hidden="true">
          {characters}
        </span>
      </span>
    );
  }
);

NumberFlow.displayName = "NumberFlow";
