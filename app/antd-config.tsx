'use client'

import { ConfigProvider } from 'antd'
import zhCN from 'antd/es/locale/zh_CN'

interface AntdConfigProps {
  children: React.ReactNode
}

export default function AntdConfig({ children }: AntdConfigProps) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        primaryColor: '#2563eb',
        borderRadius: 8,
      }}
      componentSize="large"
    >
      {children}
    </ConfigProvider>
  )
}