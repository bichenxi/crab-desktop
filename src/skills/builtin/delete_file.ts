import type { Skill } from '@/skills/types'
import { fileService } from '@/services/tauri/files'

export const deleteFileSkill: Skill = {
  id: 'builtin/delete_file',
  name: 'delete_file',
  description:
    '删除用户电脑上的一个文件（移至回收站）。只能删除安全目录下的文件（Desktop, Documents, Downloads）。',
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: '要删除的文件的完整绝对路径',
      },
    },
    required: ['path'],
  },
  handler: async (args) => {
    const path = args.path as string
    if (!path) throw new Error('缺少参数: path 是必需的')
    return await fileService.deleteFile(path)
  },
}
