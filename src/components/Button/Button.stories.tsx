import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "default"],
      description: "Button variant style",
    },
    size: {
      control: "select",
      options: ["large", "medium", "small"],
      description: "Button size",
    },
    fullWidth: {
      control: "boolean",
      description: "Make button full width (default: true)",
    },
    color: {
      control: "color",
      description:
        "Button background color (priority 1: props > --taeri-ui-btn > --taeri-theme > default)",
    },
    disabled: {
      control: "boolean",
      description: "Disable button",
    },
    isLoading: {
      control: "boolean",
      description: "Show loading state with animated dots",
    },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    variant: "primary",
    size: "large",
    children: "Button",
  },
};

export const AutoWidth: Story = {
  args: {
    variant: "primary",
    size: "large",
    fullWidth: false,
    children: "Auto Width Button",
  },
  parameters: {
    layout: "centered",
  },
};

export const Disabled: Story = {
  args: {
    variant: "primary",
    size: "large",
    disabled: true,
    children: "Button",
  },
};

export const WithIcon: Story = {
  args: {
    variant: "primary",
    size: "large",
    children: (
      <>
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
          <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
        </svg>
        Add Item
      </>
    ),
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    size: "large",
    children: "Secondary Button",
  },
};

export const Default: Story = {
  args: {
    variant: "default",
    size: "large",
    children: "Default Button",
  },
};

export const Loading: Story = {
  args: {
    variant: "primary",
    size: "large",
    isLoading: true,
    children: "Loading Button",
  },
};
