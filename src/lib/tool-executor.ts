/**
 * Tool Executor - 工具调用执行器
 *
 * 根据 AI 返回的 tool_call.name 从技能注册表查找对应技能并执行 handler，
 * 支持内置技能 + 已安装技能。
 */

import { getSkillByName } from '@/skills/registry'
import type { ParsedToolCall, ToolResult } from '@/lib/tools'

/**
 * 执行单个工具调用
 */
export async function executeTool(toolCall: ParsedToolCall): Promise<ToolResult> {
  const { id, name, arguments: args } = toolCall

  const skill = getSkillByName(name)
  if (!skill) {
    return {
      tool_call_id: id,
      name,
      success: false,
      result: `未知工具: ${name}。请确认该技能已安装并已刷新。`,
    }
  }

  try {
    const result = await skill.handler(args)
    return {
      tool_call_id: id,
      name,
      success: true,
      result,
    }
  } catch (error) {
    return {
      tool_call_id: id,
      name,
      success: false,
      result: `执行失败: ${error instanceof Error ? error.message : String(error)}`,
    }
  }
}

/**
 * 批量执行多个工具调用
 */
export async function executeTools(toolCalls: ParsedToolCall[]): Promise<ToolResult[]> {
  return Promise.all(toolCalls.map(executeTool))
}
