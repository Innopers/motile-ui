import type { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./Switch";

const meta = {
  title: "Components/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    label: {
      control: "text",
      description: "스위치 옆 라벨",
    },
    color: {
      control: "color",
      description: "커스텀 색상",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
    checked: {
      control: "boolean",
      description: "활성화 상태",
    },
  },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "알림 받기",
  },
};

export const Checked: Story = {
  args: {
    label: "활성화됨",
    checked: true,
    onChange: () => {},
  },
};

export const CustomColor: Story = {
  args: {
    label: "커스텀 색상",
    color: "#10b981",
    checked: true,
    onChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    label: "비활성화",
    disabled: true,
  },
};
