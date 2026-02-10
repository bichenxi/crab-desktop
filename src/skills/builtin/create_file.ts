import type { Skill } from '@/skills/types'
import { fileService } from '@/services/tauri/files'

export const createFileSkill: Skill = {
  id: 'builtin/create_file',
  name: 'create_file',
  description:
    '在用户电脑上创建一个文件。只能在安全目录下创建（Desktop, Documents, Downloads）。',
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description:
          '文件的完整绝对路径，例如 /Users/用户名/Desktop/note.txt。必须在 Desktop、Documents 或 Downloads 目录下。',
      },
      content: {
        type: 'string',
        description: '文件的内容',
      },
    },
    required: ['path', 'content'],
  },
  handler: async (args) => {
    const path = args.path as string
    const content = args.content as string
    if (!path || content === undefined) throw new Error('缺少参数: path 和 content 是必需的')
    return await fileService.createFile(path, content)
  },
}
