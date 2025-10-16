import type { Meta, StoryObj } from "@storybook/react";
import { Popover } from "./Popover";
import { Button } from "../Button";
import type { PopoverRootProps } from "./Popover";

const meta = {
  title: "Components/Popover",
  component: Popover.Root,
  parameters: {
    layout: "padded",
  },
  decorators: [
    (Story) => (
      <div
        style={{
          minHeight: "400px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Story />
      </div>
    ),
  ],
  tags: ["autodocs"],
  argTypes: {
    position: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
      description: "Popover 위치",
    },
    align: {
      control: "select",
      options: ["start", "center", "end"],
      description: "Popover 정렬",
    },
    variant: {
      control: "select",
      options: ["default", "outlined"],
      description: "Popover 스타일 변형",
    },
    showArrow: {
      control: "boolean",
      description: "화살표 표시 여부",
    },
    autoClose: {
      control: "boolean",
      description: "ESC/외부 클릭 시 자동으로 닫기",
    },
    color: {
      control: "color",
      description: "커스텀 색상",
    },
    zIndex: {
      control: "number",
      description: "z-index 값",
    },
  },
} satisfies Meta<typeof Popover.Root>;

export default meta;
type Story = StoryObj<PopoverRootProps>;

export const Default: Story = {
  args: {
    position: "bottom",
    align: "center",
    showArrow: false,
    variant: "default",
    autoClose: true,
  },
  render: (args) => (
    <Popover.Root {...args}>
      <Popover.Trigger asChild>
        <Button>Click to open</Button>
      </Popover.Trigger>
      <Popover.Content>
        <div>
          <h3
            style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600 }}
          >
            Popover Title
          </h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
            Controls 패널에서 position, align, showArrow, variant 등을
            조절해보세요!
          </p>
        </div>
      </Popover.Content>
    </Popover.Root>
  ),
};

export const WithArrow: Story = {
  args: {
    position: "top",
    align: "start",
    showArrow: true,
    variant: "outlined",
    autoClose: true,
  },
  render: (args) => (
    <Popover.Root {...args}>
      <Popover.Trigger asChild>
        <Button>With Arrow</Button>
      </Popover.Trigger>
      <Popover.Content>
        <div style={{ width: "240px" }}>
          <h3
            style={{ margin: "0 0 8px 0", fontSize: "16px", fontWeight: 600 }}
          >
            Popover with Arrow
          </h3>
          <p style={{ margin: 0, fontSize: "14px", color: "#666" }}>
            화살표가 트리거 버튼을 가리킵니다.
          </p>
        </div>
      </Popover.Content>
    </Popover.Root>
  ),
};

export const CustomColor: Story = {
  args: {
    position: "bottom",
    align: "center",
    showArrow: true,
    variant: "default",
    autoClose: true,
    color: "#10b981",
  },
  render: (args) => (
    <Popover.Root {...args}>
      <Popover.Trigger asChild>
        <Button variant="secondary" color={args.color}>
          Custom Color
        </Button>
      </Popover.Trigger>
      <Popover.Content>
        <div>Controls 패널에서 color를 변경해보세요!</div>
      </Popover.Content>
    </Popover.Root>
  ),
};
