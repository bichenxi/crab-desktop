/**
 * 可安装 Skill 的类型定义
 *
 * 每个技能 = 给 AI 的说明（name/description/parameters）+ 执行函数（handler）
 */

/** 单个技能的完整定义 */
export interface Skill {
  /** 唯一标识，如 builtin/create_file、installed/weather */
  id: string
  /** 给模型调用的工具名，需与 OpenAI function name 一致 */
  name: string
  /** 给模型的自然语言说明 */
  description: string
  /** 参数 schema（OpenAI 兼容） */
  parameters: Record<string, unknown>
  /** 实际执行逻辑，返回结果字符串或抛错 */
  handler: (args: Record<string, unknown>) => Promise<string>
}

/** OpenAI Function Calling 用的工具定义（无 handler） */
export interface ToolFunction {
  name: string
  description: string
  parameters: Record<string, unknown>
}

export interface ToolDefinition {
  type: 'function'
  function: ToolFunction
}

/** 从 Skill 转为 API 用的 ToolDefinition */
export function skillToToolDefinition(skill: Skill): ToolDefinition {
  return {
    type: 'function',
    function: {
      name: skill.name,
      description: skill.description,
      parameters: skill.parameters,
    },
  }
}
