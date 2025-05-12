import { describe, expect, it } from "vitest"
import { getSafeFilename } from "./get-safe-filename"

describe("getSafeFilename 函数", () => {
  it("应该移除非法字符", () => {
    expect(getSafeFilename("my:file?.txt")).toBe("myfile.txt")
  })

  it("应该将斜杠和特殊字符替换掉", () => {
    expect(getSafeFilename("report / data < 2023 >.pdf")).toBe("report_data_2023_.pdf")
  })

  it("应该移除首尾空格并将内部空格替换为下划线", () => {
    expect(getSafeFilename("   document name with spaces   ")).toBe("document_name_with_spaces")
  })

  it("应该处理包含多种非法字符的文件名", () => {
    expect(getSafeFilename('file*name:"with<many>invalid|chars?/\\')).toBe("filenamewithmanyinvalidchars")
  })

  it("应该限制文件名长度", () => {
    const longName = "a".repeat(300)
    expect(getSafeFilename(longName).length).toBe(255)
  })
})
