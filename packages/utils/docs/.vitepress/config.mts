import { defineConfig } from "vitepress"
import typedocSidebar from "../reference/typedoc-sidebar.json"

// https://vitepress.dev/reference/site-config

// Define types for sidebar items
interface SidebarItem {
  text: string
  link?: string
  collapsed?: boolean
  items?: SidebarItem[]
}

// Create a completely flat sidebar by extracting all items
const flattenedSidebar: SidebarItem[] = []

// Process each category in the sidebar
typedocSidebar.forEach((category: SidebarItem) => {
  if (category.items) {
    // Extract all items from this category
    category.items.forEach((item: SidebarItem) => {
      if (item.link) {
        // Fix the link path
        const fixedItem = {
          text: item.text,
          link: item.link.replace("/docs", "").replace(".md", ""),
        }
        flattenedSidebar.push(fixedItem)
      }
    })
  }
})

export default defineConfig({
  title: "Next-Editor Utils",
  description: "Documentation for Next-Editor Utils package",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "Home", link: "/" },
      { text: "Reference", link: "/reference" },
    ],

    sidebar: [
      {
        text: "Reference",
        items: flattenedSidebar,
      },
    ],
  },
})
