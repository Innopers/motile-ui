import { useEffect, useState } from "react";

/**
 * SSR-safe 미디어 쿼리 훅
 *
 * @param query - 미디어 쿼리 문자열 (예: "(max-width: 768px)")
 * @returns 미디어 쿼리 매칭 여부
 *
 * @example
 * const isMobile = useMediaQuery("(max-width: 768px)");
 * const isDarkMode = useMediaQuery("(prefers-color-scheme: dark)");
 */
export function useMediaQuery(query: string): boolean {
  // SSR-safe: lazy initialization으로 초기 리렌더 방지
  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    // 클라이언트에서만 실행
    const media = window.matchMedia(query);

    // 초기값 설정
    setMatches(media.matches);

    // 변경 감지 listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Event listener 등록 (Safari 14+ / Chrome 45+ / Firefox 55+)
    media.addEventListener("change", listener);

    return () => {
      media.removeEventListener("change", listener);
    };
  }, [query]);

  return matches;
}
