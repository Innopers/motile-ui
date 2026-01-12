import type { Meta, StoryObj } from "@storybook/react";

import { Tab } from "./Tab";

// Props that can be controlled via Storybook
interface TabStoryArgs {
  variant?: "underline" | "pill";
  orientation?: "horizontal" | "vertical";
  activationMode?: "automatic" | "manual";
  disabled?: boolean;
  defaultValue?: string;
  color?: string;
}

const meta = {
  title: "Components/Tab",
  parameters: {
    layout: "centered",
    backgrounds: {
      default: "white",
      values: [
        { name: "white", value: "#ffffff" },
        { name: "gray", value: "#f6f9fc" },
      ],
    },
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["underline", "pill"],
      description: "Tab 스타일 variant",
      table: {
        defaultValue: { summary: '"underline"' },
        type: { summary: '"underline" | "pill"' },
      },
    },
    orientation: {
      control: "select",
      options: ["horizontal", "vertical"],
      description: "Tab 방향",
      table: {
        defaultValue: { summary: '"horizontal"' },
        type: { summary: '"horizontal" | "vertical"' },
      },
    },
    activationMode: {
      control: "select",
      options: ["automatic", "manual"],
      description: "Tab 활성화 모드",
      table: {
        defaultValue: { summary: '"automatic"' },
        type: { summary: '"automatic" | "manual"' },
      },
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
      },
    },
    color: {
      control: "color",
      description: "커스텀 색상",
      table: {
        type: { summary: "string" },
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "600px", maxWidth: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<TabStoryArgs>;

export default meta;
type Story = StoryObj<TabStoryArgs>;

/**
 * 기본 Tab 컴포넌트입니다.
 * 상단의 Tab.Trigger를 클릭하면 하단의 Tab.Content가 전환됩니다.
 */
export const Default: Story = {
  args: {
    variant: "underline",
    orientation: "horizontal",
    activationMode: "automatic",
    disabled: false,
    defaultValue: "account",
  },
  render: ({
    variant,
    orientation,
    activationMode,
    disabled,
    defaultValue,
    color,
  }) => (
    <Tab
      defaultValue={defaultValue}
      variant={variant}
      orientation={orientation}
      activationMode={activationMode}
      disabled={disabled}
      color={color}
    >
      <Tab.List>
        <Tab.Trigger value="account">계정</Tab.Trigger>
        <Tab.Trigger value="password">비밀번호</Tab.Trigger>
        <Tab.Trigger value="notifications">알림</Tab.Trigger>
      </Tab.List>

      <Tab.Content value="account">
        <div style={{ padding: "0 4px" }}>
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            계정 설정
          </h3>
          <p style={{ margin: "0", color: "#6b7280", lineHeight: "1.6" }}>
            이메일 주소, 프로필 정보, 계정 삭제 등 계정과 관련된 설정을 관리할
            수 있습니다.
          </p>
        </div>
      </Tab.Content>

      <Tab.Content value="password">
        <div style={{ padding: "0 4px" }}>
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            비밀번호 변경
          </h3>
          <p style={{ margin: "0", color: "#6b7280", lineHeight: "1.6" }}>
            안전한 비밀번호로 정기적으로 변경하여 계정 보안을 강화하세요.
          </p>
        </div>
      </Tab.Content>

      <Tab.Content value="notifications">
        <div style={{ padding: "0 4px" }}>
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            알림 설정
          </h3>
          <p style={{ margin: "0", color: "#6b7280", lineHeight: "1.6" }}>
            이메일 알림, 푸시 알림 등 원하는 알림 방식을 선택할 수 있습니다.
          </p>
        </div>
      </Tab.Content>
    </Tab>
  ),
};

/**
 * Pill variant는 활성 탭이 둥근 배경색으로 표시됩니다.
 */
export const Pill: Story = {
  args: {
    defaultValue: "home",
    variant: "pill",
  },
  render: ({ defaultValue, variant, orientation, activationMode, color }) => (
    <Tab
      defaultValue={defaultValue}
      variant={variant}
      orientation={orientation}
      activationMode={activationMode}
      color={color}
    >
      <Tab.List>
        <Tab.Trigger value="home">홈</Tab.Trigger>
        <Tab.Trigger value="explore">탐색</Tab.Trigger>
        <Tab.Trigger value="library">보관함</Tab.Trigger>
      </Tab.List>

      <Tab.Content value="home">
        <p style={{ margin: 0, color: "#6b7280" }}>홈 페이지 내용입니다.</p>
      </Tab.Content>
      <Tab.Content value="explore">
        <p style={{ margin: 0, color: "#6b7280" }}>탐색 페이지 내용입니다.</p>
      </Tab.Content>
      <Tab.Content value="library">
        <p style={{ margin: 0, color: "#6b7280" }}>보관함 페이지 내용입니다.</p>
      </Tab.Content>
    </Tab>
  ),
};

/**
 * Vertical orientation에서는 탭이 세로로 배치됩니다.
 */
export const Vertical: Story = {
  args: {
    defaultValue: "profile",
    orientation: "vertical",
  },
  render: ({ defaultValue, variant, orientation, activationMode, color }) => (
    <Tab
      defaultValue={defaultValue}
      variant={variant}
      orientation={orientation}
      activationMode={activationMode}
      color={color}
    >
      <Tab.List>
        <Tab.Trigger value="profile">프로필</Tab.Trigger>
        <Tab.Trigger value="security">보안</Tab.Trigger>
        <Tab.Trigger value="notifications">알림</Tab.Trigger>
      </Tab.List>

      <Tab.Content value="profile">
        <div style={{ padding: "0 4px" }}>
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            프로필 설정
          </h3>
          <p style={{ margin: "0", color: "#6b7280", lineHeight: "1.6" }}>
            사용자 프로필 정보를 관리할 수 있습니다.
          </p>
        </div>
      </Tab.Content>
      <Tab.Content value="security">
        <div style={{ padding: "0 4px" }}>
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            보안 설정
          </h3>
          <p style={{ margin: "0", color: "#6b7280", lineHeight: "1.6" }}>
            비밀번호 변경 및 2단계 인증 설정을 할 수 있습니다.
          </p>
        </div>
      </Tab.Content>
      <Tab.Content value="notifications">
        <div style={{ padding: "0 4px" }}>
          <h3
            style={{
              margin: "0 0 12px 0",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            알림 설정
          </h3>
          <p style={{ margin: "0", color: "#6b7280", lineHeight: "1.6" }}>
            이메일 알림 및 푸시 알림 설정을 관리할 수 있습니다.
          </p>
        </div>
      </Tab.Content>
    </Tab>
  ),
};

/**
 * 개별 Tab.Trigger의 disabled prop으로 특정 탭만 비활성화할 수 있습니다.
 */
export const IndividualDisabled: Story = {
  args: {
    defaultValue: "enabled1",
  },
  render: ({
    defaultValue,
    variant,
    orientation,
    activationMode,
    disabled,
    color,
  }) => (
    <Tab
      defaultValue={defaultValue}
      variant={variant}
      orientation={orientation}
      activationMode={activationMode}
      disabled={disabled}
      color={color}
    >
      <Tab.List>
        <Tab.Trigger value="enabled1">활성화</Tab.Trigger>
        <Tab.Trigger value="disabled" disabled>
          비활성화
        </Tab.Trigger>
        <Tab.Trigger value="enabled2">활성화</Tab.Trigger>
      </Tab.List>

      <Tab.Content value="enabled1">
        <p style={{ margin: 0, color: "#6b7280" }}>첫 번째 활성화된 탭</p>
      </Tab.Content>
      <Tab.Content value="disabled">
        <p style={{ margin: 0, color: "#6b7280" }}>비활성화된 탭 (접근 불가)</p>
      </Tab.Content>
      <Tab.Content value="enabled2">
        <p style={{ margin: 0, color: "#6b7280" }}>두 번째 활성화된 탭</p>
      </Tab.Content>
    </Tab>
  ),
};

/**
 * Manual activation mode에서는 화살표 키로 포커스만 이동하고,
 * Enter 또는 Space 키로 탭을 활성화합니다.
 */
export const ManualActivation: Story = {
  args: {
    activationMode: "manual",
    defaultValue: "tab1",
    variant: "pill",
  },
  render: ({ activationMode, defaultValue, variant, orientation, color }) => (
    <div>
      <p style={{ marginBottom: "16px", fontSize: "14px", color: "#6b7280" }}>
        화살표 키로 포커스를 이동한 후, Enter 또는 Space 키를 눌러 탭을
        활성화하세요.
      </p>
      <Tab
        defaultValue={defaultValue}
        variant={variant}
        orientation={orientation}
        activationMode={activationMode}
        color={color}
      >
        <Tab.List>
          <Tab.Trigger value="tab1">Tab 1</Tab.Trigger>
          <Tab.Trigger value="tab2">Tab 2</Tab.Trigger>
          <Tab.Trigger value="tab3">Tab 3</Tab.Trigger>
        </Tab.List>

        <Tab.Content value="tab1">
          <p style={{ margin: 0, color: "#6b7280" }}>Content 1</p>
        </Tab.Content>
        <Tab.Content value="tab2">
          <p style={{ margin: 0, color: "#6b7280" }}>Content 2</p>
        </Tab.Content>
        <Tab.Content value="tab3">
          <p style={{ margin: 0, color: "#6b7280" }}>Content 3</p>
        </Tab.Content>
      </Tab>
    </div>
  ),
};

/**
 * 많은 탭이 있을 때 가로 스크롤로 탐색할 수 있습니다.
 * 모바일에서 드래그로 스크롤 가능하며, 활성 탭이 자동으로 중앙에 위치합니다.
 */
export const ManyTabsScroll: Story = {
  args: {
    defaultValue: "tab7",
    variant: "pill",
  },
  render: ({
    defaultValue,
    variant,
    orientation,
    activationMode,
    disabled,
    color,
  }) => (
    <Tab
      defaultValue={defaultValue}
      variant={variant}
      orientation={orientation}
      activationMode={activationMode}
      disabled={disabled}
      color={color}
    >
      <Tab.List>
        {Array.from({ length: 15 }, (_, i) => (
          <Tab.Trigger key={i} value={`tab${i + 1}`}>
            Tab {i + 1}
          </Tab.Trigger>
        ))}
      </Tab.List>

      {Array.from({ length: 15 }, (_, i) => (
        <Tab.Content key={i} value={`tab${i + 1}`}>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
            }}
          >
            <h4
              style={{
                margin: "0 0 12px 0",
                fontSize: "16px",
                fontWeight: "600",
              }}
            >
              Tab {i + 1} 내용
            </h4>
            <p style={{ margin: 0, color: "#6b7280", lineHeight: "1.6" }}>
              {i + 1}번째 탭의 콘텐츠입니다. 많은 탭이 있을 때 드래그로
              스크롤하여 원하는 탭을 찾을 수 있습니다.
            </p>
          </div>
        </Tab.Content>
      ))}
    </Tab>
  ),
};
