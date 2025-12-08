import type { Meta, StoryObj } from "@storybook/react";

import { Textarea } from "./Textarea";

const meta = {
  title: "Components/Textarea",
  component: Textarea,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
    isError: {
      control: "boolean",
      description: "Error state",
    },
    disabled: {
      control: "boolean",
      description: "Disabled state",
    },
    autoFocus: {
      control: "boolean",
      description: "Auto focus on mount",
    },
    autoSelect: {
      control: "boolean",
      description: "Auto select text on focus (requires autoFocus)",
    },
    color: {
      control: "color",
      description:
        "Border and focus color (priority 1: props > --motile-ui-textarea > --motile-theme > default)",
    },
    maxLength: {
      control: "number",
      description: "Maximum character length (shows counter automatically)",
    },
    errorMessage: {
      control: "text",
      description: "Error message (automatically sets isError to true)",
    },
    label: {
      control: "text",
      description:
        "Floating label (animates from placeholder position to top on focus/value)",
    },
    rows: {
      control: "number",
      description: "Number of visible text lines",
    },
    resize: {
      control: "select",
      options: ["none", "vertical", "horizontal", "both"],
      description: "Resize control (ignored when autoSize is enabled)",
    },
    autoSize: {
      control: "boolean",
      description:
        "Auto-resize height based on content (use object for minRows/maxRows)",
    },
  },
} satisfies Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter your message...",
  },
};

export const WithLabel: Story = {
  args: {
    label: "Message",
    placeholder: "Type here...",
  },
};

export const WithErrorMessage: Story = {
  args: {
    label: "Bio",
    placeholder: "Tell us about yourself...",
    errorMessage: "This field is required",
    value: "",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled textarea",
    disabled: true,
    value: "This textarea is disabled",
  },
};

export const WithMaxLength: Story = {
  args: {
    label: "Description",
    placeholder: "Enter description...",
    maxLength: 500,
    value: "This combines label and character counter.",
  },
};

export const AutoSize: Story = {
  args: {
    label: "Message",
    placeholder: "Type to see auto-resize...",
    autoSize: true,
  },
};
