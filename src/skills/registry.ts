/**
 * 技能注册表：合并内置技能 + 已安装技能，供 tools 与 executor 使用
 */

import type { Skill } from '@/skills/types'
import { BUILTIN_SKILLS } from '@/skills/builtin'
import { getTimeSkill } from '@/skills/installed/example_get_time'

/** 运行时注册的“已安装”技能（后续可从目录或远程拉取并 push 进来） */
const installedSkills: Skill[] = []

/** 加载已安装技能（在模块加载时注册示例技能；后续可改为扫描目录或远程拉取） */
function loadInstalledSkills(): void {
  registerSkill(getTimeSkill)
  // 后续可在此处：扫描 src/skills/installed/*.ts 或从远程拉取并 registerSkill(skill)
}
loadInstalledSkills()

/** 获取当前所有可用技能（内置 + 已安装） */
export function getAllSkills(): Skill[] {
  return [...BUILTIN_SKILLS, ...installedSkills]
}

/** 按 name 查找技能，供 executor 调用 */
export function getSkillByName(name: string): Skill | undefined {
  return getAllSkills().find((s) => s.name === name)
}

/** 注册一个已安装技能（供后续从目录/远程加载后调用） */
export function registerSkill(skill: Skill): void {
  if (installedSkills.some((s) => s.id === skill.id || s.name === skill.name)) {
    console.warn(`[skills] Skill already registered: ${skill.id}`)
    return
  }
  installedSkills.push(skill)
}

/** 取消注册（按 id） */
export function unregisterSkill(id: string): void {
  const idx = installedSkills.findIndex((s) => s.id === id)
  if (idx !== -1) installedSkills.splice(idx, 1)
}
