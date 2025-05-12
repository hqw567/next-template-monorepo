/**
 * 从URL中获取文件名
 *
 * @param url - 需要提取文件名的URL
 * @returns 文件名，如果没有找到文件名则返回undefined
 *
 * @example
 * ```ts
 * getFileNameFromUrl('https://example.com/documents/report.pdf');
 * // 返回 'report.pdf'
 *
 * getFileNameFromUrl('https://example.com/images/photo.jpg?width=800');
 * // 返回 'photo.jpg'
 * ```
 */
export function getFileNameFromUrl(url: string) {
  const lastSegment = url.split("/").pop() || ""
  return lastSegment.split(/[?#]/)[0]
}
