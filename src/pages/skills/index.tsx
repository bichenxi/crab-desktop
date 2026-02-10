import { useEffect } from 'react'
import { ArrowLeft, Puzzle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { getAllSkills } from '@/skills/registry'
import { useSkillsStore } from '@/stores/skills'
import { cn } from '@/lib/utils'

export default function SkillsPage() {
  const navigate = useNavigate()
  const skills = getAllSkills()
  const { enabledSkillIds, setEnabled, isEnabled, initFromAllIds, setEnabledIds } = useSkillsStore()

  useEffect(() => {
    initFromAllIds(skills.map((s) => s.id))
  }, []) // 首次进入时若为“全部启用”则写入当前全部 id，便于后续单独关闭

  const enabledCount = enabledSkillIds.includes('__none__')
    ? 0
    : enabledSkillIds.length === 0
      ? skills.length
      : enabledSkillIds.filter((id) => skills.some((s) => s.id === id)).length
  const isAllEnabled = enabledCount === skills.length

  const handleEnableAll = () => {
    setEnabledIds(skills.map((s) => s.id))
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-xl hover:bg-white/50 text-gray-500"
          >
            <ArrowLeft size={20} />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">技能管理</h1>
            <p className="text-sm text-gray-500 mt-1">选择对话中可供 AI 使用的工具，关闭后 AI 将无法调用该能力</p>
          </div>
        </div>

        <Separator className="dark:bg-white/10" />

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Puzzle size={20} className="text-primary" />
                  已安装技能
                </CardTitle>
                <CardDescription>
                  已启用 {enabledCount} / {skills.length} 项，对话中将只使用已启用的技能
                </CardDescription>
              </div>
              {!isAllEnabled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleEnableAll}
                  className="shrink-0"
                >
                  全部开启
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-1">
            {skills.map((skill) => {
              const enabled = enabledSkillIds.includes('__none__')
                ? false
                : enabledSkillIds.length === 0
                  ? true
                  : enabledSkillIds.includes(skill.id)
              const isBuiltin = skill.id.startsWith('builtin/')
              return (
                <div
                  key={skill.id}
                  className={cn(
                    'flex items-start gap-4 rounded-xl p-4 transition-colors',
                    'hover:bg-black/[0.02] dark:hover:bg-white/[0.02]'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-gray-100">{skill.name}</span>
                      {isBuiltin && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">内置</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{skill.description}</p>
                    <p className="text-xs text-gray-400 mt-1 font-mono">{skill.id}</p>
                  </div>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => setEnabled(skill.id, checked)}
                    className="shrink-0"
                  />
                </div>
              )
            })}
          </CardContent>
        </Card>

        <p className="text-xs text-gray-400 text-center">
          关闭某项技能后，AI 将无法在对话中调用该工具；设置会自动保存
        </p>
      </div>
    </div>
  )
}
