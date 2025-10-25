import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { SpeedDial } from "./SpeedDial";

interface SpeedDialStoryArgs {
  direction?: "up" | "down" | "left" | "right";
  closeOnClickOutside?: boolean;
  closeOnEscapeKey?: boolean;
}

const meta = {
  title: "Components/SpeedDial",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    direction: {
      control: "select",
      options: ["up", "down", "left", "right"],
      description: "Actions가 나타나는 방향",
      table: {
        defaultValue: { summary: '"up"' },
        type: { summary: '"up" | "down" | "left" | "right"' },
      },
    },
    closeOnClickOutside: {
      control: "boolean",
      description: "외부 클릭 시 자동으로 닫기",
      table: {
        defaultValue: { summary: "true" },
        type: { summary: "boolean" },
      },
    },
    closeOnEscapeKey: {
      control: "boolean",
      description: "ESC 키로 닫기",
      table: {
        defaultValue: { summary: "true" },
        type: { summary: "boolean" },
      },
    },
  },
} satisfies Meta<SpeedDialStoryArgs>;

export default meta;
type Story = StoryObj<SpeedDialStoryArgs>;

// Icons as SVG components
const ShareIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);

const CopyIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);

const TwitterIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const LinkIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

export const Default: Story = {
  args: {
    direction: "up",
    closeOnClickOutside: true,
    closeOnEscapeKey: true,
  },
  render: ({ direction, closeOnClickOutside, closeOnEscapeKey }) => {
    const [open, setOpen] = useState(false);

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px",
        }}
      >
        <SpeedDial.Root
          open={open}
          onOpenChange={setOpen}
          direction={direction}
          closeOnClickOutside={closeOnClickOutside}
          closeOnEscapeKey={closeOnEscapeKey}
        >
          <SpeedDial.Trigger
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              transition: "all 0.2s",
            }}
          >
            <ShareIcon />
          </SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action
              aria-label="Copy Link"
              onClick={() => alert("Copy Link")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "#374151",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s",
              }}
            >
              <CopyIcon />
            </SpeedDial.Action>
            <SpeedDial.Action
              aria-label="Share on Twitter"
              onClick={() => alert("Share on Twitter")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "#1da1f2",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s",
              }}
            >
              <TwitterIcon />
            </SpeedDial.Action>
            <SpeedDial.Action
              aria-label="Share on Facebook"
              onClick={() => alert("Share on Facebook")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "#1877f2",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s",
              }}
            >
              <FacebookIcon />
            </SpeedDial.Action>
            <SpeedDial.Action
              aria-label="Get Link"
              onClick={() => alert("Get Link")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "#374151",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s",
              }}
            >
              <LinkIcon />
            </SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      </div>
    );
  },
};

export const DirectionDown: Story = {
  args: {
    direction: "down",
    closeOnClickOutside: true,
    closeOnEscapeKey: true,
  },
  render: ({ direction, closeOnClickOutside, closeOnEscapeKey }) => {
    const [open, setOpen] = useState(false);

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px",
        }}
      >
        <SpeedDial.Root
          open={open}
          onOpenChange={setOpen}
          direction={direction}
          closeOnClickOutside={closeOnClickOutside}
          closeOnEscapeKey={closeOnEscapeKey}
        >
          <SpeedDial.Trigger
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#ec4899",
              color: "white",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              transition: "all 0.2s",
            }}
          >
            <ShareIcon />
          </SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action
              aria-label="Copy Link"
              onClick={() => alert("Copy Link")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "#374151",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s",
              }}
            >
              <CopyIcon />
            </SpeedDial.Action>
            <SpeedDial.Action
              aria-label="Share on Twitter"
              onClick={() => alert("Share on Twitter")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "#1da1f2",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s",
              }}
            >
              <TwitterIcon />
            </SpeedDial.Action>
            <SpeedDial.Action
              aria-label="Share on Facebook"
              onClick={() => alert("Share on Facebook")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "#1877f2",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s",
              }}
            >
              <FacebookIcon />
            </SpeedDial.Action>
            <SpeedDial.Action
              aria-label="Get Link"
              onClick={() => alert("Get Link")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "#374151",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s",
              }}
            >
              <LinkIcon />
            </SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      </div>
    );
  },
};

export const DirectionLeft: Story = {
  args: {
    direction: "left",
    closeOnClickOutside: true,
    closeOnEscapeKey: true,
  },
  render: ({ direction, closeOnClickOutside, closeOnEscapeKey }) => {
    const [open, setOpen] = useState(false);

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px",
        }}
      >
        <SpeedDial.Root
          open={open}
          onOpenChange={setOpen}
          direction={direction}
          closeOnClickOutside={closeOnClickOutside}
          closeOnEscapeKey={closeOnEscapeKey}
        >
          <SpeedDial.Trigger
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#8b5cf6",
              color: "white",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              transition: "all 0.2s",
            }}
          >
            <ShareIcon />
          </SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action
              aria-label="Copy Link"
              onClick={() => alert("Copy Link")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "#374151",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s",
              }}
            >
              <CopyIcon />
            </SpeedDial.Action>
            <SpeedDial.Action
              aria-label="Share on Twitter"
              onClick={() => alert("Share on Twitter")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "#1da1f2",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s",
              }}
            >
              <TwitterIcon />
            </SpeedDial.Action>
            <SpeedDial.Action
              aria-label="Share on Facebook"
              onClick={() => alert("Share on Facebook")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "#1877f2",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s",
              }}
            >
              <FacebookIcon />
            </SpeedDial.Action>
            <SpeedDial.Action
              aria-label="Get Link"
              onClick={() => alert("Get Link")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "#374151",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s",
              }}
            >
              <LinkIcon />
            </SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      </div>
    );
  },
};

export const DirectionRight: Story = {
  args: {
    direction: "right",
    closeOnClickOutside: true,
    closeOnEscapeKey: true,
  },
  render: ({ direction, closeOnClickOutside, closeOnEscapeKey }) => {
    const [open, setOpen] = useState(false);

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "300px",
        }}
      >
        <SpeedDial.Root
          open={open}
          onOpenChange={setOpen}
          direction={direction}
          closeOnClickOutside={closeOnClickOutside}
          closeOnEscapeKey={closeOnEscapeKey}
        >
          <SpeedDial.Trigger
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "#10b981",
              color: "white",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              transition: "all 0.2s",
            }}
          >
            <ShareIcon />
          </SpeedDial.Trigger>
          <SpeedDial.Actions>
            <SpeedDial.Action
              aria-label="Copy Link"
              onClick={() => alert("Copy Link")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "#374151",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s",
              }}
            >
              <CopyIcon />
            </SpeedDial.Action>
            <SpeedDial.Action
              aria-label="Share on Twitter"
              onClick={() => alert("Share on Twitter")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "#1da1f2",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s",
              }}
            >
              <TwitterIcon />
            </SpeedDial.Action>
            <SpeedDial.Action
              aria-label="Share on Facebook"
              onClick={() => alert("Share on Facebook")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "#1877f2",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s",
              }}
            >
              <FacebookIcon />
            </SpeedDial.Action>
            <SpeedDial.Action
              aria-label="Get Link"
              onClick={() => alert("Get Link")}
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                backgroundColor: "white",
                color: "#374151",
                border: "1px solid #e5e7eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow:
                  "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
                transition: "all 0.2s",
              }}
            >
              <LinkIcon />
            </SpeedDial.Action>
          </SpeedDial.Actions>
        </SpeedDial.Root>
      </div>
    );
  },
};
