import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { downloadFile } from "./download-file"

describe("downloadFile 函数", () => {
  // 保存原始的 XMLHttpRequest, document 和 URL
  let originalXHR: typeof XMLHttpRequest
  let originalCreateElement: typeof document.createElement
  let originalCreateObjectURL: typeof URL.createObjectURL
  let originalRevokeObjectURL: typeof URL.revokeObjectURL
  let originalAppendChild: typeof document.body.appendChild
  let originalRemoveChild: typeof document.body.removeChild
  let originalWindowLocation: typeof window.location

  beforeEach(() => {
    // 保存原始值
    originalXHR = global.XMLHttpRequest
    originalCreateElement = document.createElement
    originalCreateObjectURL = URL.createObjectURL
    originalRevokeObjectURL = URL.revokeObjectURL
    originalAppendChild = document.body.appendChild
    originalRemoveChild = document.body.removeChild
    originalWindowLocation = window.location

    // 模拟 XMLHttpRequest
    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(function (this: any) {
        // 模拟成功请求
        this.status = 200
        this.response = new Blob(["测试内容"], { type: "text/plain" })
        if (this.onload) this.onload()
      }),
      setRequestHeader: vi.fn(),
    })) as any

    // 模拟 createElement
    document.createElement = vi.fn(() => ({
      href: "",
      style: {},
      download: "",
      click: vi.fn(),
    })) as any

    // 模拟 URL API
    URL.createObjectURL = vi.fn(() => "blob:mock-url")
    URL.revokeObjectURL = vi.fn()

    // 模拟 DOM 操作
    document.body.appendChild = vi.fn()
    document.body.removeChild = vi.fn()

    // 模拟 window.location
    Object.defineProperty(window, "location", {
      value: { protocol: "https:" },
      writable: true,
    })
  })

  afterEach(() => {
    // 恢复原始值
    global.XMLHttpRequest = originalXHR
    document.createElement = originalCreateElement
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL
    document.body.appendChild = originalAppendChild
    document.body.removeChild = originalRemoveChild
    Object.defineProperty(window, "location", {
      value: originalWindowLocation,
      writable: true,
    })
  })

  it("应该使用GET请求下载文件", async () => {
    await downloadFile("https://example.com/test.txt")

    expect(XMLHttpRequest).toHaveBeenCalled()
    const xhrInstance = (XMLHttpRequest as any).mock.results[0].value
    expect(xhrInstance.open).toHaveBeenCalledWith("GET", "https://example.com/test.txt", true)
    expect(xhrInstance.send).toHaveBeenCalled()
  })

  it("应该将HTTP URL替换为HTTPS，当当前协议是HTTPS", async () => {
    await downloadFile("http://example.com/test.txt")

    const xhrInstance = (XMLHttpRequest as any).mock.results[0].value
    expect(xhrInstance.open).toHaveBeenCalledWith("GET", "https://example.com/test.txt", true)
  })

  it("应该创建下载链接并触发点击", async () => {
    await downloadFile("https://example.com/test.txt", "custom-name.txt")

    expect(document.createElement).toHaveBeenCalledWith("a")
    expect(URL.createObjectURL).toHaveBeenCalled()

    const linkElement = (document.createElement as any).mock.results[0].value
    expect(linkElement.download).toBe("custom-name.txt")
    expect(linkElement.href).toBe("blob:mock-url")
    expect(linkElement.click).toHaveBeenCalled()
  })

  it("应该在完成后清理资源", async () => {
    await downloadFile("https://example.com/test.txt")

    expect(document.body.appendChild).toHaveBeenCalled()
    expect(document.body.removeChild).toHaveBeenCalled()
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url")
  })

  it("应该支持进度回调", async () => {
    const onProgressMock = vi.fn()

    // 创建带有进度事件的XMLHttpRequest模拟
    global.XMLHttpRequest = vi.fn(() => ({
      open: vi.fn(),
      send: vi.fn(function (this: any) {
        // 触发进度事件
        if (this.onprogress) {
          const progressEvent = { loaded: 50, total: 100 }
          this.onprogress(progressEvent)
        }
        // 模拟成功完成
        this.status = 200
        this.response = new Blob(["测试内容"], { type: "text/plain" })
        if (this.onload) this.onload()
      }),
      setRequestHeader: vi.fn(),
    })) as any

    await downloadFile("https://example.com/test.txt", undefined, { onProgress: onProgressMock })

    expect(onProgressMock).toHaveBeenCalledWith({ loaded: 50, total: 100 })
  })
})
