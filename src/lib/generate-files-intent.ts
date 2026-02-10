/**
 * 解析用户输入中的「生成 N 个文件到某文件夹」意图
 * 匹配：生成 (N) (条|个) ... 文件 ... 到 (桌面|文档|下载) (的)? xxx 文件夹
 * 返回 { dirPath, count, format, topic } 或 null
 */

const DIR_MAP: Record<string, string> = {
  桌面: 'Desktop',
  文档: 'Documents',
  文稿: 'Documents',
  下载: 'Downloads',
}

export interface GenerateFilesIntent {
  dirPath: string
  count: number
  format: 'json' | 'txt'
  topic: string
  folderName: string
}

export function parseGenerateFilesIntent(
  userMessage: string,
  homeDir: string
): GenerateFilesIntent | null {
  if (!homeDir) return null

  const t = userMessage.trim()
  // 生成 10 条/个 ... 文件
  const countMatch = t.match(/生成\s*(\d+)\s*(条|个)/)
  if (!countMatch) return null

  const count = Math.min(100, Math.max(1, parseInt(countMatch[1], 10)))
  if (count < 1) return null

  // 到 桌面(上)的? xxx 文件夹
  const dirMatch = t.match(
    /(?:到|在)\s*(桌面|文档|文稿|下载)\s*上?的?\s*([^\s，。！？、]+?)\s*文件夹/
  )
  if (!dirMatch) return null

  const dirKey = dirMatch[1]
  const folderName = dirMatch[2].trim()
  if (!folderName) return null

  const dir = DIR_MAP[dirKey] || 'Desktop'
  const dirPath = `${homeDir}/${dir}/${folderName}`

  const format = /json|JSON|\.json/i.test(t) ? 'json' : 'txt'
  const topic = t.includes('水果') || t.includes('蔬菜')
    ? 'fruit_vegetable'
    : t.includes('测试')
      ? 'test'
      : 'data'

  return { dirPath, count, format, topic, folderName }
}

/** 生成水果/蔬菜相关的简单 JSON 数据（用于兜底创建文件） */
const FRUIT_NAMES = ['苹果', '香蕉', '橙子', '葡萄', '草莓', '西瓜', '樱桃', '桃子', '梨', '芒果', '柠檬', '菠萝']
const VEG_NAMES = ['番茄', '黄瓜', '胡萝卜', '土豆', '菠菜', '白菜', '芹菜', '茄子', '青椒', '洋葱', '南瓜', '玉米']

function buildJsonContent(index: number, topic: string): string {
  if (topic === 'fruit_vegetable') {
    const items = []
    const pool = [...FRUIT_NAMES.map((n) => ({ type: 'fruit', name: n })), ...VEG_NAMES.map((n) => ({ type: 'vegetable', name: n }))]
    for (let i = 0; i < 3; i++) {
      const item = pool[(index * 3 + i) % pool.length]
      items.push({ id: index * 3 + i + 1, ...item })
    }
    return JSON.stringify(items, null, 2)
  }
  return JSON.stringify(
    [{ id: index + 1, type: 'test', label: `测试数据 ${index + 1}` }],
    null,
    2
  )
}

/**
 * 根据意图生成并创建多个文件
 * 返回创建结果摘要
 */
export async function executeGenerateFilesIntent(
  intent: GenerateFilesIntent,
  createFile: (path: string, content: string) => Promise<string>
): Promise<{ success: number; failed: number; paths: string[] }> {
  const { dirPath, count, format, topic } = intent
  const paths: string[] = []
  let success = 0
  let failed = 0

  for (let i = 1; i <= count; i++) {
    const baseName = topic === 'fruit_vegetable' ? 'data' : 'test'
    const ext = format === 'json' ? 'json' : 'txt'
    const path = `${dirPath}/${baseName}_${i}.${ext}`
    const content =
      format === 'json'
        ? buildJsonContent(i - 1, topic)
        : `测试文件 ${i}\n\n生成时间: ${new Date().toISOString()}`

    try {
      await createFile(path, content)
      paths.push(path)
      success++
    } catch {
      failed++
    }
  }

  return { success, failed, paths }
}
