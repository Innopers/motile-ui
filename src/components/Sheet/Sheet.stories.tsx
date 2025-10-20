import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Sheet } from "./Sheet";
import "./Sheet.css";

const meta = {
  title: "Components/Sheet",
  component: Sheet,
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
    title: {
      control: "text",
      description: "Sheet 제목",
    },
    showHeader: {
      control: "boolean",
      description: "Header 표시 여부",
      table: {
        defaultValue: { summary: "true" },
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
      control: "object",
      description: "백드롭 클릭 또는 ESC 키로 닫기 제어",
      table: {
        defaultValue: { summary: "true" },
      },
    },
    closeOnHistoryBack: {
      control: "boolean",
      description:
        "브라우저 히스토리 뒤로가기로 닫기 제어 (모바일 스와이프, 데스크톱 뒤로가기 버튼)",
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
} satisfies Meta<typeof Sheet>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default Sheet
export const Default: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: "12px 24px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Sheet 열기
        </button>

        <Sheet {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div style={{ padding: "0 4px" }}>
            <h3 style={{ marginTop: 0 }}>Sheet 컴포넌트</h3>
            <p>Controls 패널에서 다양한 props를 조정해보세요.</p>
            <ul>
              <li>position: left/right 변경</li>
              <li>title: 제목 수정</li>
              <li>maxWidth: 최대 너비 조정</li>
              <li>showHeader: 헤더 표시/숨김</li>
              <li>closeOnBackdrop: 닫기 옵션 제어</li>
            </ul>
          </div>
        </Sheet>
      </div>
    );
  },
  args: {
    isOpen: false,
    onClose: () => {},
    children: <></>,
    title: "Sheet 제목",
    position: "right",
    showHeader: true,
    maxWidth: "600px",
    closeOnBackdrop: true,
    closeOnHistoryBack: true,
    zIndex: 1000,
  },
};

// Left Sheet
export const Left: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: "12px 24px",
            backgroundColor: "#ec4899",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          왼쪽 Sheet 열기
        </button>

        <Sheet {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div style={{ padding: "0 4px" }}>
            <h3 style={{ marginTop: 0 }}>왼쪽에서 나타나는 Sheet</h3>
            <p>position="left"로 설정된 Sheet입니다.</p>
            <p>오버레이를 클릭하거나 ESC 키를 눌러 닫을 수 있습니다.</p>
          </div>
        </Sheet>
      </div>
    );
  },
  args: {
    isOpen: false,
    onClose: () => {},
    children: <></>,
    title: "왼쪽 Sheet",
    position: "left",
  },
};
