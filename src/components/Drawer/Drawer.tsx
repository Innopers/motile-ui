import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useScrollLock } from "../../hooks/useScrollLock";
import { useClickOutside } from "../../hooks/useClickOutside";
import { useEscapeKey } from "../../hooks/useEscapeKey";
import "./Drawer.css";

/**
 * 백드롭 인터랙션으로 닫기 옵션
 * - boolean: ESC 키와 외부 클릭 모두 제어
 * - object: 각각 독립적으로 제어
 */
export type CloseOnBackdropOptions =
  | boolean
  | {
      /**
       * ESC 키로 닫기 허용
       * @default false (object 사용 시)
       */
      escapeKey?: boolean;
      /**
       * 외부 클릭으로 닫기 허용
       * @default false (object 사용 시)
       */
      clickOutside?: boolean;
    };

export interface DrawerHandle {
  close: () => void;
  open: () => void;
}

export interface DrawerProps {
  /**
   * Drawer 열림/닫힘 상태
   */
  isOpen?: boolean;

  /**
   * Drawer가 닫힐 때 호출되는 콜백
   */
  onClose?: () => void;

  /**
   * Drawer가 열릴 때 호출되는 콜백
   */
  onOpen?: () => void;

  /**
   * Drawer 제목
   */
  title?: string;

  /**
   * Drawer 내용
   */
  children: React.ReactNode;

  /**
   * 백드롭 인터랙션으로 닫기 허용
   *
   * - `true`: 외부 클릭과 ESC 키 모두 허용
   * - `false`: 외부 클릭과 ESC 키 모두 비활성화
   * - `{ escapeKey: true }`: ESC 키만 허용
   * - `{ clickOutside: true }`: 외부 클릭만 허용
   * - `{ escapeKey: true, clickOutside: true }`: 모두 허용 (명시적)
   *
   * @default true
   */
  closeOnBackdrop?: CloseOnBackdropOptions;

  /**
   * 드래그로 닫기 허용
   * @default true
   */
  closeOnDrag?: boolean;

  /**
   * Drawer 최대 높이 (%, vh, dvh, px 등)
   * @default '70dvh'
   */
  maxHeight?: string;

  /**
   * Drawer 너비 (데스크톱)
   * @default '480px'
   */
  width?: string;

  /**
   * Drawer 최대 컨테이너 너비 (데스크톱 전용)
   *
   * 앱의 레이아웃 max-width와 Drawer를 일치시킬 때 사용합니다.
   * 모바일에서는 무시되고 항상 100% 너비입니다.
   *
   * @default undefined (viewport 전체 너비)
   *
   * @example
   * // 1024px 컨테이너 레이아웃에 맞추기
   * <Drawer width="480px" maxWidth="1024px" />
   *
   * // 좌우 회색 배경이 있는 레이아웃
   * <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
   *   <Drawer maxWidth="1024px" />
   * </div>
   */
  maxWidth?: string;

  /**
   * z-index 값
   * @default 9999
   */
  zIndex?: number;

  /**
   * 커스텀 className
   */
  className?: string;

  /**
   * 커스텀 스타일
   */
  style?: React.CSSProperties;
}

export const Drawer = forwardRef<DrawerHandle, DrawerProps>(
  (
    {
      isOpen = false,
      onClose,
      onOpen,
      title,
      children,
      closeOnBackdrop = true,
      closeOnDrag = true,
      maxHeight = "70dvh",
      width = "480px",
      maxWidth,
      zIndex = 9999,
      className = "",
      style,
    },
    ref
  ) => {
    const drawerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);
    const bodyRef = useRef<HTMLDivElement>(null);

    // Drag state
    const startYRef = useRef<number | null>(null);
    const currentYRef = useRef<number>(0);
    const isDraggingRef = useRef<boolean>(false);

    // Animation state
    const [isVisible, setIsVisible] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    // closeOnBackdrop 옵션 처리
    const backdropOptions =
      typeof closeOnBackdrop === "boolean"
        ? { escapeKey: closeOnBackdrop, clickOutside: closeOnBackdrop }
        : {
            escapeKey: closeOnBackdrop?.escapeKey ?? false,
            clickOutside: closeOnBackdrop?.clickOutside ?? false,
          };

    // 배경 스크롤 차단
    useScrollLock({
      enabled: isOpen,
      allowedSelectors: [
        "[data-scroll-allowed]",
        ".motile-drawer__body",
        ".motile-drawer-body",
      ],
    });

    // 외부에서 제어 가능하도록 expose
    useImperativeHandle(ref, () => ({
      close: () => handleClose(),
      open: () => handleOpen(),
    }));

    // Open/Close 핸들러
    const handleOpen = () => {
      setShouldRender(true);
      onOpen?.();
    };

    const handleClose = () => {
      if (!drawerRef.current) {
        setIsVisible(false);
        setTimeout(() => {
          setShouldRender(false);
          onClose?.();
        }, 300);
        return;
      }

      // Closing animation
      drawerRef.current.style.transition = "transform 0.3s ease";
      drawerRef.current.style.transform = "translateY(100%)";
      setIsVisible(false);

      setTimeout(() => {
        setShouldRender(false);
        onClose?.();
      }, 300);
    };

    // isOpen prop 변경 감지
    useEffect(() => {
      if (isOpen) {
        handleOpen();
      } else if (shouldRender) {
        handleClose();
      }
    }, [isOpen]);

    // Opening animation
    useEffect(() => {
      if (!shouldRender || !drawerRef.current) return;

      const drawer = drawerRef.current;

      // 초기 상태 (아래로 숨김)
      drawer.style.transition = "none";
      drawer.style.transform = "translateY(100%)";

      // 다음 프레임에 애니메이션 시작
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          drawer.style.transition = "transform 0.3s ease";
          drawer.style.transform = "translateY(0)";
          setIsVisible(true);
        });
      });
    }, [shouldRender]);

    // 외부 클릭으로 닫기
    useClickOutside({
      refs: [drawerRef],
      handler: handleClose,
      enabled: isOpen && backdropOptions.clickOutside,
    });

    // ESC 키로 닫기
    useEscapeKey({
      handler: handleClose,
      enabled: isOpen && backdropOptions.escapeKey,
    });

    // Drag handlers
    const handleDragStart = (clientY: number) => {
      if (!closeOnDrag) return;
      startYRef.current = clientY;
      isDraggingRef.current = false;
    };

    const handleDragMove = (clientY: number) => {
      if (
        !closeOnDrag ||
        !drawerRef.current ||
        startYRef.current === null ||
        !bodyRef.current
      )
        return;

      const deltaY = clientY - startYRef.current;

      // Body가 최상단에 있고 아래로 드래그할 때만 Drawer 이동
      if (bodyRef.current.scrollTop <= 0 && deltaY > 0) {
        isDraggingRef.current = true;
        currentYRef.current = deltaY;
        drawerRef.current.style.transition = "none";
        drawerRef.current.style.transform = `translateY(${deltaY}px)`;
      }
    };

    const handleDragEnd = () => {
      if (!closeOnDrag || !drawerRef.current) return;

      const threshold = window.innerHeight * 0.2;
      drawerRef.current.style.transition = "transform 0.3s ease";

      if (isDraggingRef.current && currentYRef.current > threshold) {
        // 임계값 초과 시 닫기
        handleClose();
      } else {
        // 원위치
        drawerRef.current.style.transform = "translateY(0)";
        currentYRef.current = 0;
      }

      isDraggingRef.current = false;
      startYRef.current = null;
    };

    // Touch events
    const handleTouchStart = (e: React.TouchEvent) => {
      handleDragStart(e.touches[0].clientY);
    };

    const handleTouchMove = (e: React.TouchEvent) => {
      handleDragMove(e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
      handleDragEnd();
    };

    // Mouse events
    const handleMouseDown = (e: React.MouseEvent) => {
      handleDragStart(e.clientY);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        handleDragMove(moveEvent.clientY);
      };

      const handleMouseUp = () => {
        handleDragEnd();
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };

      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    if (!shouldRender) return null;

    const baseClass = "motile-drawer";

    const drawerClasses = [
      `${baseClass}__content`,
      isVisible && `${baseClass}__content--visible`,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const drawerStyle: React.CSSProperties = {
      ...(maxHeight !== "70dvh" &&
        ({ "--drawer-max-height": maxHeight } as React.CSSProperties)),
      ...(width !== "480px" &&
        ({ "--drawer-width": width } as React.CSSProperties)),
      ...(maxWidth &&
        ({ "--drawer-max-width": maxWidth } as React.CSSProperties)),
      zIndex: zIndex + 1,
      ...style,
    };

    return createPortal(
      <div
        ref={overlayRef}
        className={`${baseClass}__overlay ${
          isVisible ? `${baseClass}__overlay--visible` : ""
        }`}
        style={{ zIndex }}
        role="presentation"
      >
        <div
          ref={drawerRef}
          className={drawerClasses}
          style={drawerStyle}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? `${baseClass}-title` : undefined}
        >
          {/* Handle (드래그 영역) */}
          <div
            className={`${baseClass}__header`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
          >
            <div className={`${baseClass}__handle`} aria-hidden="true" />
          </div>

          {/* Title (optional) */}
          {title && (
            <div className={`${baseClass}__title-wrapper`}>
              <h2 id={`${baseClass}-title`} className={`${baseClass}__title`}>
                {title}
              </h2>
            </div>
          )}

          {/* Body (스크롤 가능 영역) */}
          <div
            ref={bodyRef}
            className={`${baseClass}__body`}
            data-scroll-allowed
          >
            {children}
          </div>
        </div>
      </div>,
      document.body
    );
  }
);

Drawer.displayName = "Drawer";
