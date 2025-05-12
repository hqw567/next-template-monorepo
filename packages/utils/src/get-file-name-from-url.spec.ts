import { describe, expect, it } from "vitest"
import { getFileNameFromUrl } from "./get-file-name-from-url"

describe("getFileNameFromUrl 函数", () => {
  it("应该从简单URL中提取文件名", () => {
    expect(getFileNameFromUrl("https://example.com/document.pdf")).toBe("document.pdf")
  })

  it("应该能处理带有查询参数的URL", () => {
    expect(getFileNameFromUrl("https://example.com/image.jpg?width=800")).toBe("image.jpg")
  })

  it("应该能处理带有哈希的URL", () => {
    expect(getFileNameFromUrl("https://example.com/file.txt#section1")).toBe("file.txt")
  })

  it("应该能处理复杂URL路径", () => {
    expect(getFileNameFromUrl("https://example.com/path/to/document.pdf")).toBe("document.pdf")
  })

  it("当URL没有文件名时应返回空字符串", () => {
    expect(getFileNameFromUrl("https://example.com/")).toBe("")
  })

  it("应该能处理没有协议的路径", () => {
    expect(getFileNameFromUrl("/path/to/file.txt")).toBe("file.txt")
  })
})
