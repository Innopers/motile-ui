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
    variant: {
      control: "select",
      options: ["default", "elastic"],
      description: "스위치 모양",
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
  args: {},
};

export const Checked: Story = {
  args: {
    checked: true,
    onChange: () => {},
  },
};

export const Elastic: Story = {
  args: {
    variant: "elastic",
    checked: true,
    onChange: () => {},
  },
};

export const CustomColor: Story = {
  args: {
    color: "#10b981",
    checked: true,
    onChange: () => {},
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};
