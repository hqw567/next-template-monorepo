/**
 * 从URL中提取文件扩展名
 *
 * @param url - 需要提取文件扩展名的URL
 * @returns 不带点的文件扩展名，如果没有找到扩展名则返回空字符串
 *
 * @example
 * ```ts
 * getFileExtensionFromUrl('https://example.com/document.pdf');
 * // 返回 'pdf'
 *
 * getFileExtensionFromUrl('https://example.com/image.jpg?width=800');
 * // 返回 'jpg'
 *
 * getFileExtensionFromUrl('https://example.com/file');
 * // 返回 ''
 * ```
 */
export function getFileExtensionFromUrl(url: string) {
  // 从URL中提取文件名部分
  const filename = url.split("/").pop() || ""

  // 处理查询参数和哈希
  const filenameWithoutQueryAndHash = filename.split(/[?#]/)[0] || ""

  // 获取扩展名
  const parts = filenameWithoutQueryAndHash.split(".")

  // 如果文件名中没有点或者最后一段为空，则返回空字符串
  return parts.length > 1 ? parts.pop() || "" : ""
}
