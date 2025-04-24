import { createEnv } from "@t3-oss/env-nextjs"
import { z } from "zod"

export const env = createEnv({
  extends: [],
  server: {},
  client: {
    NEXT_PUBLIC_WEB_URL: z.string().min(12).url().startsWith("http"),
    NEXT_PUBLIC_API_URL: z.string().min(12).url().startsWith("http").optional(),
  },
  runtimeEnv: {
    NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  },
})
