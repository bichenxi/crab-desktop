const DIR_MAP: Record<string, string> = {
  桌面: 'Desktop',
  文档: 'Documents',
  文稿: 'Documents',
  下载: 'Downloads',
}

/** 去掉「这个」「那个」等前缀，得到实际文件名/文件夹名 */
function normalizeName(name: string): string {
  return name
    .replace(/^(这个|那个|那个叫|名叫|叫)\s*/i, '')
    .trim()
}

/**
 * 解析用户输入中的「删除文件」意图
 * 匹配：删掉/删除 + (桌面|文档|下载|文稿) + 上的? + 文件名（且不含「文件夹」）
 */
export function parseDeleteFileIntent(
  userMessage: string,
  homeDir: string
): string | null {
  if (!homeDir) return null

  const trimmed = userMessage.trim()
  if (!/^(删掉|删除|移除|删了)/i.test(trimmed)) return null
  if (/文件夹/i.test(trimmed)) return null

  const match = trimmed.match(
    /(?:删掉|删除|移除|删了)\s*(桌面|文档|文稿|下载)\s*上的?\s*([^\s，。！？]+)/i
  )
  if (match) {
    const dirName = match[1]
    const fileName = normalizeName(match[2].trim())
    if (!fileName) return null
    const dir = DIR_MAP[dirName] || 'Desktop'
    return `${homeDir}/${dir}/${fileName}`
  }

  return null
}

/**
 * 解析用户输入中的「删除文件夹」意图
 * 匹配：删掉/删除 + (桌面|文档|下载|文稿) + 上的? + xxx + 文件夹
 */
export function parseDeleteDirIntent(
  userMessage: string,
  homeDir: string
): string | null {
  if (!homeDir) return null

  const trimmed = userMessage.trim()
  if (!/^(删掉|删除|移除|删了)/i.test(trimmed)) return null
  if (!/文件夹/i.test(trimmed)) return null

  const match = trimmed.match(
    /(?:删掉|删除|移除|删了)\s*(桌面|文档|文稿|下载)\s*上的?\s*([^\s，。！？]+?)\s*文件夹/i
  )
  if (match) {
    const dirName = match[1]
    const folderName = normalizeName(match[2].trim())
    if (!folderName) return null
    const dir = DIR_MAP[dirName] || 'Desktop'
    return `${homeDir}/${dir}/${folderName}`
  }

  return null
}
