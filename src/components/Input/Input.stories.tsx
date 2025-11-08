import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "./Input";

const meta = {
  title: "Components/Input",
  component: Input,
  parameters: {
    layout: "padded",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["outlined", "underline"],
      description: "Input 스타일 변형",
    },
    placeholder: {
      control: "text",
      description: "플레이스홀더 텍스트",
    },
    isError: {
      control: "boolean",
      description: "에러 상태",
    },
    disabled: {
      control: "boolean",
      description: "비활성화 상태",
    },
    autoFocus: {
      control: "boolean",
      description: "마운트 시 자동 포커스",
    },
    autoSelect: {
      control: "boolean",
      description: "포커스 시 텍스트 자동 선택 (autoFocus 필요)",
    },
    color: {
      control: "color",
      description:
        "테두리 및 포커스 색상 (우선순위: props > --motile-ui-input > --motile-theme > 기본값)",
    },
    maxLength: {
      control: "number",
      description: "최대 글자수 (설정 시 카운터 자동 표시)",
    },
    errorMessage: {
      control: "text",
      description: "에러 메시지 (자동으로 isError를 true로 설정)",
    },
    label: {
      control: "text",
      description:
        "플로팅 라벨 (placeholder 위치에서 포커스/값 입력 시 위로 이동)",
    },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

// ============================================
// Core States - 기본 상태 테스트
// ============================================

export const Default: Story = {
  args: {
    placeholder: "내용을 입력하세요",
  },
};

export const WithLabel: Story = {
  args: {
    label: "이메일",
    placeholder: "example@email.com",
  },
};

export const WithValue: Story = {
  args: {
    label: "이름",
    value: "홍길동",
    placeholder: "이름을 입력하세요",
  },
};

export const Error: Story = {
  args: {
    label: "이메일",
    placeholder: "example@email.com",
    errorMessage: "이미 사용 중인 이메일입니다",
    value: "test@",
  },
};

export const Disabled: Story = {
  args: {
    label: "이메일",
    placeholder: "admin@company.com",
    disabled: true,
    value: "admin@company.com",
  },
};

export const Underline: Story = {
  args: {
    variant: "underline",
    placeholder: "검색어를 입력하세요",
  },
};

// ============================================
// Feature Combinations - 기능 조합 테스트
// ============================================

export const WithClear: Story = {
  args: {
    label: "닉네임",
    value: "모티브유저123",
    placeholder: "닉네임을 입력하세요",
    onClear: () => alert("입력 내용이 삭제되었습니다"),
  },
};

export const CustomColor: Story = {
  args: {
    label: "브랜드 컬러",
    placeholder: "커스텀 컬러 테마 적용",
    color: "#10b981",
  },
};

export const WithCounter: Story = {
  args: {
    label: "자기소개",
    placeholder: "자신을 소개해주세요",
    maxLength: 100,
    value: "안녕하세요! 프론트엔드 개발자입니다.",
  },
};

export const ErrorWithCounter: Story = {
  args: {
    label: "상품 설명",
    placeholder: "상품 설명을 입력하세요 (최소 10자)",
    errorMessage: "상품 설명은 최소 10자 이상 입력해주세요",
    maxLength: 50,
    value: "좋아요",
  },
};

// ============================================
// Variant Tests - Underline variant 조합
// ============================================

export const UnderlineWithLabel: Story = {
  args: {
    variant: "underline",
    label: "아이디",
    placeholder: "아이디를 입력하세요",
  },
};

export const UnderlineWithError: Story = {
  args: {
    variant: "underline",
    label: "비밀번호",
    placeholder: "비밀번호를 입력하세요",
    errorMessage: "비밀번호는 최소 8자 이상이어야 합니다",
    value: "123",
  },
};
