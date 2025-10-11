import type { Meta, StoryObj } from '@storybook/react'
import { Tooltip } from './Tooltip'
import { Button } from '../Button'

const meta = {
  title: 'Components/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    content: {
      control: 'text',
      description: 'Tooltip content',
    },
    position: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'Tooltip position',
    },
    variant: {
      control: 'select',
      options: ['default', 'outlined'],
      description: 'Tooltip style variant',
    },
    color: {
      control: 'color',
      description: 'Tooltip color',
    },
    showArrow: {
      control: 'boolean',
      description: 'Show arrow indicator',
    },
  },
} satisfies Meta<typeof Tooltip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    content: 'This is a tooltip',
    position: 'top',
    children: <Button variant="primary" size="medium">Hover me</Button>,
  },
}

export const Outlined: Story = {
  args: {
    content: 'Outlined tooltip',
    position: 'top',
    variant: 'outlined',
    children: <Button variant="primary" size="medium">Outlined</Button>,
  },
}

export const WithArrow: Story = {
  args: {
    content: 'Tooltip with arrow',
    position: 'top',
    showArrow: true,
    children: <Button variant="primary" size="medium">With Arrow</Button>,
  },
}

export const CustomColor: Story = {
  args: {
    content: 'Custom color',
    position: 'top',
    variant: 'outlined',
    color: '#ef4444',
    showArrow: true,
    children: <Button variant="secondary" size="medium">Red</Button>,
  },
}
