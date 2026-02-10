/**
 * AI SSE 流式请求工具
 * 支持 OpenAI 兼容的 SSE 协议 + Function Calling (tool_calls)
 */

import type { ToolCallChunk, ParsedToolCall, ToolDefinition } from '@/lib/tools'

/** 检测是否运行在 Tauri 环境中 */
const isTauri = () => !!(window as any).__TAURI_INTERNALS__

/** 获取适合当前环境的 fetch 函数 */
async function getFetch(): Promise<typeof globalThis.fetch> {
  if (isTauri()) {
    const { fetch: tauriFetch } = await import('@tauri-apps/plugin-http')
    return tauriFetch
  }
  return globalThis.fetch
}

export interface StreamOptions {
  url: string
  body: Record<string, unknown>
  headers?: Record<string, string>
  /** 可用工具定义，传入后会在请求中附带 tools 参数 */
  tools?: ToolDefinition[]
  onMessage: (content: string, done: boolean) => void
  /** 当 AI 返回工具调用时触发 */
  onToolCalls?: (toolCalls: ParsedToolCall[]) => void
  onError?: (error: Error) => void
  signal?: AbortSignal
}

/**
 * 发送 SSE 流式请求 (OpenAI 兼容协议 + tool_calls 支持)
 */
export async function fetchSSE({
  url,
  body,
  headers = {},
  tools,
  onMessage,
  onToolCalls,
  onError,
  signal,
}: StreamOptions) {
  try {
    const httpFetch = await getFetch()

    // 如果有工具定义，附加到请求体中
    const requestBody = { ...body }
    if (tools && tools.length > 0) {
      requestBody.tools = tools
      requestBody.tool_choice = 'auto'
    }

    const response = await httpFetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: JSON.stringify(requestBody),
      signal,
    })

    if (!response.ok) {
      let errorDetail = ''
      try {
        const errorBody = await response.text()
        const parsed = JSON.parse(errorBody)
        errorDetail = parsed.error?.message || parsed.message || errorBody
      } catch {
        errorDetail = response.statusText || '请求失败'
      }
      throw new Error(`HTTP ${response.status}: ${errorDetail}`)
    }

    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const decoder = new TextDecoder()
    let buffer = ''

    // 用于累积 tool_calls 的数据
    const toolCallAccumulators: Map<
      number,
      { id: string; name: string; arguments: string }
    > = new Map()

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        // 流结束时，检查是否有累积的 tool_calls
        if (toolCallAccumulators.size > 0) {
          const parsedToolCalls = finalizeParsedToolCalls(toolCallAccumulators)
          onToolCalls?.(parsedToolCalls)
        } else {
          onMessage('', true)
        }
        break
      }

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const trimmed = line.trim()
        if (!trimmed || trimmed === 'data: [DONE]') {
          if (trimmed === 'data: [DONE]') {
            // 流结束，检查 tool_calls
            if (toolCallAccumulators.size > 0) {
              const parsedToolCalls = finalizeParsedToolCalls(toolCallAccumulators)
              onToolCalls?.(parsedToolCalls)
            } else {
              onMessage('', true)
            }
          }
          continue
        }

        if (trimmed.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmed.slice(6))
            const delta = data.choices?.[0]?.delta

            if (!delta) continue

            // 处理普通文本内容
            const content = delta.content ?? ''
            if (content) {
              onMessage(content, false)
            }

            // 处理 tool_calls (增量流式)
            if (delta.tool_calls) {
              for (const tc of delta.tool_calls as ToolCallChunk[]) {
                const idx = tc.index
                if (!toolCallAccumulators.has(idx)) {
                  toolCallAccumulators.set(idx, {
                    id: tc.id || '',
                    name: tc.function?.name || '',
                    arguments: '',
                  })
                }
                const acc = toolCallAccumulators.get(idx)!
                if (tc.id) acc.id = tc.id
                if (tc.function?.name) acc.name = tc.function.name
                if (tc.function?.arguments) acc.arguments += tc.function.arguments
              }
            }

            // 检查 finish_reason
            const finishReason = data.choices?.[0]?.finish_reason
            if (finishReason === 'tool_calls' || finishReason === 'function_call') {
              if (toolCallAccumulators.size > 0) {
                const parsedToolCalls = finalizeParsedToolCalls(toolCallAccumulators)
                onToolCalls?.(parsedToolCalls)
              }
            } else if (finishReason === 'stop') {
              onMessage('', true)
            }
          } catch {
            // 非 JSON 数据，作为纯文本处理
            onMessage(trimmed.slice(6), false)
          }
        }
      }
    }
  } catch (error: any) {
    if (error?.name === 'AbortError') return
    const message = error?.message || error?.toString?.() || '未知错误'
    onError?.(new Error(message))
  }
}

/**
 * 将累积的 tool call 数据解析为结构化对象
 */
function finalizeParsedToolCalls(
  accumulators: Map<number, { id: string; name: string; arguments: string }>
): ParsedToolCall[] {
  const result: ParsedToolCall[] = []
  for (const [, acc] of accumulators) {
    try {
      const args = JSON.parse(acc.arguments || '{}')
      result.push({
        id: acc.id,
        name: acc.name,
        arguments: args,
      })
    } catch {
      console.error('Failed to parse tool call arguments:', acc.arguments)
    }
  }
  accumulators.clear()
  return result
}

/**
 * 创建一个可取消的 AI 请求
 */
export function createAIRequest() {
  let controller: AbortController | null = null

  return {
    send: (options: Omit<StreamOptions, 'signal'>) => {
      controller?.abort()
      controller = new AbortController()
      return fetchSSE({ ...options, signal: controller.signal })
    },
    cancel: () => {
      controller?.abort()
      controller = null
    },
  }
}
