import { createClient } from '@/lib/supabase/server'
import { Users, BarChart3, Activity, TrendingUp } from 'lucide-react'
import type { Deal, Contact, Activity as ActivityType } from '@/lib/supabase/types'

export const metadata = { title: 'ダッシュボード — CRM Lite' }

export default async function DashboardPage() {
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
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <Users className="w-12 h-12 text-neutral-300 mb-4" />
        <h2 className="text-xl font-semibold text-neutral-900 mb-2">組織を作成しましょう</h2>
        <p className="text-sm text-neutral-500 mb-4">設定ページから組織を作成してCRMを使い始めましょう。</p>
        <a href="/dashboard/settings" className="text-sm text-blue-600 hover:underline">設定へ移動</a>
      </div>
    )
  }

  const [
    { data: contacts },
    { data: deals },
    { data: activities },
  ] = await Promise.all([
    supabase.from('contacts').select('*').eq('org_id', org.id).order('created_at', { ascending: false }) as unknown as Promise<{ data: Contact[] | null }>,
    supabase.from('deals').select('*').eq('org_id', org.id).order('created_at', { ascending: false }) as unknown as Promise<{ data: Deal[] | null }>,
    supabase.from('activities').select('*').eq('org_id', org.id).order('created_at', { ascending: false }).limit(10) as unknown as Promise<{ data: ActivityType[] | null }>,
  ])

  const allDeals = deals ?? []
  const totalValue = allDeals.reduce((sum, d) => sum + d.value, 0)
  const wonDeals = allDeals.filter(d => d.stage === 'closed_won')
  const wonValue = wonDeals.reduce((sum, d) => sum + d.value, 0)

  const stages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const
  const stageLabels: Record<string, string> = {
    lead: 'リード',
    qualified: '見込み',
    proposal: '提案',
    negotiation: '交渉',
    closed_won: '受注',
    closed_lost: '失注',
  }

  const formatCurrency = (v: number) => `¥${v.toLocaleString()}`

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">ダッシュボード</h1>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-neutral-400" />
            <span className="text-xs text-neutral-500">コンタクト数</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{contacts?.length ?? 0}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-neutral-400" />
            <span className="text-xs text-neutral-500">案件数</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{allDeals.length}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-neutral-400" />
            <span className="text-xs text-neutral-500">パイプライン合計</span>
          </div>
          <p className="text-2xl font-bold text-neutral-900">{formatCurrency(totalValue)}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-neutral-400" />
            <span className="text-xs text-neutral-500">受注金額</span>
          </div>
          <p className="text-2xl font-bold text-green-700">{formatCurrency(wonValue)}</p>
        </div>
      </div>

      {/* Pipeline Summary */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="font-semibold text-neutral-900 mb-4">パイプライン概要</h2>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {stages.map((stage) => {
            const stageDeals = allDeals.filter(d => d.stage === stage)
            const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0)
            return (
              <div key={stage} className="border border-neutral-100 rounded-lg p-3">
                <p className="text-xs text-neutral-500 mb-1">{stageLabels[stage]}</p>
                <p className="text-lg font-bold text-neutral-900">{stageDeals.length}件</p>
                <p className="text-xs text-neutral-400 mt-0.5">{formatCurrency(stageValue)}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5">
        <h2 className="font-semibold text-neutral-900 mb-4">最近のアクティビティ</h2>
        {(activities?.length ?? 0) === 0 ? (
          <p className="text-sm text-neutral-400">アクティビティがありません</p>
        ) : (
          <div className="space-y-2">
            {activities!.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Activity className="w-4 h-4 text-neutral-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{a.title}</p>
                  <p className="text-xs text-neutral-400">{a.type} • {new Date(a.created_at).toLocaleDateString('ja-JP')}</p>
                </div>
                {a.completed && (
                  <span className="text-xs text-green-600 bg-green-50 border border-green-200 rounded px-1.5 py-0.5">完了</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
