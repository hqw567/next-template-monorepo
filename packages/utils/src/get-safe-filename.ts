/**
 * 通过移除/替换无效字符创建安全的文件名
 *
 * @param filename - 需要处理的原始文件名
 * @returns 适用于文件系统的经过净化的文件名
 *
 * @example
 * ```ts
 * getSafeFilename('my:file?.txt');
 * // 返回 'myfile_.txt'
 *
 * getSafeFilename('report / data < 2023 >.pdf');
 * // 返回 'report_data_2023_.pdf'
 *
 * getSafeFilename('   document name with spaces   ');
 * // 返回 'document_name_with_spaces'
 * ```
 */
export function getSafeFilename(filename: string) {
  // 创建一个映射不允许的字符到替换字符的对象
  const invalidCharsMap: any = {
    "<": "",
    ">": "",
    ":": "",
    '"': "",
    "/": "",
    "\\": "",
    "|": "",
    "?": "",
    "*": "",
    "\x00": "", // Null character
  }

  // 使用正则表达式替换不允许的字符
  const invalidCharsRegex = /[<>:"/\\|?*\0]/g
  filename = filename.replace(invalidCharsRegex, (match) => invalidCharsMap[match])

  // 移除两端空白字符
  filename = filename.trim()

  // 将空格替换为下划线
  filename = filename.replace(/\s+/g, "_")

  // 限制文件名长度为255个字符
  const maxFilenameLength = 255
  if (filename.length > maxFilenameLength) {
    filename = filename.substring(0, maxFilenameLength)
  }

  return filename
}
