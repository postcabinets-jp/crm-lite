import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Mail, Plus, PlayCircle, PauseCircle, FileText } from 'lucide-react'

export const metadata = { title: 'シーケンス — CRM Lite' }

// Simplified sequence type (not yet in DB schema, shown as coming soon MVP)
interface SequenceRow {
  id: string
  name: string
  status: 'draft' | 'active' | 'paused'
  steps: number
  enrolled: number
  open_rate: number
  created_at: string
}

const STATUS_CONFIG = {
  active: {
    label: 'アクティブ',
    cls: 'bg-green-50 text-green-700 border-green-200',
    icon: PlayCircle,
  },
  paused: {
    label: '一時停止',
    cls: 'bg-yellow-50 text-yellow-700 border-yellow-200',
    icon: PauseCircle,
  },
  draft: {
    label: 'ドラフト',
    cls: 'bg-neutral-100 text-neutral-500 border-neutral-200',
    icon: FileText,
  },
} as const

// Demo data shown until the sequences table exists in the DB
const DEMO_SEQUENCES: SequenceRow[] = [
  {
    id: 'demo-1',
    name: '初回アウトバウンド — IT企業向け',
    status: 'active',
    steps: 5,
    enrolled: 24,
    open_rate: 42,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-2',
    name: '展示会フォローアップ',
    status: 'active',
    steps: 3,
    enrolled: 11,
    open_rate: 61,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-3',
    name: '失注再アプローチ（90日後）',
    status: 'paused',
    steps: 4,
    enrolled: 8,
    open_rate: 38,
    created_at: new Date().toISOString(),
  },
  {
    id: 'demo-4',
    name: 'ウェビナー後フォローアップ',
    status: 'draft',
    steps: 2,
    enrolled: 0,
    open_rate: 0,
    created_at: new Date().toISOString(),
  },
]

export default async function SequencesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  // Try to fetch real sequences; fall back to demo data for now
  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  const sequences: SequenceRow[] = DEMO_SEQUENCES

  const activeCount = sequences.filter((s) => s.status === 'active').length
  const totalEnrolled = sequences.reduce((s, seq) => s + seq.enrolled, 0)
  const avgOpenRate =
    sequences.filter((s) => s.enrolled > 0).length > 0
      ? Math.round(
          sequences
            .filter((s) => s.enrolled > 0)
            .reduce((s, seq) => s + seq.open_rate, 0) /
            sequences.filter((s) => s.enrolled > 0).length,
        )
      : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">シーケンス</h1>
          <p className="text-sm text-neutral-500 mt-0.5">
            自動メールフォローアップの管理
          </p>
        </div>
        <Button size="sm" disabled>
          <Plus className="w-4 h-4 mr-1" />
          新規作成
          <span className="ml-1.5 text-xs opacity-60">(近日公開)</span>
        </Button>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">アクティブ</p>
          <p className="text-2xl font-bold text-green-700">{activeCount}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">登録コンタクト数</p>
          <p className="text-2xl font-bold text-neutral-900">{totalEnrolled}</p>
        </div>
        <div className="bg-white border border-neutral-200 rounded-xl p-4">
          <p className="text-xs text-neutral-500 mb-1">平均開封率</p>
          <p className="text-2xl font-bold text-blue-700">{avgOpenRate}%</p>
        </div>
      </div>

      {/* Notice banner */}
      {!org && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-sm text-yellow-700">
          組織を作成するとシーケンス機能が使えるようになります。
        </div>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-700">
        シーケンス機能はPhase 2で実装予定です。上記はデモデータです。Resend連携後にメール配信が有効になります。
      </div>

      {/* Sequence list */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-neutral-500">
                シーケンス名
              </th>
              <th className="text-left px-4 py-3 font-medium text-neutral-500">
                ステータス
              </th>
              <th className="text-right px-4 py-3 font-medium text-neutral-500">
                ステップ数
              </th>
              <th className="text-right px-4 py-3 font-medium text-neutral-500">
                登録数
              </th>
              <th className="text-right px-4 py-3 font-medium text-neutral-500">
                開封率
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {sequences.map((seq) => {
              const cfg = STATUS_CONFIG[seq.status]
              const Icon = cfg.icon
              return (
                <tr
                  key={seq.id}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span className="font-medium text-neutral-900">
                        {seq.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`gap-1 ${cfg.cls}`}
                    >
                      <Icon className="w-3 h-3" />
                      {cfg.label}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-500">
                    {seq.steps}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-700 font-medium">
                    {seq.enrolled}
                  </td>
                  <td className="px-4 py-3 text-right text-neutral-500">
                    {seq.enrolled > 0 ? `${seq.open_rate}%` : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
