import { useEffect } from "react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { act, render, screen } from "@/test/utils";

import { ToastProvider } from "./Toast";
import { useToast, type UseToastReturn } from "./useToast";

// TestComponent to use the hook inside
function TestComponent({
  onMount,
}: {
  onMount: (toast: UseToastReturn) => void;
}) {
  const toast = useToast();

  useEffect(() => {
    onMount(toast);
  }, [toast, onMount]);

  return <div data-testid="test-component">Test</div>;
}

describe("Toast", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Provider와 Context", () => {
    it("ToastProvider가 children을 렌더링함", () => {
      render(
        <ToastProvider>
          <div>Child content</div>
        </ToastProvider>
      );

      expect(screen.getByText("Child content")).toBeInTheDocument();
    });

    it("ToastProvider 밖에서 useToast 사용 시 에러 발생", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => {
        render(
          <TestComponent
            onMount={() => {
              // This will throw
            }}
          />
        );
      }).toThrow("useToastContext must be used within ToastProvider");

      spy.mockRestore();
    });

    it("Portal을 통해 document.body에 toast container가 렌더링됨", () => {
      render(
        <ToastProvider>
          <TestComponent onMount={() => {}} />
        </ToastProvider>
      );

      // Wait for mount effect
      act(() => {
        vi.runAllTimers();
      });

      const container = document.querySelector(".motile-toast-container");
      expect(container).toBeInTheDocument();
      expect(document.body.contains(container)).toBe(true);
    });
  });

  describe("useToast Hook - Variants", () => {
    it("show()로 기본 toast를 표시함", () => {
      let toastApi: UseToastReturn;

      render(
        <ToastProvider>
          <TestComponent onMount={(api) => (toastApi = api)} />
        </ToastProvider>
      );

      act(() => {
        toastApi.show("Default message");
      });

      const toast = screen.getByText("Default message");
      expect(toast).toBeInTheDocument();
      expect(toast.closest(".motile-toast")).toHaveClass(
        "motile-toast--default"
      );
    });

    it("success()로 아이콘이 있는 성공 toast를 표시함", () => {
      let toastApi: UseToastReturn;

      render(
        <ToastProvider>
          <TestComponent onMount={(api) => (toastApi = api)} />
        </ToastProvider>
      );

      act(() => {
        toastApi.success("Success message");
      });

      const toast = screen.getByText("Success message");
      expect(toast).toBeInTheDocument();
      expect(toast.closest(".motile-toast")).toHaveClass(
        "motile-toast--success"
      );

      // Icon 렌더링
      const icon = toast
        .closest(".motile-toast")
        ?.querySelector(".motile-toast__icon");
      expect(icon).toBeInTheDocument();
    });

    it("error()로 아이콘이 있는 에러 toast를 표시함", () => {
      let toastApi: UseToastReturn;

      render(
        <ToastProvider>
          <TestComponent onMount={(api) => (toastApi = api)} />
        </ToastProvider>
      );

      act(() => {
        toastApi.error("Error message");
      });

      const toast = screen.getByText("Error message");
      expect(toast).toBeInTheDocument();
      expect(toast.closest(".motile-toast")).toHaveClass("motile-toast--error");

      const icon = toast
        .closest(".motile-toast")
        ?.querySelector(".motile-toast__icon");
      expect(icon).toBeInTheDocument();
    });

    it("warning()으로 아이콘이 있는 경고 toast를 표시함", () => {
      let toastApi: UseToastReturn;

      render(
        <ToastProvider>
          <TestComponent onMount={(api) => (toastApi = api)} />
        </ToastProvider>
      );

      act(() => {
        toastApi.warning("Warning message");
      });

      const toast = screen.getByText("Warning message");
      expect(toast).toBeInTheDocument();
      expect(toast.closest(".motile-toast")).toHaveClass(
        "motile-toast--warning"
      );

      const icon = toast
        .closest(".motile-toast")
        ?.querySelector(".motile-toast__icon");
      expect(icon).toBeInTheDocument();
    });

    it("info()로 아이콘이 있는 정보 toast를 표시함", () => {
      let toastApi: UseToastReturn;

      render(
        <ToastProvider>
          <TestComponent onMount={(api) => (toastApi = api)} />
        </ToastProvider>
      );

      act(() => {
        toastApi.info("Info message");
      });

      const toast = screen.getByText("Info message");
      expect(toast).toBeInTheDocument();
      expect(toast.closest(".motile-toast")).toHaveClass("motile-toast--info");

      const icon = toast
        .closest(".motile-toast")
        ?.querySelector(".motile-toast__icon");
      expect(icon).toBeInTheDocument();
    });
  });

  describe("Toast 표시", () => {
    it("toast 메시지가 렌더링됨", () => {
      let toastApi: UseToastReturn;

      render(
        <ToastProvider>
          <TestComponent onMount={(api) => (toastApi = api)} />
        </ToastProvider>
      );

      act(() => {
        toastApi.show("Test message");
      });

      expect(screen.getByText("Test message")).toBeInTheDocument();
    });

    it("toast 추가 시 ID를 반환함", () => {
      let toastApi: UseToastReturn;
      let toastId!: string;

      render(
        <ToastProvider>
          <TestComponent onMount={(api) => (toastApi = api)} />
        </ToastProvider>
      );

      act(() => {
        toastId = toastApi.show("Test");
      });

      expect(toastId).toBeTruthy();
      expect(toastId).toMatch(/^toast-/);
    });

    it("data-toast-id 속성이 있음", () => {
      let toastApi: UseToastReturn;
      let toastId!: string;

      render(
        <ToastProvider>
          <TestComponent onMount={(api) => (toastApi = api)} />
        </ToastProvider>
      );

      act(() => {
        toastId = toastApi.show("Toast message");
      });

      const toastElement = screen
        .getByText("Toast message")
        .closest(".motile-toast");
      expect(toastElement).toHaveAttribute("data-toast-id", toastId);
    });

    it("여러 toast가 표시되며 최신 것이 맨 위에 위치함", () => {
      let toastApi: UseToastReturn;

      render(
        <ToastProvider>
          <TestComponent onMount={(api) => (toastApi = api)} />
        </ToastProvider>
      );

      act(() => {
        toastApi.show("First");
        toastApi.show("Second");
        toastApi.show("Third");
      });

      const toasts = screen.getAllByRole("status").map((el) => el.textContent);
      expect(toasts).toEqual(["Third", "Second", "First"]);
    });
  });

  describe("옵션", () => {
    it("커스텀 duration 옵션이 적용됨", () => {
      let toastApi: UseToastReturn;

      render(
        <ToastProvider>
          <TestComponent onMount={(api) => (toastApi = api)} />
        </ToastProvider>
      );

      act(() => {
        toastApi.show("Custom duration", { duration: 2000 });
      });

      expect(screen.getByText("Custom duration")).toBeInTheDocument();

      // 2000ms + 250ms animation = 2250ms 후 제거
      act(() => {
        vi.advanceTimersByTime(2250);
      });

      expect(screen.queryByText("Custom duration")).not.toBeInTheDocument();
    });

    it("개별 toast에 커스텀 zIndex가 적용됨", () => {
      let toastApi: UseToastReturn;

      render(
        <ToastProvider>
          <TestComponent onMount={(api) => (toastApi = api)} />
        </ToastProvider>
      );

      act(() => {
        toastApi.show("High priority", { zIndex: 10000 });
      });

      const container = document.querySelector(".motile-toast-container");
      expect(container).toHaveStyle({ zIndex: "10000" });
    });
  });

  describe("자동 닫힘", () => {
    it("기본 duration(4000ms) 후 자동으로 사라짐", () => {
      let toastApi: UseToastReturn;

      render(
        <ToastProvider>
          <TestComponent onMount={(api) => (toastApi = api)} />
        </ToastProvider>
      );

      act(() => {
        toastApi.show("Auto dismiss");
      });

      expect(screen.getByText("Auto dismiss")).toBeInTheDocument();

      // 4000ms + 250ms animation = 4250ms
      act(() => {
        vi.advanceTimersByTime(4250);
      });

      expect(screen.queryByText("Auto dismiss")).not.toBeInTheDocument();
    });

    it("제거 전에 exit 애니메이션이 적용됨", () => {
      let toastApi: UseToastReturn;

      render(
        <ToastProvider>
          <TestComponent onMount={(api) => (toastApi = api)} />
        </ToastProvider>
      );

      act(() => {
        toastApi.show("Animation test", { duration: 100 });
      });

      // duration 후 exiting 클래스 추가
      act(() => {
        vi.advanceTimersByTime(100);
      });

      const toast = screen.getByText("Animation test").closest(".motile-toast");
      expect(toast).toHaveClass("motile-toast--exiting");

      // 250ms animation 후 제거
      act(() => {
        vi.advanceTimersByTime(250);
      });

      expect(screen.queryByText("Animation test")).not.toBeInTheDocument();
    });
  });

  describe("접근성", () => {
    it("toast에 role='status' 속성이 있음", () => {
      let toastApi: UseToastReturn;

      render(
        <ToastProvider>
          <TestComponent onMount={(api) => (toastApi = api)} />
        </ToastProvider>
      );

      act(() => {
        toastApi.show("Status test");
      });

      const toast = screen.getByRole("status");
      expect(toast).toBeInTheDocument();
      expect(toast).toHaveTextContent("Status test");
    });

    it("aria-live='polite'와 aria-atomic='true' 속성이 있음", () => {
      let toastApi: UseToastReturn;

      render(
        <ToastProvider>
          <TestComponent onMount={(api) => (toastApi = api)} />
        </ToastProvider>
      );

      act(() => {
        toastApi.show("ARIA test");
      });

      const toast = screen.getByRole("status");
      expect(toast).toHaveAttribute("aria-live", "polite");
      expect(toast).toHaveAttribute("aria-atomic", "true");
    });

    it("container에 aria-label='Notifications' 속성이 있음", () => {
      render(
        <ToastProvider>
          <TestComponent onMount={() => {}} />
        </ToastProvider>
      );

      act(() => {
        vi.runAllTimers();
      });

      const container = document.querySelector(".motile-toast-container");
      expect(container).toHaveAttribute("aria-label", "Notifications");
      expect(container).toHaveAttribute("aria-live", "polite");
    });
  });

  describe("zIndex 관리", () => {
    it("Provider의 zIndex prop이 기본값으로 사용됨", () => {
      render(
        <ToastProvider zIndex={8888}>
          <TestComponent onMount={() => {}} />
        </ToastProvider>
      );

      act(() => {
        vi.runAllTimers();
      });

      const container = document.querySelector(".motile-toast-container");
      expect(container).toHaveStyle({ zIndex: "8888" });
    });

    it("개별 toast 중 가장 높은 zIndex가 사용됨", () => {
      let toastApi: UseToastReturn;

      render(
        <ToastProvider zIndex={9000}>
          <TestComponent onMount={(api) => (toastApi = api)} />
        </ToastProvider>
      );

      act(() => {
        toastApi.show("Normal", { zIndex: 9500 });
        toastApi.show("High", { zIndex: 10000 });
        toastApi.show("Low", { zIndex: 9200 });
      });

      const container = document.querySelector(".motile-toast-container");
      expect(container).toHaveStyle({ zIndex: "10000" });
    });
  });
});
