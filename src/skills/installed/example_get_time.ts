/**
 * 示例已安装技能：获取当前时间
 *
 * 演示如何编写并注册一个自定义技能。
 * 安装方式：在应用启动时调用 loadInstalledSkills()，或手动 registerSkill(getTimeSkill)
 */

import type { Skill } from '@/skills/types'

export const getTimeSkill: Skill = {
  id: 'installed/get_time',
  name: 'get_time',
  description: '获取当前本地日期和时间，用于回答用户关于“现在几点”“今天几号”等问题。',
  parameters: {
    type: 'object',
    properties: {
      timezone: {
        type: 'string',
        description: '可选，时区，如 Asia/Shanghai。不传则使用本地时区。',
      },
    },
    required: [],
  },
  handler: async (args) => {
    const tz = (args.timezone as string) || undefined
    const now = new Date()
    const str = tz
      ? now.toLocaleString('zh-CN', { timeZone: tz })
      : now.toLocaleString('zh-CN')
    return `当前时间：${str}`
  },
}
