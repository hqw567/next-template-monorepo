// Will be imported dynamically
// import {
//   BlobReader,
//   BlobWriter,
//   Data64URIReader,
//   HttpRangeReader,
//   HttpReader,
//   ReadableReader,
//   Reader,
//   SplitDataReader,
//   TextReader,
//   Uint8ArrayReader,
//   ZipWriter,
// } from "@zip.js/zip.js"

interface ExportZipOptions {
  zipName: string
  fileNameTemplate: (index: number) => string
}

// Define supported reader types
type ReaderType =
  | "TextReader"
  | "BlobReader"
  | "Data64URIReader"
  | "Uint8ArrayReader"
  | "HttpReader"
  | "HttpRangeReader"
  | "SplitDataReader"

// Define input types for each reader
type ReaderInputType =
  | string // For TextReader, Data64URIReader, HttpReader, HttpRangeReader
  | Blob // For BlobReader
  | Uint8Array // For Uint8ArrayReader
  | (any[] | ReadableStream[]) // For SplitDataReader

/**
 * 从文件列表创建并下载一个zip文件
 *
 * @param fileList - 要包含在zip中的文件数组
 * @param readerType - 用于读取文件的阅读器类型
 * @param options - zip文件的选项
 * @param options.zipName - 生成的zip文件名称
 * @param options.fileNameTemplate - 生成zip中每个文件名称的函数
 * @returns 当zip创建并下载完成时解析的Promise
 *
 * @example
 * ```ts
 * // 从文本文件创建zip
 * exportZip(
 *   ['Content of file 1', 'Content of file 2', 'Content of file 3'],
 *   'TextReader',
 *   {
 *     zipName: 'text-files.zip',
 *     fileNameTemplate: (index) => `file-${index + 1}.txt`
 *   }
 * );
 *
 * // 从图像blob创建zip
 * const imageBlobs = [blob1, blob2, blob3]; // 从canvas或fetch获取的Blob对象
 * exportZip(
 *   imageBlobs,
 *   'BlobReader',
 *   {
 *     zipName: 'images.zip',
 *     fileNameTemplate: (index) => `image-${index + 1}.png`
 *   }
 * );
 *
 * // 从URL创建zip
 * exportZip(
 *   ['https://example.com/file1.pdf', 'https://example.com/file2.pdf'],
 *   'HttpReader',
 *   {
 *     zipName: 'documents.zip',
 *     fileNameTemplate: (index) => `document-${index + 1}.pdf`
 *   }
 * );
 * ```
 */
export const exportZip = async <T extends ReaderInputType>(
  fileList: T[],
  readerType: ReaderType,
  options: ExportZipOptions,
) => {
  // Dynamic import
  const zipJs = await import("@zip.js/zip.js")
  const {
    BlobWriter,
    ZipWriter,
    TextReader,
    BlobReader,
    Data64URIReader,
    Uint8ArrayReader,
    HttpReader,
    HttpRangeReader,
    SplitDataReader,
  } = zipJs

  const zipWriter = new ZipWriter(new BlobWriter("application/zip"))

  for (let i = 0; i < fileList.length; i++) {
    const file = fileList[i]
    let reader: any

    switch (readerType) {
      case "TextReader":
        if (typeof file === "string") {
          reader = new TextReader(file)
        } else {
          throw new Error("TextReader requires a string input")
        }
        break

      case "BlobReader":
        if (file instanceof Blob) {
          reader = new BlobReader(file)
        } else {
          throw new Error("BlobReader requires a Blob input")
        }
        break

      case "Data64URIReader":
        if (typeof file === "string") {
          reader = new Data64URIReader(file)
        } else {
          throw new Error("Data64URIReader requires a string input")
        }
        break

      case "Uint8ArrayReader":
        if (file instanceof Uint8Array) {
          reader = new Uint8ArrayReader(file)
        } else {
          throw new Error("Uint8ArrayReader requires a Uint8Array input")
        }
        break

      case "HttpReader":
        if (typeof file === "string") {
          reader = new HttpReader(file)
        } else {
          throw new Error("HttpReader requires a string URL input")
        }
        break

      case "HttpRangeReader":
        if (typeof file === "string") {
          reader = new HttpRangeReader(file)
        } else {
          throw new Error("HttpRangeReader requires a string URL input")
        }
        break

      case "SplitDataReader":
        if (Array.isArray(file)) {
          reader = new SplitDataReader(file)
        } else {
          throw new Error("SplitDataReader requires an array of readers or streams")
        }
        break

      default:
        throw new Error(`Unsupported reader type: ${readerType}`)
    }

    await zipWriter.add(options.fileNameTemplate(i), reader)
  }

  const zipBlob = await zipWriter.close()

  const url = window.URL.createObjectURL(zipBlob)
  const a = document.createElement("a")
  a.href = url
  a.download = options.zipName
  a.click()
  window.URL.revokeObjectURL(url)
}
