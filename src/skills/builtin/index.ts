import type { Skill } from '@/skills/types'
import { createFileSkill } from './create_file'
import { readFileSkill } from './read_file'
import { listFilesSkill } from './list_files'
import { deleteFileSkill } from './delete_file'
import { deleteDirSkill } from './delete_dir'

/** 内置技能：文件创建、读取、列出、删除文件/文件夹 */
export const BUILTIN_SKILLS: Skill[] = [
  createFileSkill,
  readFileSkill,
  listFilesSkill,
  deleteFileSkill,
  deleteDirSkill,
]
