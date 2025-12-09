import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { TimePicker, TimeValue } from "./TimePicker";

const meta = {
  title: "Components/TimePicker",
  component: TimePicker.Root,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "휠 스크롤 방식으로 시간을 선택하는 컴포넌트입니다. Compound Component 패턴으로 구성되어 있으며, 12/24시간 형식과 다양한 분 단위 간격을 지원합니다.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    format: {
      control: "radio",
      options: ["12", "24"],
      description: "시간 형식: 12시간제 또는 24시간제",
      table: { defaultValue: { summary: '"12"' } },
    },
    minuteStep: {
      control: "select",
      options: [1, 5, 10, 15, 30],
      description: "분 단위 간격",
      table: { defaultValue: { summary: "5" } },
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
      table: { defaultValue: { summary: "false" } },
    },
  },
} satisfies Meta<typeof TimePicker.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

// 기본 TimePicker (12시간 형식)
export const Default: Story = {
  render: (args) => (
    <TimePicker.Root {...args}>
      <TimePicker.Column type="hour" />
      <TimePicker.Column type="minute" />
      <TimePicker.Column type="period" />
      <TimePicker.Highlight />
    </TimePicker.Root>
  ),
  args: {
    format: "12",
    minuteStep: 5,
    children: <></>,
  },
};

// 24시간 형식
export const Format24Hour: Story = {
  render: (args) => (
    <TimePicker.Root
      {...args}
      format="24"
      defaultValue={{ hour: 14, minute: 30 }}
      style={{ width: "140px" }}
    >
      <TimePicker.Column type="hour" />
      <TimePicker.Column type="minute" />
      <TimePicker.Highlight />
    </TimePicker.Root>
  ),
  args: {
    minuteStep: 5,
    children: <></>,
  },
};

// Controlled 상태 관리
export const Controlled: Story = {
  render: (args) => {
    const [time, setTime] = useState<TimeValue>({
      hour: 10,
      minute: 30,
      period: "AM",
    });

    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <TimePicker.Root {...args} value={time} onChange={setTime}>
          <TimePicker.Column type="hour" />
          <TimePicker.Column type="minute" />
          <TimePicker.Column type="period" />
          <TimePicker.Highlight />
        </TimePicker.Root>

        <div style={{ fontSize: "14px", color: "#6b7280" }}>
          선택된 시간: {time.hour}:{time.minute.toString().padStart(2, "0")}{" "}
          {time.period}
        </div>
      </div>
    );
  },
  args: {
    format: "12",
    minuteStep: 5,
    children: <></>,
  },
};

// 분 단위 간격 비교
export const MinuteSteps: Story = {
  render: () => (
    <div style={{ display: "flex", gap: "24px" }}>
      <div>
        <div
          style={{ marginBottom: "8px", fontSize: "14px", color: "#6b7280" }}
        >
          1분 단위
        </div>
        <TimePicker.Root minuteStep={1} format="24" style={{ width: "100px" }}>
          <TimePicker.Column type="hour" />
          <TimePicker.Column type="minute" />
          <TimePicker.Highlight />
        </TimePicker.Root>
      </div>

      <div>
        <div
          style={{ marginBottom: "8px", fontSize: "14px", color: "#6b7280" }}
        >
          15분 단위
        </div>
        <TimePicker.Root minuteStep={15} format="24" style={{ width: "100px" }}>
          <TimePicker.Column type="hour" />
          <TimePicker.Column type="minute" />
          <TimePicker.Highlight />
        </TimePicker.Root>
      </div>

      <div>
        <div
          style={{ marginBottom: "8px", fontSize: "14px", color: "#6b7280" }}
        >
          30분 단위
        </div>
        <TimePicker.Root minuteStep={30} format="24" style={{ width: "100px" }}>
          <TimePicker.Column type="hour" />
          <TimePicker.Column type="minute" />
          <TimePicker.Highlight />
        </TimePicker.Root>
      </div>
    </div>
  ),
  args: {
    children: <></>,
  },
};

// 비활성화 상태
export const Disabled: Story = {
  render: (args) => (
    <TimePicker.Root
      {...args}
      disabled
      defaultValue={{ hour: 9, minute: 30, period: "AM" }}
    >
      <TimePicker.Column type="hour" />
      <TimePicker.Column type="minute" />
      <TimePicker.Column type="period" />
      <TimePicker.Highlight />
    </TimePicker.Root>
  ),
  args: {
    format: "12",
    minuteStep: 5,
    children: <></>,
  },
};

// Highlight 없이 사용
export const WithoutHighlight: Story = {
  render: (args) => (
    <TimePicker.Root {...args}>
      <TimePicker.Column type="hour" />
      <TimePicker.Column type="minute" />
      <TimePicker.Column type="period" />
    </TimePicker.Root>
  ),
  args: {
    format: "12",
    minuteStep: 5,
    children: <></>,
  },
};
