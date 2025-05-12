import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { exportZip } from "./export-zip"

// 模拟 @zip.js/zip.js 模块
vi.mock("@zip.js/zip.js", async () => {
  return {
    BlobWriter: vi.fn().mockImplementation(() => ({
      // BlobWriter 实现
    })),
    ZipWriter: vi.fn().mockImplementation(() => ({
      add: vi.fn().mockResolvedValue(undefined),
      close: vi.fn().mockResolvedValue(new Blob(["mock zip content"], { type: "application/zip" })),
    })),
    TextReader: vi.fn(),
    BlobReader: vi.fn(),
    Data64URIReader: vi.fn(),
    Uint8ArrayReader: vi.fn(),
    HttpReader: vi.fn(),
    HttpRangeReader: vi.fn(),
    SplitDataReader: vi.fn(),
  }
})

describe("exportZip 函数", () => {
  // 存储原始的浏览器 API
  let originalCreateElement: typeof document.createElement
  let originalCreateObjectURL: typeof URL.createObjectURL
  let originalRevokeObjectURL: typeof URL.revokeObjectURL

  beforeEach(() => {
    // 保存原始浏览器 API
    originalCreateElement = document.createElement
    originalCreateObjectURL = URL.createObjectURL
    originalRevokeObjectURL = URL.revokeObjectURL

    // 模拟 DOM API
    document.createElement = vi.fn(() => ({
      href: "",
      download: "",
      click: vi.fn(),
    })) as any

    URL.createObjectURL = vi.fn(() => "blob:mock-url")
    URL.revokeObjectURL = vi.fn()
  })

  afterEach(() => {
    // 恢复原始浏览器 API
    document.createElement = originalCreateElement
    URL.createObjectURL = originalCreateObjectURL
    URL.revokeObjectURL = originalRevokeObjectURL

    // 清除所有模拟的实现和调用历史
    vi.clearAllMocks()
  })

  it("应该使用TextReader处理文本文件列表", async () => {
    const files = ["文件内容1", "文件内容2", "文件内容3"]
    const options = {
      zipName: "测试.zip",
      fileNameTemplate: (index: number) => `文件-${index + 1}.txt`,
    }

    await exportZip(files, "TextReader", options)

    // 验证导入的 zip.js 库的使用
    const zipJs = await import("@zip.js/zip.js")

    // 验证创建了正确类型的Reader
    expect(zipJs.TextReader).toHaveBeenCalledTimes(3)
    expect(zipJs.TextReader).toHaveBeenNthCalledWith(1, "文件内容1")
    expect(zipJs.TextReader).toHaveBeenNthCalledWith(2, "文件内容2")
    expect(zipJs.TextReader).toHaveBeenNthCalledWith(3, "文件内容3")

    // 验证 ZipWriter 的使用
    expect(zipJs.ZipWriter).toHaveBeenCalledTimes(1)
    const zipWriter = (zipJs.ZipWriter as any).mock.results[0].value
    expect(zipWriter.add).toHaveBeenCalledTimes(3)
    expect(zipWriter.add).toHaveBeenNthCalledWith(1, "文件-1.txt", expect.anything())
    expect(zipWriter.add).toHaveBeenNthCalledWith(2, "文件-2.txt", expect.anything())
    expect(zipWriter.add).toHaveBeenNthCalledWith(3, "文件-3.txt", expect.anything())
    expect(zipWriter.close).toHaveBeenCalledTimes(1)

    // 验证下载行为
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1)
    expect(document.createElement).toHaveBeenCalledWith("a")
    const link = (document.createElement as any).mock.results[0].value
    expect(link.href).toBe("blob:mock-url")
    expect(link.download).toBe("测试.zip")
    expect(link.click).toHaveBeenCalledTimes(1)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith("blob:mock-url")
  })

  it("应该使用BlobReader处理Blob文件列表", async () => {
    const files = [new Blob(["Blob内容1"], { type: "text/plain" }), new Blob(["Blob内容2"], { type: "text/plain" })]
    const options = {
      zipName: "blob文件.zip",
      fileNameTemplate: (index: number) => `blob-${index + 1}.bin`,
    }

    await exportZip(files, "BlobReader", options)

    // 验证导入的 zip.js 库的使用
    const zipJs = await import("@zip.js/zip.js")

    // 验证创建了正确类型的Reader
    expect(zipJs.BlobReader).toHaveBeenCalledTimes(2)
    expect(zipJs.BlobReader).toHaveBeenNthCalledWith(1, files[0])
    expect(zipJs.BlobReader).toHaveBeenNthCalledWith(2, files[1])

    // 验证文件名模板的使用
    const zipWriter = (zipJs.ZipWriter as any).mock.results[0].value
    expect(zipWriter.add).toHaveBeenNthCalledWith(1, "blob-1.bin", expect.anything())
    expect(zipWriter.add).toHaveBeenNthCalledWith(2, "blob-2.bin", expect.anything())
  })

  it("当使用错误的Reader类型时应抛出错误", async () => {
    const files = ["文件内容"]
    const options = {
      zipName: "测试.zip",
      fileNameTemplate: (index: number) => `文件-${index + 1}.txt`,
    }

    await expect(exportZip(files, "BlobReader" as any, options)).rejects.toThrow("BlobReader requires a Blob input")
  })

  it("应该处理HttpReader类型的URL列表", async () => {
    const files = ["https://example.com/file1.pdf", "https://example.com/file2.pdf"]
    const options = {
      zipName: "下载文档.zip",
      fileNameTemplate: (index: number) => `文档-${index + 1}.pdf`,
    }

    await exportZip(files, "HttpReader", options)

    // 验证导入的 zip.js 库的使用
    const zipJs = await import("@zip.js/zip.js")

    // 验证创建了正确类型的Reader
    expect(zipJs.HttpReader).toHaveBeenCalledTimes(2)
    expect(zipJs.HttpReader).toHaveBeenNthCalledWith(1, "https://example.com/file1.pdf")
    expect(zipJs.HttpReader).toHaveBeenNthCalledWith(2, "https://example.com/file2.pdf")

    // 验证文件添加和关闭
    const zipWriter = (zipJs.ZipWriter as any).mock.results[0].value
    expect(zipWriter.add).toHaveBeenCalledTimes(2)
    expect(zipWriter.close).toHaveBeenCalledTimes(1)
  })
})
