import { getFileExtensionFromUrl } from "./get-file-extension-from-url"
import { getFileNameFromUrl } from "./get-file-name-from-url"
import { getSafeFilename } from "./get-safe-filename"

/**
 * 从URL下载文件到用户设备
 *
 * @param fileSrc - 要下载的文件URL
 * @param fileName - 可选的自定义下载文件名
 * @param options - 下载的附加选项
 * @param options.onProgress - 可选的跟踪下载进度的回调函数
 * @returns 当下载完成时解析的Promise
 *
 * @example
 * ```ts
 * // 使用默认文件名的基本下载
 * downloadFile('https://example.com/document.pdf');
 *
 * // 使用自定义文件名下载
 * downloadFile('https://example.com/document.pdf', 'my-document.pdf');
 *
 * // 带进度跟踪的下载
 * downloadFile(
 *   'https://example.com/large-file.zip',
 *   'downloaded-file.zip',
 *   {
 *     onProgress: (event) => {
 *       const percent = (event.loaded / event.total) * 100;
 *       console.log(`下载进度: ${percent.toFixed(2)}%`);
 *     }
 *   }
 * );
 * ```
 */
export function downloadFile(
  fileSrc: string,
  fileName?: string,
  { onProgress }: { onProgress?: (event: ProgressEvent) => void } = {},
): Promise<void> {
  // 当前网站是https协议时不能使用http协议下载协议替换为https

  const src =
    window.location.protocol === "https:" && fileSrc.startsWith("http:") ? fileSrc.replace("http:", "https:") : fileSrc

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open("GET", src, true)
    xhr.responseType = "blob"

    xhr.onprogress = (event) => {
      if (onProgress) {
        onProgress(event)
      }
    }

    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = xhr.response
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.style.display = "none"

        if (fileName) {
          const fn = getSafeFilename(fileName)
          link.download = getFileExtensionFromUrl(fn) ? fn : fn + (getFileNameFromUrl(fileSrc)?.split(".").pop() || "")
        } else {
          link.download = getFileNameFromUrl(fileSrc) || "download"
        }

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        resolve()
      } else {
        reject(new Error(`File download error: ${xhr.statusText}`))
      }
    }

    xhr.onerror = () => {
      reject(new Error("Network error"))
    }

    xhr.send()
  })
}
