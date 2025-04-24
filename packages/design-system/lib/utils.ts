import type { ClassValue } from "clsx"
import { clsx } from "clsx"
import { toast } from "sonner"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]): string => twMerge(clsx(inputs))

export const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1)

export const handleError = (error: unknown): void => {
  const message = parseError(error)

  toast.error(message)
}

export const parseError = (error: unknown): string => {
  let message = "An error occurred"

  if (error instanceof Error) {
    message = error.message
  } else if (error && typeof error === "object" && "message" in error) {
    message = error.message as string
  } else {
    message = String(error)
  }

  return message
}
