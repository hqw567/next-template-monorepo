import { describe, expect, it } from "vitest"
import { getFileExtensionFromUrl } from "./get-file-extension-from-url"

describe("getFileExtensionFromUrl 函数", () => {
  it("应该从URL中提取文件扩展名", () => {
    expect(getFileExtensionFromUrl("https://example.com/document.pdf")).toBe("pdf")
  })

  it("应该能处理带有查询参数的URL", () => {
    expect(getFileExtensionFromUrl("https://example.com/image.jpg?width=800")).toBe("jpg")
  })

  it("应该能处理带有哈希的URL", () => {
    expect(getFileExtensionFromUrl("https://example.com/file.txt#section1")).toBe("txt")
  })

  it("当URL没有扩展名时应返回空字符串", () => {
    expect(getFileExtensionFromUrl("https://example.com/file")).toBe("")
  })

  it("应该能处理复杂URL", () => {
    expect(getFileExtensionFromUrl("https://example.com/path/to/document.pdf?version=1.0&download=true#page=5")).toBe(
      "pdf",
    )
  })
})
