"use client"
import { Button } from "@repo/design-system/components/ui/button"
import { toast } from "@repo/design-system/components/ui/sonner"

export default function Home() {
  return (
    <div>
      <h1>Hello World</h1>
      <Button
        onClick={() => {
          toast("Toast")
        }}
      >
        Click me
      </Button>
    </div>
  )
}
