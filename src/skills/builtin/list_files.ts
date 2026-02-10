import type { Skill } from '@/skills/types'
import { fileService } from '@/services/tauri/files'

export const listFilesSkill: Skill = {
  id: 'builtin/list_files',
  name: 'list_files',
  description:
    '列出用户电脑上某个目录下的所有文件和文件夹名称。只能列出安全目录下的内容（Desktop, Documents, Downloads）。',
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: '目录的完整绝对路径',
      },
    },
    required: ['path'],
  },
  handler: async (args) => {
    const path = args.path as string
    if (!path) throw new Error('缺少参数: path 是必需的')
    const files = await fileService.listFiles(path)
    return files.length > 0
      ? `目录包含 ${files.length} 个项目:\n${files.join('\n')}`
      : '目录为空'
  },
}
