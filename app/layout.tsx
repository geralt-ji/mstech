import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import AntdConfig from "./antd-config"

export const metadata = {
  title: "MSTECH - 科技创新，引领未来",
  description: "MSTECH致力于为企业提供前沿科技解决方案，助力企业数字化转型，实现可持续发展",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AntdConfig>
            {children}
          </AntdConfig>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
