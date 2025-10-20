import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Drawer } from "./Drawer";

const meta = {
  title: "Components/Drawer",
  component: Drawer,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "모바일에서 아래에서 위로 올라오는 Drawer 컴포넌트. 드래그, 오버레이 클릭, ESC 키로 닫기 가능.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    isOpen: {
      control: "boolean",
      description: "Drawer 열림/닫힘 상태",
    },
    title: {
      control: "text",
      description: "Drawer 제목",
    },
    closeOnBackdrop: {
      control: "boolean",
      description: "백드롭 인터랙션으로 닫기 허용 (오버레이 클릭, ESC 키)",
    },
    closeOnDrag: {
      control: "boolean",
      description: "드래그로 닫기 허용",
    },
  },
} satisfies Meta<typeof Drawer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          Drawer 열기
        </button>

        <Drawer {...args} isOpen={isOpen} onClose={() => setIsOpen(false)}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "14px",
                color: "#6b7280",
                lineHeight: "1.6",
              }}
            >
              오버레이 클릭, ESC 키, 핸들 드래그로 닫을 수 있습니다.
            </p>
            <div
              style={{
                padding: "12px",
                backgroundColor: "#f3f4f6",
                borderRadius: "8px",
                fontSize: "13px",
                color: "#374151",
                lineHeight: "1.5",
              }}
            >
              💡 Drawer 내부는 스크롤이 가능하며, 배경 스크롤은 자동으로
              차단됩니다.
            </div>
          </div>
        </Drawer>
      </div>
    );
  },
  args: {
    children: <></>,
  },
};

export const WithTitle: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#10b981",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          알림 설정
        </button>

        <Drawer
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="알림 설정"
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              <input
                type="checkbox"
                defaultChecked
                style={{ width: "18px", height: "18px" }}
              />
              <span style={{ fontSize: "14px", color: "#374151" }}>
                이메일 알림
              </span>
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              <input
                type="checkbox"
                defaultChecked
                style={{ width: "18px", height: "18px" }}
              />
              <span style={{ fontSize: "14px", color: "#374151" }}>
                푸시 알림
              </span>
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
            >
              <input
                type="checkbox"
                style={{ width: "18px", height: "18px" }}
              />
              <span style={{ fontSize: "14px", color: "#374151" }}>
                SMS 알림
              </span>
            </label>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                marginTop: "8px",
                padding: "10px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              저장
            </button>
          </div>
        </Drawer>
      </div>
    );
  },
  args: {
    children: <></>,
    title: "알림 설정",
  },
};

export const WithScroll: Story = {
  render: (args) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div>
        <button
          onClick={() => setIsOpen(true)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#8b5cf6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          이용 약관
        </button>

        <Drawer
          {...args}
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          title="이용 약관"
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            {Array.from({ length: 15 }, (_, i) => (
              <div
                key={i}
                style={{
                  padding: "16px",
                  backgroundColor: "#f9fafb",
                  borderRadius: "8px",
                  borderLeft: "3px solid #8b5cf6",
                }}
              >
                <h3
                  style={{
                    margin: "0 0 8px 0",
                    fontSize: "14px",
                    fontWeight: "600",
                    color: "#111827",
                  }}
                >
                  제{i + 1}조
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: "13px",
                    color: "#6b7280",
                    lineHeight: "1.6",
                  }}
                >
                  서비스 이용과 관련된 약관 내용입니다. 사용자는 본 약관에
                  동의함으로써 서비스를 이용할 수 있습니다.
                </p>
              </div>
            ))}
          </div>
        </Drawer>
      </div>
    );
  },
  args: {
    children: <></>,
    title: "이용 약관",
  },
};
