import type { Meta, StoryObj } from "@storybook/react";
import { Popover } from "./Popover";
import { Button } from "../Button";

const meta = {
  title: "Components/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    position: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
      description: "Popover position",
    },
  },
} satisfies Meta<typeof Popover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  args: {
    position: "bottom",
    content: (
      <div>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600 }}>
          Popover Title
        </h3>
        <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
          This is a basic popover with some content.
        </p>
      </div>
    ),
    children: <Button>Click to open</Button>,
  },
};

export const RichContent: Story = {
  args: {
    position: "bottom",
    content: (
      <div style={{ width: "300px" }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: "16px", fontWeight: 600 }}>
          Rich Content Popover
        </h3>
        <p style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#666" }}>
          This popover contains rich content with multiple elements.
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              background: "white",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "6px",
              border: "none",
              background: "#007bff",
              color: "white",
              cursor: "pointer",
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    ),
    children: <Button>Open Rich Content</Button>,
  },
};
