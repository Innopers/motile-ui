import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../Button/Button";
import { Sheet } from "./Sheet";

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
              <Sheet.Close />
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
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Body>
              <div style={{ padding: "0 4px" }}>
                <h3 style={{ marginTop: 0 }}>왼쪽에서 나타나는 Sheet</h3>
                <p>position=&quot;left&quot;로 설정된 Sheet입니다.</p>
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

// Custom Close Button (asChild 패턴)
export const CustomCloseButton: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <Sheet.Root {...args} open={open} onOpenChange={setOpen}>
        <Sheet.Trigger asChild>
          <Button>커스텀 닫기 버튼</Button>
        </Sheet.Trigger>
        <Sheet.Portal>
          <Sheet.Overlay />
          <Sheet.Content>
            <Sheet.Header>
              <Sheet.Title>커스텀 닫기 버튼 예제</Sheet.Title>
              <Sheet.Close asChild>
                <button
                  style={{
                    padding: "8px 16px",
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "14px",
                    fontWeight: "500",
                  }}
                >
                  닫기
                </button>
              </Sheet.Close>
            </Sheet.Header>
            <Sheet.Body>
              <div style={{ padding: "0 4px" }}>
                <h3 style={{ marginTop: 0 }}>asChild 패턴</h3>
                <p>
                  Sheet.Close에 asChild prop을 사용하면 커스텀 버튼을 사용할 수
                  있습니다.
                </p>
                <p>이 예제에서는 빨간색 버튼을 사용했습니다.</p>
              </div>
            </Sheet.Body>
          </Sheet.Content>
        </Sheet.Portal>
      </Sheet.Root>
    );
  },
  args: {
    position: "right",
    children: <></>,
  },
};

// Title Only (Close 버튼 없음)
export const TitleOnly: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <Sheet.Root {...args} open={open} onOpenChange={setOpen}>
        <Sheet.Trigger asChild>
          <Button variant="ghost">Title만 있는 Sheet</Button>
        </Sheet.Trigger>
        <Sheet.Portal>
          <Sheet.Overlay />
          <Sheet.Content>
            <Sheet.Header>
              <Sheet.Title>제목만 있는 헤더</Sheet.Title>
            </Sheet.Header>
            <Sheet.Body>
              <div style={{ padding: "0 4px" }}>
                <p>
                  Close 버튼 없이 Title만 표시할 수 있습니다.
                  <br />
                  (오버레이 클릭으로 닫기 가능)
                </p>
              </div>
            </Sheet.Body>
          </Sheet.Content>
        </Sheet.Portal>
      </Sheet.Root>
    );
  },
  args: {
    position: "right",
    children: <></>,
  },
};

// Long Title Test (긴 제목 ellipsis 테스트)
export const LongTitle: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);

    return (
      <Sheet.Root {...args} open={open} onOpenChange={setOpen}>
        <Sheet.Trigger asChild>
          <Button variant="secondary">긴 제목 테스트</Button>
        </Sheet.Trigger>
        <Sheet.Portal>
          <Sheet.Overlay />
          <Sheet.Content>
            <Sheet.Header>
              <Sheet.Title>
                아주 긴 제목입니다 이렇게 길면 어떻게 되는지 확인해봅시다
                텍스트가 넘칠 때 ellipsis 처리가 되는지 테스트
              </Sheet.Title>
              <Sheet.Close />
            </Sheet.Header>
            <Sheet.Body>
              <div style={{ padding: "0 4px" }}>
                <h3 style={{ marginTop: 0 }}>긴 제목 테스트</h3>
                <p>제목이 너무 길면 `text-overflow: ellipsis`로 처리됩니다.</p>
                <p>Close 버튼은 항상 오른쪽에 고정됩니다.</p>
              </div>
            </Sheet.Body>
          </Sheet.Content>
        </Sheet.Portal>
      </Sheet.Root>
    );
  },
  args: {
    position: "right",
    children: <></>,
  },
};
