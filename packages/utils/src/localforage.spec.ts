import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { localforage } from "./localforage.js"

// 模拟localforage库
vi.mock("localforage", () => {
  const store = new Map()
  return {
    default: {
      setItem: vi.fn((key, value) => {
        store.set(key, value)
        return Promise.resolve(value)
      }),
      getItem: vi.fn((key) => {
        return Promise.resolve(store.get(key) || null)
      }),
      removeItem: vi.fn((key) => {
        store.delete(key)
        return Promise.resolve()
      }),
      clear: vi.fn(() => {
        store.clear()
        return Promise.resolve()
      }),
      keys: vi.fn(() => {
        return Promise.resolve([...store.keys()])
      }),
      length: vi.fn(() => {
        return Promise.resolve(store.size)
      }),
      key: vi.fn((index) => {
        const keys = [...store.keys()]
        return Promise.resolve(keys[index] || null)
      }),
    },
  }
})

describe("localforage 工具", () => {
  beforeEach(async () => {
    // 清除所有存储的数据
    await localforage.clear()

    // 重置所有模拟函数
    vi.clearAllMocks()

    // 重置计时器
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe("基本存储操作", () => {
    it("应该能够存储和检索数据", async () => {
      // 存储数据
      await localforage.setItem("测试键", "测试值")

      // 检索数据
      const value = await localforage.getItem("测试键")

      expect(value).toBe("测试值")
    })

    it("应该能够存储并检索复杂对象", async () => {
      const complexObject = {
        name: "测试对象",
        nested: {
          value: 42,
          array: [1, 2, 3],
        },
      }

      await localforage.setItem("复杂对象", complexObject)

      const retrieved = await localforage.getItem("复杂对象")
      expect(retrieved).toEqual(complexObject)
    })

    it("应该返回null当键不存在时", async () => {
      const value = await localforage.getItem("不存在的键")
      expect(value).toBeNull()
    })

    it("应该能够删除项", async () => {
      // 先存储数据
      await localforage.setItem("要删除的键", "要删除的值")

      // 确认存储成功
      expect(await localforage.getItem("要删除的键")).toBe("要删除的值")

      // 删除数据
      await localforage.removeItem("要删除的键")

      // 确认删除成功
      expect(await localforage.getItem("要删除的键")).toBeNull()
    })
  })

  describe("元数据和过期", () => {
    it("应该支持存储带有元数据的项", async () => {
      await localforage.setItem("带元数据的键", "带元数据的值", {
        metadata: { category: "测试", tags: ["重要", "示例"] },
      })

      const result = await localforage.getItemWithMetadata("带元数据的键")

      expect(result).not.toBeNull()
      expect(result?.value).toBe("带元数据的值")
      expect(result?.metadata).toEqual({ category: "测试", tags: ["重要", "示例"] })
    })

    it("应该支持数据过期", async () => {
      // 存储一个10秒后过期的项
      await localforage.setItem("过期键", "过期值", { expiresIn: 10 })

      // 验证此时可以获取
      expect(await localforage.getItem("过期键")).toBe("过期值")

      // 推进时间15秒
      vi.advanceTimersByTime(15000)

      // 此时应该已过期
      expect(await localforage.getItem("过期键")).toBeNull()
    })
  })

  describe("批量操作", () => {
    it("应该支持批量设置数据", async () => {
      await localforage.bulkSet([
        { key: "批量键1", value: "批量值1" },
        { key: "批量键2", value: "批量值2" },
        { key: "批量键3", value: "批量值3" },
      ])

      expect(await localforage.getItem("批量键1")).toBe("批量值1")
      expect(await localforage.getItem("批量键2")).toBe("批量值2")
      expect(await localforage.getItem("批量键3")).toBe("批量值3")
    })

    it("应该支持批量获取数据", async () => {
      // 先设置一些数据
      await localforage.setItem("批量获取1", "值1")
      await localforage.setItem("批量获取2", "值2")
      await localforage.setItem("批量获取3", "值3")

      const results = await localforage.bulkGet(["批量获取1", "批量获取2", "不存在的键", "批量获取3"])

      expect(results).toEqual({
        批量获取1: "值1",
        批量获取2: "值2",
        不存在的键: null,
        批量获取3: "值3",
      })
    })
  })

  describe("查询功能", () => {
    it("应该能够按元数据查询项目", async () => {
      // 设置带有各种元数据的项目
      await localforage.setItem(
        "产品1",
        { id: 1, name: "苹果" },
        {
          metadata: { type: "水果", color: "红色", inStock: true },
        },
      )
      await localforage.setItem(
        "产品2",
        { id: 2, name: "香蕉" },
        {
          metadata: { type: "水果", color: "黄色", inStock: true },
        },
      )
      await localforage.setItem(
        "产品3",
        { id: 3, name: "橙子" },
        {
          metadata: { type: "水果", color: "橙色", inStock: false },
        },
      )

      // 按单个元数据字段查询
      const redFruits = await localforage.queryByMetadata<{ id: number; name: string }>({ color: "红色" })
      expect(redFruits.length).toBe(1)
      expect(redFruits[0]?.value?.name).toBe("苹果")

      // 按多个元数据字段查询
      const inStockFruits = await localforage.queryByMetadata<{ id: number; name: string }>({
        type: "水果",
        inStock: true,
      })
      expect(inStockFruits.length).toBe(2)
      const names = inStockFruits.map((item) => item.value.name).sort()
      expect(names).toEqual(["苹果", "香蕉"])
    })
  })

  describe("实用函数", () => {
    it("应该返回正确的存储长度", async () => {
      // 空存储时的长度
      expect(await localforage.length()).toBe(0)

      // 添加一些项目
      await localforage.setItem("键1", "值1")
      await localforage.setItem("键2", "值2")

      // 检查长度
      expect(await localforage.length()).toBe(2)

      // 删除一个项目
      await localforage.removeItem("键1")

      // 再次检查长度
      expect(await localforage.length()).toBe(1)
    })

    it("应该返回所有键的列表", async () => {
      // 添加一些项目
      await localforage.setItem("键A", "值A")
      await localforage.setItem("键B", "值B")
      await localforage.setItem("键C", "值C")

      // 获取所有键
      const keys = await localforage.keys()

      // 排序以确保顺序一致性
      expect(keys.sort()).toEqual(["键A", "键B", "键C"])
    })

    it("应该正确清除所有数据", async () => {
      // 添加一些项目
      await localforage.setItem("测试1", "值1")
      await localforage.setItem("测试2", "值2")

      // 确认数据已存储
      expect(await localforage.length()).toBe(2)

      // 清除数据
      await localforage.clear()

      // 确认数据已清除
      expect(await localforage.length()).toBe(0)
      expect(await localforage.getItem("测试1")).toBeNull()
    })
  })
})
