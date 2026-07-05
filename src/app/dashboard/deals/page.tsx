import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, BarChart3 } from 'lucide-react'
import type { Deal } from '@/lib/supabase/types'

export const metadata = { title: '案件 — CRM Lite' }

const stageLabels: Record<string, string> = {
  lead: 'リード', qualified: '見込み', proposal: '提案', negotiation: '交渉', closed_won: '受注', closed_lost: '失注',
}

const stageColors: Record<string, string> = {
  lead: 'bg-blue-50 text-blue-700 border-blue-200',
  qualified: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  proposal: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  negotiation: 'bg-orange-50 text-orange-700 border-orange-200',
  closed_won: 'bg-green-50 text-green-700 border-green-200',
  closed_lost: 'bg-neutral-100 text-neutral-500 border-neutral-200',
}

export default async function DealsPage() {
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

  const { data: deals } = await supabase
    .from('deals')
    .select('*')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false }) as { data: Deal[] | null }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">案件</h1>
        <Link href="/dashboard/deals/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            追加
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {(deals?.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <BarChart3 className="w-10 h-10 text-neutral-300 mb-3" />
            <p className="text-sm text-neutral-500">案件がまだありません</p>
            <Link href="/dashboard/deals/new" className="mt-2 text-sm text-blue-600 hover:underline">
              最初の案件を追加
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">案件名</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">金額</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">ステージ</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">確度</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">クローズ予定</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {deals!.map((deal) => (
                <tr key={deal.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/deals/${deal.id}`} className="font-medium text-neutral-900 hover:text-blue-600">
                      {deal.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-700 font-medium">
                    ¥{deal.value.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={stageColors[deal.stage]}>
                      {stageLabels[deal.stage]}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{deal.probability}%</td>
                  <td className="px-4 py-3 text-neutral-500">
                    {deal.expected_close_date ? new Date(deal.expected_close_date).toLocaleDateString('ja-JP') : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
