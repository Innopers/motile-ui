import type { Meta, StoryObj } from "@storybook/react";
import { Tooltip } from "./Tooltip";
import { Button } from "../Button";

const meta: Meta<typeof Tooltip.Root> = {
  title: "Components/Tooltip",
  component: Tooltip.Root,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    position: {
      control: "select",
      options: ["top", "bottom", "left", "right"],
      description: "Tooltip position",
    },
    variant: {
      control: "select",
      options: ["default", "outlined"],
      description: "Tooltip style variant",
    },
    color: {
      control: "color",
      description: "Tooltip color",
    },
    showArrow: {
      control: "boolean",
      description: "Show arrow indicator",
    },
    interactive: {
      control: "boolean",
      description:
        "Allow interaction with tooltip content (e.g., clicking buttons)",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <Tooltip.Root {...args}>
      <Tooltip.Trigger>
        <Button variant="primary" size="medium">
          Hover me
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>This is a tooltip</Tooltip.Content>
    </Tooltip.Root>
  ),
  args: {
    position: "top",
    children: <></>,
  },
};

export const Outlined: Story = {
  render: (args) => (
    <Tooltip.Root {...args}>
      <Tooltip.Trigger>
        <Button variant="primary" size="medium">
          Outlined
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>Outlined tooltip</Tooltip.Content>
    </Tooltip.Root>
  ),
  args: {
    position: "top",
    variant: "outlined",
    children: <></>,
  },
};

export const WithArrow: Story = {
  render: (args) => (
    <Tooltip.Root {...args}>
      <Tooltip.Trigger>
        <Button variant="primary" size="medium">
          With Arrow
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>Tooltip with arrow</Tooltip.Content>
    </Tooltip.Root>
  ),
  args: {
    position: "top",
    showArrow: true,
    children: <></>,
  },
};

export const CustomColor: Story = {
  render: (args) => (
    <Tooltip.Root {...args}>
      <Tooltip.Trigger>
        <Button variant="secondary" size="medium">
          Red
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>Custom color</Tooltip.Content>
    </Tooltip.Root>
  ),
  args: {
    position: "top",
    variant: "outlined",
    color: "#ef4444",
    showArrow: true,
    children: <></>,
  },
};

export const Interactive: Story = {
  render: (args) => (
    <Tooltip.Root {...args}>
      <Tooltip.Trigger>
        <Button variant="primary" size="medium">
          Interactive
        </Button>
      </Tooltip.Trigger>
      <Tooltip.Content>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <p style={{ margin: 0, fontSize: "13px" }}>Click the button below</p>
          <Button
            variant="primary"
            size="small"
            onClick={() => alert("Button clicked!")}
          >
            Click me
          </Button>
        </div>
      </Tooltip.Content>
    </Tooltip.Root>
  ),
  args: {
    interactive: true,
    variant: "outlined",
    showArrow: true,
    position: "top",
    children: <></>,
  },
};
