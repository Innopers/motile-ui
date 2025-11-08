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
        "Border and focus color (priority 1: props > --motile-ui-input > --motile-theme > default)",
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
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Core States
// ============================================

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const WithLabel: Story = {
  args: {
    label: "Email",
    placeholder: "example@email.com",
  },
};

export const WithValue: Story = {
  args: {
    label: "Name",
    value: "John Doe",
    placeholder: "Enter your name",
  },
};

export const Error: Story = {
  args: {
    label: "Email",
    placeholder: "example@email.com",
    errorMessage: "This email is already taken",
    value: "test@",
  },
};

export const Disabled: Story = {
  args: {
    label: "Email",
    placeholder: "admin@company.com",
    disabled: true,
    value: "admin@company.com",
  },
};

export const Underline: Story = {
  args: {
    variant: "underline",
    placeholder: "Search...",
  },
};

// ============================================
// Feature Combinations
// ============================================

export const WithClear: Story = {
  args: {
    label: "Username",
    value: "johndoe123",
    placeholder: "Enter username",
    onClear: () => alert("Input cleared!"),
  },
};

export const CustomColor: Story = {
  args: {
    label: "Custom Theme",
    placeholder: "With custom color",
    color: "#10b981",
  },
};

export const WithCounter: Story = {
  args: {
    label: "Bio",
    placeholder: "Tell us about yourself",
    maxLength: 100,
    value: "Hello! Nice to meet you.",
  },
};

export const ErrorWithCounter: Story = {
  args: {
    label: "Description",
    placeholder: "Enter description (min 10 chars)",
    errorMessage: "Description must be at least 10 characters",
    maxLength: 50,
    value: "Short",
  },
};

// ============================================
// Variant Tests
// ============================================

export const UnderlineWithLabel: Story = {
  args: {
    variant: "underline",
    label: "Username",
    placeholder: "Enter username",
  },
};

export const UnderlineWithError: Story = {
  args: {
    variant: "underline",
    label: "Password",
    placeholder: "Enter password",
    errorMessage: "Password must be at least 8 characters",
    value: "123",
  },
};
