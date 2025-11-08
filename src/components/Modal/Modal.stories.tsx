import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Modal } from "./Modal";

// Props that can be controlled via Storybook
interface ModalStoryArgs {
  variant?: "scale" | "slideDown" | "slideUp" | "bottomSheet";
  closeOnBackdrop?: boolean;
  disableScrollLock?: boolean;
}

const meta = {
  title: "Components/Modal",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["scale", "slideDown", "slideUp", "bottomSheet"],
      description: "Modal 애니메이션 variant",
      table: {
        defaultValue: { summary: '"scale"' },
        type: {
          summary: '"scale" | "slideDown" | "slideUp" | "bottomSheet"',
        },
      },
    },
    closeOnBackdrop: {
      control: "boolean",
      description: "백드롭 클릭 및 ESC 키로 닫기",
      table: {
        defaultValue: { summary: "true" },
        type: { summary: "boolean" },
      },
    },
    disableScrollLock: {
      control: "boolean",
      description: "배경 스크롤 잠금 비활성화",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
      },
    },
  },
} satisfies Meta<ModalStoryArgs>;

export default meta;
type Story = StoryObj<ModalStoryArgs>;

export const Default: Story = {
  args: {
    variant: "scale",
    closeOnBackdrop: true,
    disableScrollLock: false,
  },
  render: ({ variant, closeOnBackdrop, disableScrollLock }) => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "12px 24px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Open Modal
        </button>
        <Modal.Root open={open} onOpenChange={setOpen}>
          <Modal.Overlay
            variant={variant}
            closeOnBackdrop={closeOnBackdrop}
            disableScrollLock={disableScrollLock}
          >
            <Modal.Content style={{ padding: "0" }}>
              <Modal.Header>
                <Modal.Title>Modal Title</Modal.Title>
                <Modal.Close />
              </Modal.Header>
              <Modal.Body>
                <p>This is modal content. You can put any content here.</p>
                <p>
                  Click outside, press ESC, or click the close button to close.
                </p>
              </Modal.Body>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      </div>
    );
  },
};

export const WithFooter: Story = {
  args: {
    variant: "scale",
    closeOnBackdrop: true,
    disableScrollLock: false,
  },
  render: ({ variant, closeOnBackdrop, disableScrollLock }) => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "12px 24px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Open Modal with Footer
        </button>
        <Modal.Root open={open} onOpenChange={setOpen}>
          <Modal.Overlay
            variant={variant}
            closeOnBackdrop={closeOnBackdrop}
            disableScrollLock={disableScrollLock}
          >
            <Modal.Content style={{ padding: "0" }}>
              <Modal.Header>
                <Modal.Title>Modal with Footer</Modal.Title>
                <Modal.Close />
              </Modal.Header>
              <Modal.Body>
                <p>This modal has action buttons in the footer.</p>
              </Modal.Body>
              <Modal.Footer>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#e5e7eb",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    alert("Confirmed!");
                    setOpen(false);
                  }}
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                  }}
                >
                  Confirm
                </button>
              </Modal.Footer>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      </div>
    );
  },
};

export const Simple: Story = {
  args: {
    variant: "scale",
    closeOnBackdrop: true,
    disableScrollLock: false,
  },
  render: ({ variant, closeOnBackdrop, disableScrollLock }) => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "12px 24px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Open Simple Modal
        </button>
        <Modal.Root open={open} onOpenChange={setOpen}>
          <Modal.Overlay
            variant={variant}
            closeOnBackdrop={closeOnBackdrop}
            disableScrollLock={disableScrollLock}
          >
            <Modal.Content
              style={{
                padding: "32px",
                maxWidth: "400px",
                textAlign: "center",
              }}
            >
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    width: "64px",
                    height: "64px",
                    backgroundColor: "#d1fae5",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 16px",
                  }}
                >
                  <span style={{ fontSize: "32px" }}>✓</span>
                </div>
                <h2
                  style={{
                    fontSize: "24px",
                    fontWeight: "bold",
                    color: "#111827",
                    marginBottom: "12px",
                  }}
                >
                  Success!
                </h2>
                <p style={{ color: "#6b7280" }}>
                  Custom modal without header and footer components.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                style={{
                  width: "100%",
                  padding: "12px 24px",
                  backgroundColor: "#10b981",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                Close
              </button>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      </div>
    );
  },
};

export const SlideDown: Story = {
  args: {
    variant: "slideDown",
    closeOnBackdrop: true,
    disableScrollLock: false,
  },
  render: ({ variant, closeOnBackdrop, disableScrollLock }) => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "12px 24px",
            backgroundColor: "#8b5cf6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Open Slide Down Modal
        </button>
        <Modal.Root open={open} onOpenChange={setOpen}>
          <Modal.Overlay
            variant={variant}
            closeOnBackdrop={closeOnBackdrop}
            disableScrollLock={disableScrollLock}
          >
            <Modal.Content style={{ padding: "0" }}>
              <Modal.Header>
                <Modal.Title>Slide Down Animation</Modal.Title>
                <Modal.Close />
              </Modal.Header>
              <Modal.Body>
                <p>This modal slides down from the top of the screen.</p>
                <p>The animation creates a smooth drop effect from above.</p>
              </Modal.Body>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      </div>
    );
  },
};

export const SlideUp: Story = {
  args: {
    variant: "slideUp",
    closeOnBackdrop: true,
    disableScrollLock: false,
  },
  render: ({ variant, closeOnBackdrop, disableScrollLock }) => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "12px 24px",
            backgroundColor: "#ec4899",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Open Slide Up Modal
        </button>
        <Modal.Root open={open} onOpenChange={setOpen}>
          <Modal.Overlay
            variant={variant}
            closeOnBackdrop={closeOnBackdrop}
            disableScrollLock={disableScrollLock}
          >
            <Modal.Content style={{ padding: "0" }}>
              <Modal.Header>
                <Modal.Title>Slide Up Animation</Modal.Title>
                <Modal.Close />
              </Modal.Header>
              <Modal.Body>
                <p>This modal slides up from the bottom of the screen.</p>
                <p>The animation creates a smooth rise effect from below.</p>
              </Modal.Body>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      </div>
    );
  },
};

export const BottomSheet: Story = {
  args: {
    variant: "bottomSheet",
    closeOnBackdrop: true,
    disableScrollLock: false,
  },
  render: ({ variant, closeOnBackdrop, disableScrollLock }) => {
    const [open, setOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setOpen(true)}
          style={{
            padding: "12px 24px",
            backgroundColor: "#06b6d4",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Open Notification Sheet
        </button>
        <Modal.Root open={open} onOpenChange={setOpen}>
          <Modal.Overlay
            variant={variant}
            closeOnBackdrop={closeOnBackdrop}
            disableScrollLock={disableScrollLock}
          >
            <Modal.Content style={{ padding: "0" }}>
              <div style={{ padding: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      width: "48px",
                      height: "48px",
                      backgroundColor: "#dbeafe",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                    }}
                  >
                    🎉
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        marginBottom: "4px",
                        color: "#111827",
                      }}
                    >
                      할인 쿠폰 도착!
                    </h3>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#6b7280",
                        margin: 0,
                      }}
                    >
                      10% 할인 쿠폰이 지급되었습니다
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    padding: "16px",
                    backgroundColor: "#f0f9ff",
                    borderRadius: "8px",
                    marginBottom: "16px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "14px",
                      color: "#1e40af",
                      marginBottom: "8px",
                    }}
                  >
                    <strong>쿠폰 코드:</strong> SAVE10
                  </div>
                  <div style={{ fontSize: "12px", color: "#6b7280" }}>
                    2024년 12월 31일까지 사용 가능
                  </div>
                </div>
                <button
                  onClick={() => setOpen(false)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    backgroundColor: "#06b6d4",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontSize: "16px",
                    fontWeight: "500",
                  }}
                >
                  확인
                </button>
              </div>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      </div>
    );
  },
};
