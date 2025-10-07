import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "underline"],
      description: "Input variant style",
    },
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
        "Border and focus color (priority 1: props > --taeri-ui-input > --taeri-theme > default)",
    },
    maxLength: {
      control: "number",
      description: "Maximum character length (shows counter automatically)",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const WithValue: Story = {
  args: {
    value: "Hello World",
    placeholder: "Enter text...",
  },
};

export const Error: Story = {
  args: {
    placeholder: "Enter text...",
    isError: true,
    value: "Invalid input",
  },
};

export const Disabled: Story = {
  args: {
    placeholder: "Disabled input",
    disabled: true,
  },
};

export const CustomColor: Story = {
  args: {
    placeholder: "Custom color input",
    color: "#10b981",
  },
};

export const WithClear: Story = {
  args: {
    value: "Clear me",
    placeholder: "Enter text...",
    onClear: () => alert("Clear clicked!"),
  },
};

export const Underline: Story = {
  args: {
    variant: "underline",
    placeholder: "Search...",
  },
};

export const WithCharacterCounter: Story = {
  args: {
    placeholder: "Type something (max 100 chars)...",
    maxLength: 100,
  },
};
