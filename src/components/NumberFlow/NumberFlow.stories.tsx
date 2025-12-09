import React, { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { NumberFlow } from "./NumberFlow";

const meta: Meta<typeof NumberFlow> = {
  title: "Components/NumberFlow",
  component: NumberFlow,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: { type: "number" },
    },
    locale: {
      control: { type: "text" },
    },
    duration: {
      control: { type: "range", min: 100, max: 2000, step: 100 },
    },
  },
  args: {
    value: 12345,
    locale: "ko-KR",
    duration: 500,
  },
};

export default meta;
type Story = StoryObj<typeof NumberFlow>;

export const Default: Story = {
  args: {
    value: 12345,
  },
};

export const Interactive: Story = {
  render: function InteractiveDemo() {
    const [value, setValue] = useState(1000);

    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>
          <NumberFlow value={value} />
        </div>
        <div
          style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}
        >
          <button onClick={() => setValue((v) => v - 100)}>-100</button>
          <button onClick={() => setValue((v) => v - 10)}>-10</button>
          <button onClick={() => setValue((v) => v + 10)}>+10</button>
          <button onClick={() => setValue((v) => v + 100)}>+100</button>
          <button onClick={() => setValue(Math.floor(Math.random() * 100000))}>
            Random
          </button>
        </div>
      </div>
    );
  },
};
