import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SkillsState {
  /** 已启用的技能 id 列表；空数组表示“全部启用”（兼容旧行为） */
  enabledSkillIds: string[]
  setEnabled: (skillId: string, enabled: boolean) => void
  setEnabledIds: (ids: string[]) => void
  isEnabled: (skillId: string) => boolean
  /** 初始化：若当前为“全部启用”，则填入所有 id 以便后续可单独关闭 */
  initFromAllIds: (allIds: string[]) => void
}

export const useSkillsStore = create<SkillsState>()(
  persist(
    (set, get) => ({
      enabledSkillIds: [],

      setEnabled: (skillId, enabled) => {
        set((state) => {
          let ids = state.enabledSkillIds
          if (ids.includes('__none__')) ids = []
          const hasId = ids.includes(skillId)
          if (enabled && !hasId) {
            const next = [...ids, skillId]
            return { enabledSkillIds: next }
          }
          if (!enabled && hasId) {
            const next = ids.filter((id) => id !== skillId)
            return { enabledSkillIds: next.length === 0 ? ['__none__'] : next }
          }
          return state
        })
      },

      setEnabledIds: (ids) => set({ enabledSkillIds: ids }),

      isEnabled: (skillId) => {
        const ids = get().enabledSkillIds
        if (ids.includes('__none__')) return false
        return ids.length === 0 || ids.includes(skillId)
      },

      initFromAllIds: (allIds) => {
        const { enabledSkillIds } = get()
        if (enabledSkillIds.length === 0 && allIds.length > 0) {
          set({ enabledSkillIds: [...allIds] })
        }
      },
    }),
    {
      name: 'skills-enabled',
      version: 1,
      storage: createJSONStorage(() => localStorage),
    }
  )
)
