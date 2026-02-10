import type { Skill } from '@/skills/types'
import { fileService } from '@/services/tauri/files'

export const readFileSkill: Skill = {
  id: 'builtin/read_file',
  name: 'read_file',
  description:
    '读取用户电脑上的一个文件内容。只能读取安全目录下的文件（Desktop, Documents, Downloads）。',
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: '文件的完整绝对路径',
      },
    },
    required: ['path'],
  },
  handler: async (args) => {
    const path = args.path as string
    if (!path) throw new Error('缺少参数: path 是必需的')
    const content = await fileService.readFile(path)
    return content.length > 2000
      ? content.slice(0, 2000) + '\n\n... (内容已截断，共 ' + content.length + ' 字符)'
      : content
  },
}
