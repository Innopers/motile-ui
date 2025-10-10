import type { Meta, StoryObj } from "@storybook/react";
import {
  Accordion,
  AccordionHeader,
  AccordionContent,
} from "./Accordion";

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
  decorators: [
    (Story) => (
      <div style={{ width: "600px", maxWidth: "100%" }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * 기본 아코디언입니다.
 * AccordionHeader를 클릭하면 AccordionContent가 열리고 닫힙니다.
 */
export const Default: Story = {
  render: () => (
    <Accordion>
      <AccordionHeader>자주 묻는 질문</AccordionHeader>
      <AccordionContent>
        여기에 아코디언 내용이 표시됩니다. 긴 텍스트나 다양한 컴포넌트를 넣을
        수 있습니다.
      </AccordionContent>
    </Accordion>
  ),
};

/**
 * disabled prop을 사용하면 아코디언을 비활성화할 수 있습니다.
 */
export const Disabled: Story = {
  render: () => (
    <Accordion disabled>
      <AccordionHeader>비활성화 상태</AccordionHeader>
      <AccordionContent>
        비활성화된 아코디언은 클릭할 수 없습니다.
      </AccordionContent>
    </Accordion>
  ),
};
