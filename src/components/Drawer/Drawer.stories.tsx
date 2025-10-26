import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";
import { Drawer } from "./Drawer";
import { Button } from "../Button";

const meta = {
  title: "Components/Drawer",
  component: Drawer.Root,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "모바일에서 아래에서 위로 올라오는 Drawer 컴포넌트. Compound Component 패턴으로 구성되어 있으며, 드래그, 오버레이 클릭, ESC 키로 닫기 가능.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    open: {
      control: "boolean",
      description: "Drawer 열림/닫힘 상태 (controlled)",
    },
    defaultOpen: {
      control: "boolean",
      description: "Drawer 기본 열림 상태 (uncontrolled)",
    },
    closeOnBackdrop: {
      control: "boolean",
      description: "백드롭 인터랙션으로 닫기 허용",
    },
    closeOnDrag: {
      control: "boolean",
      description: "드래그로 닫기 허용",
    },
    maxHeight: {
      control: "text",
      description: "Drawer 최대 높이",
    },
    width: {
      control: "text",
      description: "Drawer 너비 (데스크톱)",
    },
  },
} satisfies Meta<typeof Drawer.Root>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 Drawer 사용 예시입니다.
 * Trigger를 클릭하면 Drawer가 열립니다.
 */
export const Default: Story = {
  render: () => {
    return (
      <Drawer.Root>
        <Drawer.Trigger asChild>
          <Button variant="primary">Drawer 열기</Button>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay />
          <Drawer.Content>
            <Drawer.Handle />
            <Drawer.Title>기본 Drawer</Drawer.Title>

            <Drawer.Body>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
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
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  },
};

/**
 * Controlled 방식으로 상태를 직접 관리하는 예시입니다.
 * Close 버튼으로 명시적으로 닫을 수 있습니다.
 */
export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);

    return (
      <Drawer.Root open={open} onOpenChange={setOpen}>
        <Drawer.Trigger asChild>
          <Button variant="primary">알림 설정</Button>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay />
          <Drawer.Content>
            <Drawer.Handle />
            <Drawer.Title>알림 설정</Drawer.Title>

            <Drawer.Body>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
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

                <Drawer.Close asChild>
                  <Button variant="primary" style={{ marginTop: "8px" }}>
                    저장
                  </Button>
                </Drawer.Close>
              </div>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  },
};

/**
 * 긴 컨텐츠가 있는 경우 스크롤이 가능합니다.
 * 드래그는 Body가 최상단에 있을 때만 작동합니다.
 */
export const WithScroll: Story = {
  render: () => {
    return (
      <Drawer.Root>
        <Drawer.Trigger asChild>
          <Button variant="secondary">이용 약관</Button>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay />
          <Drawer.Content>
            <Drawer.Handle />
            <Drawer.Title>이용 약관</Drawer.Title>

            <Drawer.Body>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
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
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  },
};

/**
 * 드래그로 닫기를 비활성화한 예시입니다.
 * 오버레이 클릭이나 ESC 키로만 닫을 수 있습니다.
 */
export const NoDrag: Story = {
  render: () => {
    return (
      <Drawer.Root closeOnDrag={false}>
        <Drawer.Trigger asChild>
          <Button variant="secondary">드래그 비활성화</Button>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay />
          <Drawer.Content>
            <Drawer.Handle />
            <Drawer.Title>드래그 비활성화</Drawer.Title>

            <Drawer.Body>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>
                <p>이 Drawer는 드래그로 닫을 수 없습니다.</p>
                <p>오버레이 클릭이나 ESC 키로 닫아주세요.</p>
              </div>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  },
};

/**
 * ESC 키로만 닫을 수 있는 예시입니다.
 * 오버레이 클릭은 비활성화되어 있습니다.
 */
export const EscapeKeyOnly: Story = {
  render: () => {
    return (
      <Drawer.Root closeOnBackdrop={{ escapeKey: true, clickOutside: false }}>
        <Drawer.Trigger asChild>
          <Button variant="secondary">ESC 키만 가능</Button>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay />
          <Drawer.Content>
            <Drawer.Handle />
            <Drawer.Title>ESC 키로만 닫기</Drawer.Title>

            <Drawer.Body>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>
                <p>이 Drawer는 ESC 키로만 닫을 수 있습니다.</p>
                <p>오버레이 클릭으로는 닫히지 않습니다.</p>
              </div>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  },
};

/**
 * 백드롭 인터랙션을 모두 비활성화한 예시입니다.
 * Close 버튼으로만 닫을 수 있습니다.
 */
export const NoBackdrop: Story = {
  render: () => {
    return (
      <Drawer.Root closeOnBackdrop={false}>
        <Drawer.Trigger asChild>
          <Button variant="secondary">백드롭 비활성화</Button>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay />
          <Drawer.Content>
            <Drawer.Handle />
            <Drawer.Title>백드롭 비활성화</Drawer.Title>

            <Drawer.Body>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                  ESC 키, 오버레이 클릭, 드래그 모두 비활성화되어 있습니다.
                </p>
                <p style={{ fontSize: "14px", color: "#6b7280", margin: 0 }}>
                  아래 버튼으로만 닫을 수 있습니다.
                </p>
                <Drawer.Close asChild>
                  <Button variant="primary" style={{ marginTop: "8px" }}>
                    닫기
                  </Button>
                </Drawer.Close>
              </div>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  },
};

/**
 * 커스텀 높이를 지정한 예시입니다.
 * maxHeight를 90vh로 설정했습니다.
 */
export const CustomHeight: Story = {
  render: () => {
    return (
      <Drawer.Root maxHeight="90vh">
        <Drawer.Trigger asChild>
          <Button variant="primary">높은 Drawer</Button>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay />
          <Drawer.Content>
            <Drawer.Handle />
            <Drawer.Title>커스텀 높이 (90vh)</Drawer.Title>

            <Drawer.Body>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                {Array.from({ length: 20 }, (_, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "16px",
                      backgroundColor: "#f3f4f6",
                      borderRadius: "8px",
                      fontSize: "14px",
                      color: "#374151",
                    }}
                  >
                    컨텐츠 {i + 1}
                  </div>
                ))}
              </div>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  },
};

/**
 * Title을 asChild로 커스텀 스타일링한 예시입니다.
 */
export const CustomTitle: Story = {
  render: () => {
    return (
      <Drawer.Root>
        <Drawer.Trigger asChild>
          <Button variant="primary">커스텀 제목</Button>
        </Drawer.Trigger>

        <Drawer.Portal>
          <Drawer.Overlay />
          <Drawer.Content>
            <Drawer.Handle />
            <Drawer.Title asChild>
              <h2
                style={{
                  margin: 0,
                  padding: "20px 24px",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  fontSize: "18px",
                  fontWeight: "600",
                }}
              >
                🎨 그라디언트 제목
              </h2>
            </Drawer.Title>

            <Drawer.Body>
              <div style={{ fontSize: "14px", color: "#6b7280" }}>
                <p>
                  asChild를 사용하여 제목을 자유롭게 스타일링할 수 있습니다.
                </p>
              </div>
            </Drawer.Body>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    );
  },
};
