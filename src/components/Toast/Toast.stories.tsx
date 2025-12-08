import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../Button";
import { ToastProvider } from "./Toast";
import { useToast } from "./useToast";

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

function SuccessToastDemo() {
  const toast = useToast();

  return (
    <Button
      variant="primary"
      onClick={() => toast.success("성공적으로 완료되었습니다")}
    >
      Success Toast
    </Button>
  );
}

function ErrorToastDemo() {
  const toast = useToast();

  return (
    <Button
      variant="primary"
      onClick={() => toast.error("오류가 발생했습니다")}
    >
      Error Toast
    </Button>
  );
}

function WarningToastDemo() {
  const toast = useToast();

  return (
    <Button
      variant="primary"
      onClick={() => toast.warning("경고 메시지입니다")}
    >
      Warning Toast
    </Button>
  );
}

function InfoToastDemo() {
  const toast = useToast();

  return (
    <Button variant="primary" onClick={() => toast.info("정보 메시지입니다")}>
      Info Toast
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

export const Success: Story = {
  render: () => (
    <ToastProvider>
      <SuccessToastDemo />
    </ToastProvider>
  ),
};

export const Error: Story = {
  render: () => (
    <ToastProvider>
      <ErrorToastDemo />
    </ToastProvider>
  ),
};

export const Warning: Story = {
  render: () => (
    <ToastProvider>
      <WarningToastDemo />
    </ToastProvider>
  ),
};

export const Info: Story = {
  render: () => (
    <ToastProvider>
      <InfoToastDemo />
    </ToastProvider>
  ),
};
