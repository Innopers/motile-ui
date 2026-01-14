import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Select } from "./Select";

// Storybook으로 제어할 수 있는 Props
interface SelectStoryArgs {
  disabled?: boolean;
  zIndex?: number;
  hideCheckIcon?: boolean;
  maxWidth?: string | number;
  closeOnBackdrop?: boolean;
  color?: string;
}

const meta = {
  title: "Components/Select",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Select 비활성화 여부",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    zIndex: {
      control: "number",
      description: "z-index 값",
      table: {
        defaultValue: { summary: "40" },
      },
    },
    hideCheckIcon: {
      control: "boolean",
      description: "체크 아이콘 숨김 여부",
      table: {
        defaultValue: { summary: "false" },
      },
    },
    maxWidth: {
      control: "text",
      description: "모바일 breakpoint (px 또는 CSS 값)",
      table: {
        defaultValue: { summary: "768" },
      },
    },
    closeOnBackdrop: {
      control: "boolean",
      description: "외부 클릭/ESC 키로 닫기 허용",
      table: {
        defaultValue: { summary: "true" },
      },
    },
    color: {
      control: "color",
      description: "커스텀 색상",
      table: {
        defaultValue: { summary: "undefined" },
      },
    },
  },
} satisfies Meta<SelectStoryArgs>;

export default meta;
type Story = StoryObj<SelectStoryArgs>;

/**
 * 기본 Select 컴포넌트
 */
export const Default: Story = {
  args: {
    disabled: false,
    zIndex: 40,
    hideCheckIcon: false,
    maxWidth: 768,
    closeOnBackdrop: true,
    color: undefined,
  },
  render: ({
    disabled,
    zIndex,
    hideCheckIcon,
    maxWidth,
    closeOnBackdrop,
    color,
  }) => (
    <div style={{ width: "300px", minHeight: "400px" }}>
      <Select.Root
        defaultValue="banana"
        disabled={disabled}
        zIndex={zIndex}
        hideCheckIcon={hideCheckIcon}
        maxWidth={maxWidth}
        closeOnBackdrop={closeOnBackdrop}
        color={color}
      >
        <Select.Trigger>
          <Select.Value placeholder="과일을 선택하세요" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="apple">사과</Select.Item>
          <Select.Item value="banana">바나나</Select.Item>
          <Select.Item value="orange">오렌지</Select.Item>
          <Select.Item value="grape">포도</Select.Item>
          <Select.Item value="melon">멜론</Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
  ),
};

/**
 * Controlled 컴포넌트
 */
export const Controlled: Story = {
  args: {
    disabled: false,
    zIndex: 40,
    hideCheckIcon: false,
    maxWidth: 768,
    closeOnBackdrop: true,
    color: undefined,
  },
  render: ({
    disabled,
    zIndex,
    hideCheckIcon,
    maxWidth,
    closeOnBackdrop,
    color,
  }) => {
    const [value, setValue] = useState<string | undefined>("apple");

    const handleValueChange = (newValue: string | number) => {
      if (typeof newValue === "string") {
        setValue(newValue);
      }
    };

    return (
      <div style={{ width: "300px", minHeight: "400px" }}>
        <Select.Root
          value={value}
          onValueChange={handleValueChange}
          disabled={disabled}
          zIndex={zIndex}
          hideCheckIcon={hideCheckIcon}
          maxWidth={maxWidth}
          closeOnBackdrop={closeOnBackdrop}
          color={color}
        >
          <Select.Trigger>
            <Select.Value placeholder="과일을 선택하세요" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
            <Select.Item value="banana">바나나</Select.Item>
            <Select.Item value="orange">오렌지</Select.Item>
          </Select.Content>
        </Select.Root>

        <div style={{ marginTop: "16px", fontSize: "14px", color: "#6b7280" }}>
          선택된 값: {value || "(없음)"}
        </div>

        <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
          <button
            onClick={() => setValue("banana")}
            style={{ fontSize: "12px", padding: "4px 8px" }}
          >
            바나나로 변경
          </button>
          <button
            onClick={() => setValue(undefined)}
            style={{ fontSize: "12px", padding: "4px 8px" }}
          >
            초기화
          </button>
        </div>
      </div>
    );
  },
};

/**
 * 비활성화 상태
 */
export const Disabled: Story = {
  args: {
    disabled: false,
    zIndex: 40,
    hideCheckIcon: false,
    maxWidth: 768,
    closeOnBackdrop: true,
    color: undefined,
  },
  render: () => (
    <div
      style={{
        width: "300px",
        minHeight: "400px",
        display: "flex",
        flexDirection: "column",
        gap: "16px",
      }}
    >
      <Select.Root disabled>
        <Select.Trigger>
          <Select.Value placeholder="전체 비활성화" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="apple">사과</Select.Item>
          <Select.Item value="banana">바나나</Select.Item>
        </Select.Content>
      </Select.Root>

      <Select.Root>
        <Select.Trigger>
          <Select.Value placeholder="일부 옵션 비활성화" />
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="apple">사과</Select.Item>
          <Select.Item value="banana" disabled>
            바나나 (품절)
          </Select.Item>
          <Select.Item value="orange">오렌지</Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
  ),
};

/**
 * 외부에서 open 제어
 */
export const ControlledOpen: Story = {
  args: {
    disabled: false,
    zIndex: 40,
    hideCheckIcon: false,
    maxWidth: 768,
    closeOnBackdrop: true,
    color: undefined,
  },
  render: ({
    disabled,
    zIndex,
    hideCheckIcon,
    maxWidth,
    closeOnBackdrop,
    color,
  }) => {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState<string | undefined>("apple");

    const handleValueChange = (newValue: string | number) => {
      if (typeof newValue === "string") {
        setValue(newValue);
      }
    };

    return (
      <div style={{ width: "300px", minHeight: "400px" }}>
        <Select.Root
          open={open}
          onOpenChange={setOpen}
          value={value}
          onValueChange={handleValueChange}
          disabled={disabled}
          zIndex={zIndex}
          hideCheckIcon={hideCheckIcon}
          maxWidth={maxWidth}
          closeOnBackdrop={closeOnBackdrop}
          color={color}
        >
          <Select.Trigger>
            <Select.Value placeholder="과일을 선택하세요" />
          </Select.Trigger>
          <Select.Content>
            <Select.Item value="apple">사과</Select.Item>
            <Select.Item value="banana">바나나</Select.Item>
            <Select.Item value="orange">오렌지</Select.Item>
          </Select.Content>
        </Select.Root>

        <div style={{ marginTop: "16px", fontSize: "14px", color: "#6b7280" }}>
          상태: {open ? "열림" : "닫힘"} | 선택된 값: {value || "(없음)"}
        </div>

        <div style={{ marginTop: "8px", display: "flex", gap: "8px" }}>
          <button
            onClick={() => setOpen(!open)}
            style={{ fontSize: "12px", padding: "4px 8px" }}
          >
            {open ? "닫기" : "열기"}
          </button>
          <button
            onClick={() => setValue(undefined)}
            style={{ fontSize: "12px", padding: "4px 8px" }}
          >
            값 초기화
          </button>
        </div>
      </div>
    );
  },
};

/**
 * 객체 데이터 패턴 (selected + onClick)
 */
export const ObjectData: Story = {
  args: {
    disabled: false,
    zIndex: 40,
    hideCheckIcon: false,
    maxWidth: 768,
    closeOnBackdrop: true,
    color: undefined,
  },
  render: ({
    disabled,
    zIndex,
    hideCheckIcon,
    maxWidth,
    closeOnBackdrop,
    color,
  }) => {
    interface User {
      id: number;
      name: string;
      email: string;
      avatar: string;
    }

    const users: User[] = [
      { id: 1, name: "Alice", email: "alice@example.com", avatar: "👩" },
      { id: 2, name: "Bob", email: "bob@example.com", avatar: "👨" },
      { id: 3, name: "Charlie", email: "charlie@example.com", avatar: "🧑" },
    ];

    const [selectedUser, setSelectedUser] = useState<User | null>(null);

    return (
      <div style={{ width: "300px", minHeight: "400px" }}>
        <Select.Root
          disabled={disabled}
          zIndex={zIndex}
          hideCheckIcon={hideCheckIcon}
          maxWidth={maxWidth}
          closeOnBackdrop={closeOnBackdrop}
          color={color}
        >
          <Select.Trigger>
            {selectedUser ? (
              <div
                style={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <span>{selectedUser.avatar}</span>
                <span>{selectedUser.name}</span>
              </div>
            ) : (
              <Select.Value placeholder="사용자 선택" />
            )}
          </Select.Trigger>
          <Select.Content>
            {users.map((user) => (
              <Select.Item
                key={user.id}
                selected={selectedUser?.id === user.id}
                onClick={() => setSelectedUser(user)}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <span>{user.avatar}</span>
                  <span>{user.name}</span>
                </div>
              </Select.Item>
            ))}
          </Select.Content>
        </Select.Root>

        {selectedUser && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px",
              background: "#f3f4f6",
              borderRadius: "8px",
              fontSize: "14px",
            }}
          >
            <div>이름: {selectedUser.name}</div>
            <div>이메일: {selectedUser.email}</div>
          </div>
        )}
      </div>
    );
  },
};
