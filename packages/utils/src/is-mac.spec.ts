import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

describe("isMac 常量", () => {
  const originalNavigator = global.navigator

  beforeEach(() => {
    // 清除模块缓存以便重新加载
    vi.resetModules()

    // 使用完整对象替换navigator
    Object.defineProperty(global, "navigator", {
      writable: true,
      value: { platform: "" },
    })
  })

  afterEach(() => {
    // 测试后恢复原始navigator
    Object.defineProperty(global, "navigator", {
      writable: true,
      value: originalNavigator,
    })
  })

  it("当平台为 MacIntel 时，isMac 应该为 true", async () => {
    Object.defineProperty(global.navigator, "platform", {
      value: "MacIntel",
    })
    const { isMac } = await import("./is-mac.js")
    expect(isMac).toBe(true)
  })

  it("当平台为 MacPPC 时，isMac 应该为 true", async () => {
    Object.defineProperty(global.navigator, "platform", {
      value: "MacPPC",
    })
    const { isMac } = await import("./is-mac.js")
    expect(isMac).toBe(true)
  })

  it("当平台为 Windows 时，isMac 应该为 false", async () => {
    Object.defineProperty(global.navigator, "platform", {
      value: "Win32",
    })
    const { isMac } = await import("./is-mac.js")
    expect(isMac).toBe(false)
  })

  it("当平台为 Linux 时，isMac 应该为 false", async () => {
    Object.defineProperty(global.navigator, "platform", {
      value: "Linux x86_64",
    })
    const { isMac } = await import("./is-mac.js")
    expect(isMac).toBe(false)
  })
})
