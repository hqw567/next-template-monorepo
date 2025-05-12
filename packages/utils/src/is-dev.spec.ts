import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

describe("isDev 常量", () => {
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    // 清除模块缓存以便重新加载
    vi.resetModules()
  })

  afterEach(() => {
    // 测试后恢复原始环境
    process.env.NODE_ENV = originalNodeEnv
  })

  it("当 NODE_ENV 为 development 时，isDev 应该为 true", async () => {
    process.env.NODE_ENV = "development"
    const { isDev } = await import("./is-dev.js")
    expect(isDev).toBe(true)
  })

  it("当 NODE_ENV 为 production 时，isDev 应该为 false", async () => {
    process.env.NODE_ENV = "production"
    const { isDev } = await import("./is-dev.js")
    expect(isDev).toBe(false)
  })

  it("当 NODE_ENV 为其他值时，isDev 应该为 false", async () => {
    process.env.NODE_ENV = "test"
    const { isDev } = await import("./is-dev.js")
    expect(isDev).toBe(false)
  })
})
