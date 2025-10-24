import type { Meta, StoryObj } from "@storybook/react";
import { ToastProvider } from "./Toast";
import { useToast } from "./useToast";
import { Button } from "../Button";

const meta: Meta<typeof ToastProvider> = {
  title: "Components/Toast",
  component: ToastProvider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Demo Component
function ToastDemo() {
  const toast = useToast();

  return (
    <Button
      variant="primary"
      onClick={() => toast.show("기본 토스트 메시지입니다")}
    >
      기본 Toast
    </Button>
  );
}

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <ToastDemo />
    </ToastProvider>
  ),
};
