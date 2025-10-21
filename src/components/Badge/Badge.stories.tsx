import type { Meta, StoryObj } from "@storybook/react";
import { Badge } from "./Badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outlined", "dot"],
      description: "Badge 스타일 variant",
    },
    size: {
      control: "select",
      options: ["large", "medium", "small"],
      description: "Badge 크기 (default: medium)",
    },
    color: {
      control: "color",
      description:
        "Badge 배경 색상 (priority: props > --taeri-ui-badge > --taeri-theme > default)",
    },
    children: {
      control: "text",
      description: "Badge 내용",
    },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    children: "Badge",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary",
  },
};

export const Outlined: Story = {
  args: {
    variant: "outlined",
    children: "Outlined",
  },
};

export const Dot: Story = {
  args: {
    variant: "dot",
    children: "Dot Badge",
  },
};
