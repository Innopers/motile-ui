import type { Meta, StoryObj } from '@storybook/react'
import { Skeleton } from './Skeleton'

const meta = {
  title: 'Components/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    width: {
      control: 'text',
      description: 'Skeleton width (string or number)',
    },
    height: {
      control: 'text',
      description: 'Skeleton height (string or number)',
    },
    borderRadius: {
      control: 'text',
      description: 'Skeleton border radius',
    },
  },
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    width: '100%',
    height: '1rem',
  },
}
