import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 获取图片路径，支持环境判断
export function getImagePath(imagePath: string): string {
  const isProd = process.env.NODE_ENV === 'production'
  const basePath = isProd ? '/mstech' : ''
  
  // 确保路径以 / 开头
  const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`
  
  return `${basePath}${normalizedPath}`
}

// 获取基础路径
export function getBasePath(): string {
  const isProd = process.env.NODE_ENV === 'production'
  return isProd ? '/mstech' : ''
}
