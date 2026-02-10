import type { Skill } from '@/skills/types'
import { fileService } from '@/services/tauri/files'

export const deleteDirSkill: Skill = {
  id: 'builtin/delete_dir',
  name: 'delete_dir',
  description:
    '删除用户电脑上的一个文件夹（整目录移至回收站，含内部所有文件）。只能删除安全目录下的文件夹（Desktop, Documents, Downloads）。',
  parameters: {
    type: 'object',
    properties: {
      path: {
        type: 'string',
        description: '要删除的文件夹的完整绝对路径',
      },
    },
    required: ['path'],
  },
  handler: async (args) => {
    const path = args.path as string
    if (!path) throw new Error('缺少参数: path 是必需的')
    return await fileService.deleteDir(path)
  },
}
