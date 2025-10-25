import type { Meta, StoryObj } from "@storybook/react";
import { Accordion, AccordionHeader, AccordionContent } from "./Accordion";

// Props that can be controlled via Storybook
interface AccordionStoryArgs {
  variant?: "default" | "outlined";
  defaultExpanded?: boolean;
  disabled?: boolean;
}

const meta = {
  title: "Components/Accordion",
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
      options: ["default", "outlined"],
      description: "아코디언 스타일 variant",
      table: {
        defaultValue: { summary: '"default"' },
        type: { summary: '"default" | "outlined"' },
      },
    },
    defaultExpanded: {
      control: "boolean",
      description: "초기 열림 상태",
      table: {
        defaultValue: { summary: "false" },
        type: { summary: "boolean" },
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
  },
  decorators: [
    (Story) => (
      <div style={{ width: "600px", maxWidth: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<AccordionStoryArgs>;

export default meta;
type Story = StoryObj<AccordionStoryArgs>;

/**
 * 기본 아코디언입니다.
 * AccordionHeader를 클릭하면 AccordionContent가 열리고 닫힙니다.
 */
export const Default: Story = {
  args: {
    variant: "default",
    defaultExpanded: false,
    disabled: false,
  },
  render: ({ variant, defaultExpanded, disabled }) => (
    <Accordion
      variant={variant}
      defaultExpanded={defaultExpanded}
      disabled={disabled}
    >
      <AccordionHeader>자주 묻는 질문</AccordionHeader>
      <AccordionContent>
        여기에 아코디언 내용이 표시됩니다. 긴 텍스트나 다양한 컴포넌트를 넣을 수
        있습니다.
      </AccordionContent>
    </Accordion>
  ),
};

/**
 * disabled prop을 사용하면 아코디언을 비활성화할 수 있습니다.
 */
export const Disabled: Story = {
  args: {
    variant: "default",
    defaultExpanded: false,
    disabled: true,
  },
  render: ({ variant, defaultExpanded, disabled }) => (
    <Accordion
      variant={variant}
      defaultExpanded={defaultExpanded}
      disabled={disabled}
    >
      <AccordionHeader>비활성화 상태</AccordionHeader>
      <AccordionContent>
        비활성화된 아코디언은 클릭할 수 없습니다.
      </AccordionContent>
    </Accordion>
  ),
};

/**
 * outlined variant는 테두리가 있는 아코디언입니다.
 */
export const Outlined: Story = {
  args: {
    variant: "outlined",
    defaultExpanded: false,
    disabled: false,
  },
  render: ({ variant, defaultExpanded, disabled }) => (
    <Accordion
      variant={variant}
      defaultExpanded={defaultExpanded}
      disabled={disabled}
    >
      <AccordionHeader>테두리 있는 아코디언</AccordionHeader>
      <AccordionContent>
        outlined variant가 적용된 아코디언입니다.
      </AccordionContent>
    </Accordion>
  ),
};
