'use client'

import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

interface AntdConfigProps {
  children: React.ReactNode
}

const theme = {
  token: {
    colorPrimary: '#2563eb',
    borderRadius: 8,
  },
  components: {
    Button: {
      borderRadius: 8,
    },
  },
}

export default function AntdConfig({ children }: AntdConfigProps) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={theme}
      componentSize="large"
    >
      {children}
    </ConfigProvider>
  )
}