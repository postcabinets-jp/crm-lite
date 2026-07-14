import { createClient } from '@/lib/supabase/server'
import type { Deal, Activity } from '@/lib/supabase/types'

export const metadata = { title: 'レポート — CRM Lite' }

const STAGES = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const
const STAGE_LABELS: Record<string, string> = {
  lead: 'リード',
  qualified: '見込み',
  proposal: '提案',
  negotiation: '交渉',
  closed_won: '受注',
  closed_lost: '失注',
}

const ACTIVITY_LABELS: Record<string, string> = {
  call: '電話',
  email: 'メール',
  meeting: '会議',
  note: 'メモ',
  task: 'タスク',
}

function BarChart({
  items,
  maxVal,
  formatLabel,
  formatValue,
  colorClass,
}: {
  items: { label: string; value: number }[]
  maxVal: number
  formatLabel: (l: string) => string
  formatValue: (v: number) => string
  colorClass: string
}) {
  return (
    <div className="space-y-2.5">
      {items.map(({ label, value }) => {
        const pct = maxVal > 0 ? (value / maxVal) * 100 : 0
        return (
          <div key={label}>
            <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
              <span>{formatLabel(label)}</span>
              <span className="font-medium text-neutral-900">
                {formatValue(value)}
              </span>
            </div>
            <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${colorClass}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default async function ReportsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
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
        <p className="text-neutral-500">
          先に設定ページから組織を作成してください。
        </p>
      </div>
    )
  }

  const [{ data: deals }, { data: activities }] = await Promise.all([
    supabase
      .from('deals')
      .select('*')
      .eq('org_id', org.id) as unknown as Promise<{ data: Deal[] | null }>,
    supabase
      .from('activities')
      .select('*')
      .eq('org_id', org.id) as unknown as Promise<{ data: Activity[] | null }>,
  ])

  const allDeals = deals ?? []
  const allActivities = activities ?? []

  // ── Pipeline by stage ─────────────────────────────────────
  const pipelineByStage = STAGES.map((stage) => {
    const stageDeals = allDeals.filter((d) => d.stage === stage)
    return {
      label: stage,
      value: stageDeals.reduce((s, d) => s + d.value, 0),
      count: stageDeals.length,
    }
  })
  const maxStageValue = Math.max(...pipelineByStage.map((s) => s.value), 1)

  // ── Win / Loss rate ───────────────────────────────────────
  const closedDeals = allDeals.filter(
    (d) => d.stage === 'closed_won' || d.stage === 'closed_lost',
  )
  const wonDeals = allDeals.filter((d) => d.stage === 'closed_won')
  const winRate =
    closedDeals.length > 0
      ? Math.round((wonDeals.length / closedDeals.length) * 100)
      : 0
  const wonValue = wonDeals.reduce((s, d) => s + d.value, 0)
  const pipelineTotal = allDeals
    .filter((d) => d.stage !== 'closed_won' && d.stage !== 'closed_lost')
    .reduce((s, d) => s + d.value, 0)

  // ── Weighted forecast ─────────────────────────────────────
  const forecast = allDeals
    .filter((d) => d.stage !== 'closed_won' && d.stage !== 'closed_lost')
    .reduce((s, d) => s + d.value * (d.probability / 100), 0)

  // ── Activity breakdown ────────────────────────────────────
  const activityCounts = Object.entries(
    allActivities.reduce(
      (acc, a) => {
        acc[a.type] = (acc[a.type] ?? 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  ).map(([type, count]) => ({ label: type, value: count }))
  const maxActivityCount = Math.max(...activityCounts.map((a) => a.value), 1)

  // ── Monthly deal trend (last 6 months) ───────────────────
  const now = new Date()
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now)
    d.setMonth(d.getMonth() - (5 - i))
    const year = d.getFullYear()
    const month = d.getMonth()
    const label = `${year}/${String(month + 1).padStart(2, '0')}`
    const monthDeals = allDeals.filter((deal) => {
      const created = new Date(deal.created_at)
      return created.getFullYear() === year && created.getMonth() === month
    })
    return {
      label,
      value: monthDeals.reduce((s, deal) => s + deal.value, 0),
      count: monthDeals.length,
    }
  })
  const maxMonthlyValue = Math.max(...monthlyData.map((m) => m.value), 1)

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-neutral-900">レポート</h1>

      {/* KPI summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: '受注金額',
            value: `¥${wonValue.toLocaleString()}`,
            sub: `${wonDeals.length}件受注`,
            color: 'text-green-700',
          },
          {
            label: 'パイプライン',
            value: `¥${pipelineTotal.toLocaleString()}`,
            sub: `${allDeals.filter((d) => d.stage !== 'closed_won' && d.stage !== 'closed_lost').length}件進行中`,
            color: 'text-blue-700',
          },
          {
            label: '加重予測収益',
            value: `¥${Math.round(forecast).toLocaleString()}`,
            sub: '確度加重平均',
            color: 'text-indigo-700',
          },
          {
            label: '勝率',
            value: `${winRate}%`,
            sub: `${closedDeals.length}件クローズ済み`,
            color: winRate >= 50 ? 'text-green-700' : 'text-orange-600',
          },
        ].map(({ label, value, sub, color }) => (
          <div
            key={label}
            className="bg-white border border-neutral-200 rounded-xl p-4"
          >
            <p className="text-xs text-neutral-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-neutral-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline by stage */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <h2 className="font-semibold text-neutral-900 mb-4">
            ステージ別パイプライン金額
          </h2>
          {allDeals.length === 0 ? (
            <p className="text-sm text-neutral-400">データなし</p>
          ) : (
            <BarChart
              items={pipelineByStage.map((s) => ({
                label: s.label,
                value: s.value,
              }))}
              maxVal={maxStageValue}
              formatLabel={(l) => STAGE_LABELS[l] ?? l}
              formatValue={(v) => `¥${v.toLocaleString()}`}
              colorClass="bg-blue-500"
            />
          )}
        </div>

        {/* Monthly trend */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <h2 className="font-semibold text-neutral-900 mb-4">
            月別案件作成金額（過去6ヶ月）
          </h2>
          {allDeals.length === 0 ? (
            <p className="text-sm text-neutral-400">データなし</p>
          ) : (
            <BarChart
              items={monthlyData}
              maxVal={maxMonthlyValue}
              formatLabel={(l) => l}
              formatValue={(v) => `¥${v.toLocaleString()}`}
              colorClass="bg-indigo-500"
            />
          )}
        </div>

        {/* Activity breakdown */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <h2 className="font-semibold text-neutral-900 mb-4">
            アクティビティ内訳
          </h2>
          {allActivities.length === 0 ? (
            <p className="text-sm text-neutral-400">データなし</p>
          ) : (
            <BarChart
              items={activityCounts}
              maxVal={maxActivityCount}
              formatLabel={(l) => ACTIVITY_LABELS[l] ?? l}
              formatValue={(v) => `${v}件`}
              colorClass="bg-emerald-500"
            />
          )}
        </div>

        {/* Stage count table */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5">
          <h2 className="font-semibold text-neutral-900 mb-4">
            ステージ別案件数
          </h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100">
                <th className="text-left py-2 text-xs font-medium text-neutral-500">
                  ステージ
                </th>
                <th className="text-right py-2 text-xs font-medium text-neutral-500">
                  件数
                </th>
                <th className="text-right py-2 text-xs font-medium text-neutral-500">
                  合計金額
                </th>
                <th className="text-right py-2 text-xs font-medium text-neutral-500">
                  平均確度
                </th>
              </tr>
            </thead>
            <tbody>
              {STAGES.map((stage) => {
                const stageDeals = allDeals.filter((d) => d.stage === stage)
                const total = stageDeals.reduce((s, d) => s + d.value, 0)
                const avgProb =
                  stageDeals.length > 0
                    ? Math.round(
                        stageDeals.reduce((s, d) => s + d.probability, 0) /
                          stageDeals.length,
                      )
                    : 0
                return (
                  <tr
                    key={stage}
                    className="border-b border-neutral-50 last:border-0"
                  >
                    <td className="py-2.5 text-neutral-700">
                      {STAGE_LABELS[stage]}
                    </td>
                    <td className="py-2.5 text-right text-neutral-900 font-medium">
                      {stageDeals.length}
                    </td>
                    <td className="py-2.5 text-right text-neutral-700">
                      ¥{total.toLocaleString()}
                    </td>
                    <td className="py-2.5 text-right text-neutral-500">
                      {stageDeals.length > 0 ? `${avgProb}%` : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
