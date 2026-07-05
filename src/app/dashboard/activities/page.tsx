import { createClient } from '@/lib/supabase/server'
import { Activity, Phone, Mail, Calendar, FileText, CheckSquare } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Activity as ActivityType } from '@/lib/supabase/types'

export const metadata = { title: 'アクティビティ — CRM Lite' }

const typeIcons: Record<string, typeof Phone> = {
  call: Phone,
  email: Mail,
  meeting: Calendar,
  note: FileText,
  task: CheckSquare,
}

const typeLabels: Record<string, string> = {
  call: '電話', email: 'メール', meeting: '会議', note: 'メモ', task: 'タスク',
}

export default async function ActivitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  if (!org) {
    return (
      <div className="text-center py-20">
        <p className="text-neutral-500">先に設定ページから組織を作成してください。</p>
      </div>
    )
  }

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false }) as { data: ActivityType[] | null }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-neutral-900">アクティビティ</h1>

      <div className="bg-white border border-neutral-200 rounded-xl">
        {(activities?.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Activity className="w-10 h-10 text-neutral-300 mb-3" />
            <p className="text-sm text-neutral-500">アクティビティがまだありません</p>
          </div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {activities!.map((a) => {
              const Icon = typeIcons[a.type] || Activity
              return (
                <div key={a.id} className="flex items-start gap-3 px-5 py-4">
                  <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-neutral-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-medium text-neutral-900">{a.title}</p>
                      <Badge variant="secondary" className="text-xs">{typeLabels[a.type]}</Badge>
                      {a.completed && (
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">完了</Badge>
                      )}
                    </div>
                    {a.description && (
                      <p className="text-sm text-neutral-500 mt-1">{a.description}</p>
                    )}
                    <p className="text-xs text-neutral-400 mt-1">
                      {new Date(a.created_at).toLocaleDateString('ja-JP')}
                      {a.scheduled_at && ` • 予定: ${new Date(a.scheduled_at).toLocaleDateString('ja-JP')}`}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
