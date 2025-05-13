import { Button } from "@repo/design-system/components/ui/button"
import { Spinner } from "@repo/design-system/components/ui/spinner"
import type { Meta, StoryObj } from "@storybook/react"
import { useState } from "react"

/**
 * A simple spinner component for displaying loading state with customizable size,
 * visibility control, and the ability to add accompanying text.
 */
const meta: Meta<typeof Spinner> = {
  title: "ui/Spinner",
  component: Spinner,
  tags: ["autodocs"],
  argTypes: {
    size: {
      control: "select",
      options: ["small", "medium", "large"],
      description: "Controls the size of the spinner",
      defaultValue: "medium",
    },
    show: {
      control: "boolean",
      description: "Controls visibility of the spinner",
      defaultValue: true,
    },
    className: {
      control: "text",
      description: "Additional CSS classes to apply to the spinner",
    },
    children: {
      control: "text",
      description: "Content to display alongside the spinner",
    },
  },
  args: {
    size: "medium",
    show: true,
  },
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component: "A customizable loading spinner component with various sizes and styles.",
      },
    },
  },
}
export default meta

type Story = StoryObj<typeof Spinner>

/**
 * The default appearance of the Spinner.
 */
export const Default: Story = {}

/**
 * Small size spinner
 */
export const Small: Story = {
  args: {
    size: "small",
  },
}

/**
 * Medium size spinner (default)
 */
export const Medium: Story = {
  args: {
    size: "medium",
  },
}

/**
 * Large size spinner
 */
export const Large: Story = {
  args: {
    size: "large",
  },
}

/**
 * The Spinner with text content
 */
export const WithText: Story = {
  args: {
    children: "Loading...",
  },
}

/**
 * Custom styling can be applied to the Spinner using the className prop.
 */
export const CustomColor: Story = {
  args: {
    className: "text-blue-500",
    children: <span className="mt-2 text-blue-500">Loading in blue</span>,
  },
}

/**
 * Hidden spinner example
 */
export const Hidden: Story = {
  args: {
    show: false,
  },
}

/**
 * Interactive spinner toggle example
 */
export const ToggleExample: Story = {
  render: () => {
    const [show, setShow] = useState(false)
    return (
      <div className="flex flex-col items-center gap-5">
        <Button onClick={() => setShow((prev) => !prev)}>{show ? "Hide Spinner" : "Show Spinner"}</Button>
        <div className="flex h-12 items-center justify-center">
          <Spinner show={show} />
        </div>
      </div>
    )
  },
}

/**
 * All sizes displayed together for comparison
 */
export const SizesComparison: Story = {
  render: () => (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center gap-3">
        <Spinner size="small" />
        <span className="text-muted-foreground text-sm">Small</span>
      </div>
      <div className="flex items-center gap-3">
        <Spinner size="medium" />
        <span className="text-muted-foreground text-sm">Medium (default)</span>
      </div>
      <div className="flex items-center gap-3">
        <Spinner size="large" />
        <span className="text-muted-foreground text-sm">Large</span>
      </div>
    </div>
  ),
}
