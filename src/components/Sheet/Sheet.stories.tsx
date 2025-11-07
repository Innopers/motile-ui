import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Sheet } from "./Sheet";
import { Button } from "../Button/Button";
import "./Sheet.css";

const meta = {
  title: "Components/Sheet",
  component: Sheet.Root,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "Sheet 컴포넌트는 화면 왼쪽 또는 오른쪽에서 슬라이드되는 사이드 패널입니다. 설정, 필터, 네비게이션 등의 용도로 사용됩니다.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    position: {
      control: "radio",
      options: ["left", "right"],
      description: "Sheet 나타나는 위치",
      table: {
        defaultValue: { summary: "right" },
      },
    },
    maxWidth: {
      control: "text",
      description: "Sheet 최대 너비 (데스크톱 전용)",
      table: {
        defaultValue: { summary: "600px" },
      },
    },
    closeOnBackdrop: {
      control: "boolean",
      description: "백드롭 클릭 또는 ESC 키로 닫기 제어",
      table: {
        defaultValue: { summary: "true" },
      },
    },
    zIndex: {
      control: "number",
      description: "z-index 값",
      table: {
        defaultValue: { summary: "1000" },
      },
    },
  },
} satisfies Meta<typeof Sheet.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default Sheet
export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <Sheet.Root {...args} open={open} onOpenChange={setOpen}>
        <Sheet.Trigger asChild>
          <Button>Sheet 열기</Button>
        </Sheet.Trigger>
        <Sheet.Portal>
          <Sheet.Overlay />
          <Sheet.Content>
            <Sheet.Header>
              <Sheet.Title>Sheet 제목</Sheet.Title>
              <Sheet.Close asChild>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  ×
                </button>
              </Sheet.Close>
            </Sheet.Header>
            <Sheet.Body>
              <div style={{ padding: "0 4px" }}>
                <h3 style={{ marginTop: 0 }}>Sheet 컴포넌트</h3>
                <p>Controls 패널에서 다양한 props를 조정해보세요.</p>
                <ul>
                  <li>position: left/right 변경</li>
                  <li>maxWidth: 최대 너비 조정</li>
                  <li>closeOnBackdrop: 닫기 옵션 제어</li>
                </ul>
              </div>
            </Sheet.Body>
          </Sheet.Content>
        </Sheet.Portal>
      </Sheet.Root>
    );
  },
  args: {
    position: "right",
    maxWidth: "600px",
    closeOnBackdrop: true,
    zIndex: 1000,
    children: <></>,
  },
};

// Left Sheet
export const Left: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <Sheet.Root {...args} open={open} onOpenChange={setOpen}>
        <Sheet.Trigger asChild>
          <Button variant="secondary">왼쪽 Sheet 열기</Button>
        </Sheet.Trigger>
        <Sheet.Portal>
          <Sheet.Overlay />
          <Sheet.Content>
            <Sheet.Header>
              <Sheet.Title>왼쪽 Sheet</Sheet.Title>
              <Sheet.Close asChild>
                <button
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    padding: "4px",
                  }}
                >
                  ×
                </button>
              </Sheet.Close>
            </Sheet.Header>
            <Sheet.Body>
              <div style={{ padding: "0 4px" }}>
                <h3 style={{ marginTop: 0 }}>왼쪽에서 나타나는 Sheet</h3>
                <p>position="left"로 설정된 Sheet입니다.</p>
                <p>오버레이를 클릭하거나 ESC 키를 눌러 닫을 수 있습니다.</p>
              </div>
            </Sheet.Body>
          </Sheet.Content>
        </Sheet.Portal>
      </Sheet.Root>
    );
  },
  args: {
    position: "left",
    children: <></>,
  },
};
