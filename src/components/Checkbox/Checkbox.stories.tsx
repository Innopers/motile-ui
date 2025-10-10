import type { Meta, StoryObj } from "@storybook/react";
import { Checkbox } from "./Checkbox";

const meta = {
  title: "Components/Checkbox",
  component: Checkbox,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "rounded", "square"],
      description: "체크박스 스타일 variant",
    },
    filled: {
      control: "boolean",
      description: "체크 아이콘을 항상 표시",
    },
    label: {
      control: "text",
      description: "체크박스 옆 라벨",
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
      description: "체크 상태",
    },
  },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "동의합니다",
  },
};

export const Checked: Story = {
  args: {
    label: "선택됨",
    checked: true,
    onChange: () => {},
  },
};

export const Rounded: Story = {
  args: {
    variant: "rounded",
    label: "원형 체크박스",
    checked: true,
    onChange: () => {},
  },
};

export const Filled: Story = {
  args: {
    filled: true,
    label: "Filled 체크박스",
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
