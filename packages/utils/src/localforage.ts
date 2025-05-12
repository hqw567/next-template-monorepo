import localforage2 from "localforage"

interface StorageItem<T> {
  value: T
  created: number
  updated: number
  exp: number | null
  compressed?: boolean
  metadata?: Record<string, any>
  lastAccessed?: number
}

/**
 * @private
 */
class EfficientStorageManager {
  // 最大重试次数
  private maxRetries = 3
  // 是否启用debug日志
  private debug = false
  // 索引缓存
  private indexCache: Record<string, Record<string, string[]>> = {}
  // 内存缓存
  private memoryCache: Map<string, StorageItem<any>> = new Map()
  // 缓存限制
  private memoryCacheLimit = 100
  // 清理间隔时间（毫秒）
  private cleanupInterval = 10 * 60 * 1000
  // 批量操作队列
  private operationQueue: Map<string, Promise<any>> = new Map()
  // 是否正在清理
  private isCleaningUp = false

  constructor(config?: {
    maxRetries?: number
    debug?: boolean
    memoryCacheLimit?: number
    cleanupInterval?: number
  }) {
    if (config?.maxRetries) this.maxRetries = config.maxRetries
    if (config?.debug) this.debug = config.debug
    if (config?.memoryCacheLimit) this.memoryCacheLimit = config.memoryCacheLimit
    if (config?.cleanupInterval) this.cleanupInterval = config.cleanupInterval

    // 初始化周期性清理任务
    if (typeof window !== "undefined") {
      this.setupCleanupTask()
    }
  }

  // 设置清理任务
  private setupCleanupTask() {
    setInterval(() => {
      this.triggerCleanup()
    }, this.cleanupInterval)
  }

  // 触发清理
  async triggerCleanup() {
    if (this.isCleaningUp) return

    this.isCleaningUp = true
    try {
      await this.cleanExpiredItems()
      this.pruneMemoryCache()
    } catch (error) {
      this.log("Error during cleanup:", error)
    } finally {
      this.isCleaningUp = false
    }
  }

  // 清理内存缓存
  private pruneMemoryCache() {
    if (this.memoryCache.size <= this.memoryCacheLimit) return

    // 按最后访问时间排序
    const entries = [...this.memoryCache.entries()].sort((a, b) => (a[1].lastAccessed || 0) - (b[1].lastAccessed || 0))

    // 删除最老的条目直到达到限制
    const toRemove = entries.slice(0, entries.length - this.memoryCacheLimit)
    for (const [key] of toRemove) {
      this.memoryCache.delete(key)
    }

    this.log(`Pruned ${toRemove.length} items from memory cache`)
  }

  // 日志方法
  private log(...args: any[]) {
    if (this.debug) {
      console.log("[StorageManager]", ...args)
    }
  }

  // 获取操作锁，确保同一键的操作顺序执行
  private async withOperationLock<T>(key: string, operation: () => Promise<T>): Promise<T> {
    // 等待之前的操作完成
    const previousOperation = this.operationQueue.get(key)
    if (previousOperation) {
      await previousOperation
    }

    // 创建当前操作
    const currentOperation = operation()
    this.operationQueue.set(key, currentOperation)

    try {
      return await currentOperation
    } finally {
      // 如果当前操作仍是队列中的操作，则删除
      if (this.operationQueue.get(key) === currentOperation) {
        this.operationQueue.delete(key)
      }
    }
  }

  async setItem<T>(
    key: string,
    value: T,
    options?: {
      expiresIn?: number
      compress?: boolean
      metadata?: Record<string, any>
      skipCache?: boolean
    },
  ) {
    return this.withOperationLock(key, async () => {
      const now = Date.now()
      const existingItem = await this.getRawItem<T>(key)

      const item: StorageItem<T> = {
        value,
        created: existingItem?.created ?? now,
        updated: now,
        lastAccessed: now,
        exp: options?.expiresIn ? now + options.expiresIn * 1000 : null,
        compressed: options?.compress,
        metadata: options?.metadata,
      }

      await localforage2.setItem(key, item)

      // 更新内存缓存
      if (!options?.skipCache) {
        this.memoryCache.set(key, item)
        // 检查缓存大小
        if (this.memoryCache.size > this.memoryCacheLimit) {
          this.pruneMemoryCache()
        }
      }

      // 更新索引
      if (options?.metadata) {
        await this.updateIndices(key, options.metadata)
      }
    })
  }

  // 获取原始存储项
  private async getRawItem<T>(key: string): Promise<StorageItem<T> | null> {
    // 先检查内存缓存
    if (this.memoryCache.has(key)) {
      const item = this.memoryCache.get(key) as StorageItem<T>
      if (!this.isExpired(item)) {
        // 更新最后访问时间
        item.lastAccessed = Date.now()
        return item
      } else {
        // 过期项从缓存中删除
        this.memoryCache.delete(key)
        return null
      }
    }

    // 从存储中获取
    const item = await localforage2.getItem<StorageItem<T>>(key)
    if (item) {
      if (this.isExpired(item)) {
        await this.removeItem(key)
        return null
      }

      // 更新最后访问时间
      item.lastAccessed = Date.now()
      await localforage2.setItem(key, item)

      // 更新内存缓存
      this.memoryCache.set(key, item)
      return item
    }
    return null
  }

  // 更新索引
  private async updateIndices(key: string, metadata: Record<string, any>) {
    for (const [metaKey, metaValue] of Object.entries(metadata)) {
      if (typeof metaValue !== "string" && typeof metaValue !== "number") continue

      const indexKey = `__index_${metaKey}:${metaValue}`

      // 从缓存或存储中获取索引
      let index = this.indexCache[indexKey]
      if (!index) {
        index = (await localforage2.getItem<Record<string, string[]>>(indexKey)) || {}
        this.indexCache[indexKey] = index
      }

      // 更新索引
      if (!index[key]) {
        index[key] = [key]
        await localforage2.setItem(indexKey, index)
        this.indexCache[indexKey] = index
      }
    }
  }

  // 根据元数据查询
  async queryByMetadata<T>(query: Record<string, any>): Promise<Array<{ key: string; value: T }>> {
    const results: Array<{ key: string; value: T }> = []

    // 如果只有一个查询条件，尝试使用索引
    const queryEntries = Object.entries(query)
    if (queryEntries.length === 1) {
      const [metaKey, metaValue] = queryEntries[0] as [string, any]
      if (typeof metaValue === "string" || typeof metaValue === "number") {
        const indexKey = `__index_${metaKey}:${metaValue}`

        // 查找索引
        let index = this.indexCache[indexKey]
        if (!index) {
          index = (await localforage2.getItem<Record<string, string[]>>(indexKey)) || {}
          this.indexCache[indexKey] = index
        }

        // 使用索引查找所有匹配的键
        const keys = Object.keys(index)
        for (const key of keys) {
          const item = await this.getItem<T>(key)
          if (item) {
            results.push({ key, value: item })
          }
        }

        return results
      }
    }

    // 备选：扫描所有项目
    const items = await this.getAllItems<T>()
    return items
      .filter((item) => {
        if (!item.metadata) return false

        return Object.entries(query).every(([k, v]) => item.metadata?.[k] === v)
      })
      .map((item) => ({ key: item.key, value: item.value }))
  }

  private isExpired(item: StorageItem<unknown>): boolean {
    return item.exp !== null && Date.now() > item.exp
  }

  async getItem<T>(key: string): Promise<T | null> {
    return this.withOperationLock(key, async () => {
      const item = await this.getRawItem<T>(key)
      return item ? item.value : null
    })
  }

  async getItemWithMetadata<T>(key: string): Promise<{ value: T; metadata?: Record<string, any> } | null> {
    return this.withOperationLock(key, async () => {
      const item = await this.getRawItem<T>(key)
      if (item) {
        return {
          value: item.value,
          metadata: item.metadata,
        }
      }
      return null
    })
  }

  async removeItem(key: string) {
    return this.withOperationLock(key, async () => {
      // 从内存缓存中删除
      this.memoryCache.delete(key)

      const item = await localforage2.getItem<StorageItem<unknown>>(key)
      if (item?.metadata) {
        // 清理索引
        for (const [metaKey, metaValue] of Object.entries(item.metadata)) {
          if (typeof metaValue !== "string" && typeof metaValue !== "number") continue

          const indexKey = `__index_${metaKey}:${metaValue}`
          const index = await localforage2.getItem<Record<string, string[]>>(indexKey)

          if (index?.[key]) {
            delete index[key]
            await localforage2.setItem(indexKey, index)

            // 更新缓存
            if (this.indexCache[indexKey]) {
              delete this.indexCache[indexKey][key]
            }
          }
        }
      }

      await localforage2.removeItem(key)
    })
  }

  async cleanExpiredItems() {
    const startTime = Date.now()
    const keys = await localforage2.keys()
    let cleanedCount = 0

    for (const key of keys) {
      // 跳过索引键
      if (key.startsWith("__index_")) continue

      const item = await localforage2.getItem<StorageItem<unknown>>(key)
      if (item && this.isExpired(item)) {
        await this.removeItem(key)
        cleanedCount++
      }
    }

    const duration = Date.now() - startTime
    this.log(`Cleaned ${cleanedCount} expired items in ${duration}ms`)
  }

  async getAllItems<T>() {
    const keys = await localforage2.keys()
    const items: Array<{ key: string } & StorageItem<T>> = []

    for (const key of keys) {
      // 跳过索引键
      if (key.startsWith("__index_")) continue

      const item = await this.getRawItem<T>(key)
      if (item) {
        items.push({ key, ...item })
      }
    }

    return items
  }

  async bulkSet<T>(
    items: Array<{
      key: string
      value: T
      expiresIn?: number
      compress?: boolean
      metadata?: Record<string, any>
    }>,
  ) {
    // 使用Promise.all并行处理所有设置操作
    await Promise.all(
      items.map(({ key, value, expiresIn, compress, metadata }) =>
        this.setItem(key, value, { expiresIn, compress, metadata }),
      ),
    )
  }

  async bulkGet<T>(keys: string[]): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {}

    await Promise.all(
      keys.map(async (key) => {
        result[key] = await this.getItem<T>(key)
      }),
    )

    return result
  }

  // 批量查询并处理数据
  async bulkProcess<T, R>(keys: string[], processor: (items: Record<string, T | null>) => Promise<R>): Promise<R> {
    const items = await this.bulkGet<T>(keys)
    return await processor(items)
  }

  // 带有重试机制的获取方法
  async getItemWithRetry<T>(key: string, retries = this.maxRetries): Promise<T | null> {
    try {
      return await this.getItem<T>(key)
    } catch (error) {
      if (retries > 0) {
        this.log(`Error getting item ${key}, retrying... (${retries} attempts left)`, error)
        return this.getItemWithRetry<T>(key, retries - 1)
      }
      this.log(`Failed to get item ${key} after ${this.maxRetries} attempts`, error)
      return null
    }
  }

  async length() {
    const allKeys = await this.keys()
    return allKeys.length
  }

  async key(index: number) {
    const allKeys = await this.keys()
    return allKeys[index] || null
  }

  async keys(): Promise<string[]> {
    const allKeys = await localforage2.keys()
    // 过滤掉索引键
    return allKeys.filter((key) => !key.startsWith("__index_"))
  }

  async clear() {
    this.indexCache = {}
    this.memoryCache.clear()
    this.operationQueue.clear()
    await localforage2.clear()
  }
}

/**
 * 增强版的localforage，用于高效的浏览器存储
 * 具有元数据、自动过期和索引等附加功能。
 *
 * @example
 * ```ts
 * // 基本用法
 * import { localforage } from '@repo/utils';
 *
 * // 存储数据
 * await localforage.setItem('user-preferences', {
 *   theme: 'dark',
 *   fontSize: 16,
 *   notifications: true
 * });
 *
 * // 检索数据
 * const preferences = await localforage.getItem('user-preferences');
 * console.log(preferences.theme); // 'dark'
 *
 * // 删除数据
 * await localforage.removeItem('user-preferences');
 *
 * // 清除所有数据
 * await localforage.clear();
 *
 * // 存储带有过期时间的数据（以秒为单位）
 * await localforage.setItem('cache-key', responseData, {
 *   expiresIn: 3600 // 1小时后过期
 * });
 *
 * // 存储带有元数据的数据以便后续查询
 * await localforage.setItem('document', documentData, {
 *   metadata: {
 *     type: 'invoice',
 *     category: 'finance',
 *     year: 2023
 *   }
 * });
 * ```
 */
export const localforage = new EfficientStorageManager()
;(async () => {
  try {
    if (typeof window === "undefined") return
    // 延迟启动清理，避免在页面加载时消耗资源
    setTimeout(async () => {
      await localforage.triggerCleanup()
    }, 1000)
  } catch (error) {
    console.error("Error in storage manager:", error)
  }
})()
