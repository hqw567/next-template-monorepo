import "./globals.css"
import { DesignSystemProvider } from "@repo/design-system"
import { fonts } from "@repo/design-system/lib/fonts"
import { cn } from "@repo/design-system/lib/utils"
import { createMetadata } from "@repo/seo/metadata"
import type { Metadata } from "next"

export const metadata: Metadata = createMetadata({
  title: "Web Title",
  description: "Web Description",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html className={cn(fonts, "scroll-smooth")} lang="en" suppressHydrationWarning>
      <body>
        <DesignSystemProvider>{children}</DesignSystemProvider>
      </body>
    </html>
  )
}
