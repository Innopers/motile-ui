import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Modal } from "./Modal";

const meta = {
  title: "Components/Modal",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
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
          <Modal.Overlay>
            <Modal.Content style={{ padding: "0" }}>
              <Modal.Header>
                <Modal.Title>Modal Title</Modal.Title>
                <Modal.Close />
              </Modal.Header>
              <Modal.Description>
                <p>This is modal content. You can put any content here.</p>
                <p>
                  Click outside, press ESC, or click the close button to close.
                </p>
              </Modal.Description>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      </div>
    );
  },
};

export const WithFooter: Story = {
  render: () => {
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
          <Modal.Overlay>
            <Modal.Content style={{ padding: "0" }}>
              <Modal.Header>
                <Modal.Title>Modal with Footer</Modal.Title>
                <Modal.Close />
              </Modal.Header>
              <Modal.Description>
                <p>This modal has action buttons in the footer.</p>
              </Modal.Description>
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
  render: () => {
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
          <Modal.Overlay>
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
  render: () => {
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
          <Modal.Overlay variant="slideDown">
            <Modal.Content style={{ padding: "0" }}>
              <Modal.Header>
                <Modal.Title>Slide Down Animation</Modal.Title>
                <Modal.Close />
              </Modal.Header>
              <Modal.Description>
                <p>This modal slides down from the top of the screen.</p>
                <p>The animation creates a smooth drop effect from above.</p>
              </Modal.Description>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      </div>
    );
  },
};

export const SlideUp: Story = {
  render: () => {
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
          <Modal.Overlay variant="slideUp">
            <Modal.Content style={{ padding: "0" }}>
              <Modal.Header>
                <Modal.Title>Slide Up Animation</Modal.Title>
                <Modal.Close />
              </Modal.Header>
              <Modal.Description>
                <p>This modal slides up from the bottom of the screen.</p>
                <p>The animation creates a smooth rise effect from below.</p>
              </Modal.Description>
            </Modal.Content>
          </Modal.Overlay>
        </Modal.Root>
      </div>
    );
  },
};
