// 通用工具函数

/**
 * 格式化时间
 */
export const formatTime = (date: Date | string | number, format: string = 'YYYY-MM-DD HH:mm:ss'): string => {
  const d = new Date(date)
  
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化持续时间
 */
export const formatDuration = (seconds: number): string => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`
  } else {
    return `${secs}s`
  }
}

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * 生成唯一ID
 */
export const generateId = (prefix: string = ''): string => {
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 8)
  return prefix ? `${prefix}_${timestamp}${random}` : `${timestamp}${random}`
}

/**
 * 深拷贝对象
 */
export const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') return obj
  if (obj instanceof Date) return new Date(obj.getTime()) as T
  if (obj instanceof Array) return obj.map(item => deepClone(item)) as T
  if (typeof obj === 'object') {
    const copy = {} as T
    Object.keys(obj).forEach(key => {
      copy[key as keyof T] = deepClone(obj[key as keyof T])
    })
    return copy
  }
  return obj
}

/**
 * 防抖函数
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate: boolean = false
): (...args: Parameters<T>) => void => {
  let timeout: NodeJS.Timeout | null = null
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      if (!immediate) func(...args)
    }
    
    const callNow = immediate && !timeout
    
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
    
    if (callNow) func(...args)
  }
}

/**
 * 节流函数
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void => {
  let inThrottle: boolean = false
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

/**
 * 下载文件
 */
export const downloadFile = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

/**
 * 复制到剪贴板
 */
export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    } else {
      // 降级方案
      const textArea = document.createElement('textarea')
      textArea.value = text
      textArea.style.position = 'fixed'
      textArea.style.left = '-999999px'
      textArea.style.top = '-999999px'
      document.body.appendChild(textArea)
      textArea.focus()
      textArea.select()
      const success = document.execCommand('copy')
      textArea.remove()
      return success
    }
  } catch (error) {
    console.error('Failed to copy text: ', error)
    return false
  }
}

/**
 * 验证SMILES字符串
 */
export const validateSMILES = (smiles: string): boolean => {
  // 基本的SMILES验证规则
  if (!smiles || typeof smiles !== 'string') return false
  
  // 检查基本字符
  const validChars = /^[A-Za-z0-9\[\]()=#+\-:.@/\\%]*$/
  if (!validChars.test(smiles)) return false
  
  // 检查括号匹配
  let parenthesesCount = 0
  let bracketCount = 0
  
  for (const char of smiles) {
    if (char === '(') parenthesesCount++
    if (char === ')') parenthesesCount--
    if (char === '[') bracketCount++
    if (char === ']') bracketCount--
    
    if (parenthesesCount < 0 || bracketCount < 0) return false
  }
  
  return parenthesesCount === 0 && bracketCount === 0
}

/**
 * 计算分子量（简化版本）
 */
export const calculateMolecularWeight = (smiles: string): number => {
  // 原子量表（简化版）
  const atomicWeights: Record<string, number> = {
    'H': 1.008,
    'C': 12.011,
    'N': 14.007,
    'O': 15.999,
    'F': 18.998,
    'P': 30.974,
    'S': 32.065,
    'Cl': 35.453,
    'Br': 79.904,
    'I': 126.904
  }
  
  let weight = 0
  const atoms = smiles.match(/[A-Z][a-z]?/g) || []
  
  atoms.forEach(atom => {
    weight += atomicWeights[atom] || 0
  })
  
  return Math.round(weight * 100) / 100
}

/**
 * 颜色工具
 */
export const colorUtils = {
  /**
   * 十六进制转RGB
   */
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },
  
  /**
   * RGB转十六进制
   */
  rgbToHex: (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  },
  
  /**
   * 生成随机颜色
   */
  randomColor: (): string => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
  },
  
  /**
   * 获取颜色的亮度
   */
  getBrightness: (hex: string): number => {
    const rgb = colorUtils.hexToRgb(hex)
    if (!rgb) return 0
    return (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
  }
}

/**
 * 数据处理工具
 */
export const dataUtils = {
  /**
   * 数组去重
   */
  unique: <T>(arr: T[], key?: keyof T): T[] => {
    if (!key) return [...new Set(arr)]
    
    const seen = new Set()
    return arr.filter(item => {
      const value = item[key]
      if (seen.has(value)) return false
      seen.add(value)
      return true
    })
  },
  
  /**
   * 数组分组
   */
  groupBy: <T>(arr: T[], key: keyof T): Record<string, T[]> => {
    return arr.reduce((groups, item) => {
      const group = String(item[key])
      groups[group] = groups[group] || []
      groups[group].push(item)
      return groups
    }, {} as Record<string, T[]>)
  },
  
  /**
   * 数组排序
   */
  sortBy: <T>(arr: T[], key: keyof T, order: 'asc' | 'desc' = 'asc'): T[] => {
    return arr.sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1
      if (aVal > bVal) return order === 'asc' ? 1 : -1
      return 0
    })
  }
}