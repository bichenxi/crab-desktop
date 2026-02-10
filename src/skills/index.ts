/**
 * 技能模块统一导出
 *
 * - 内置技能：src/skills/builtin/
 * - 已安装技能：通过 registerSkill() 动态注册，后续可从 src/skills/installed/ 或远程加载
 */

export type { Skill, ToolDefinition, ToolFunction } from './types'
export { skillToToolDefinition } from './types'
export { getAllSkills, getSkillByName, registerSkill, unregisterSkill } from './registry'
export { BUILTIN_SKILLS } from './builtin'
