import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Calendar, Activity, User } from 'lucide-react'
import type { Deal, Contact, Activity as ActivityType } from '@/lib/supabase/types'

export const metadata = { title: '案件詳細 — CRM Lite' }

const stageLabels: Record<string, string> = {
  lead: 'リード', qualified: '見込み', proposal: '提案', negotiation: '交渉', closed_won: '受注', closed_lost: '失注',
}

export default async function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single()
  if (!org) return notFound()

  const { data: deal } = await supabase
    .from('deals')
    .select('*')
    .eq('id', id)
    .eq('org_id', org.id)
    .single() as { data: Deal | null }

  if (!deal) return notFound()

  let contact: Contact | null = null
  if (deal.contact_id) {
    const { data } = await supabase
      .from('contacts')
      .select('*')
      .eq('id', deal.contact_id)
      .single() as { data: Contact | null }
    contact = data
  }

  const { data: activities } = await supabase
    .from('activities')
    .select('*')
    .eq('deal_id', deal.id)
    .order('created_at', { ascending: false }) as { data: ActivityType[] | null }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/deals">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">{deal.title}</h1>
        <Badge variant="outline">{stageLabels[deal.stage]}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 lg:col-span-1 space-y-4">
          <h2 className="font-semibold text-neutral-900">案件情報</h2>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-neutral-400">金額</p>
              <p className="text-lg font-bold text-neutral-900">¥{deal.value.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">通貨</p>
              <p className="text-neutral-700">{deal.currency}</p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">確度</p>
              <p className="text-neutral-700">{deal.probability}%</p>
            </div>
            {deal.expected_close_date && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-600">{new Date(deal.expected_close_date).toLocaleDateString('ja-JP')}</span>
              </div>
            )}
            {contact && (
              <div className="pt-3 border-t border-neutral-100">
                <p className="text-xs text-neutral-400 mb-1">コンタクト</p>
                <Link href={`/dashboard/contacts/${contact.id}`} className="flex items-center gap-2 text-blue-600 hover:underline">
                  <User className="w-4 h-4" />
                  {contact.last_name} {contact.first_name}
                </Link>
              </div>
            )}
            {deal.notes && (
              <div className="pt-3 border-t border-neutral-100">
                <p className="text-xs text-neutral-400 mb-1">メモ</p>
                <p className="text-neutral-600 whitespace-pre-wrap">{deal.notes}</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="font-semibold text-neutral-900 mb-3">アクティビティ</h2>
            {(activities?.length ?? 0) === 0 ? (
              <p className="text-sm text-neutral-400">アクティビティがありません</p>
            ) : (
              <div className="space-y-2">
                {activities!.map((a) => (
                  <div key={a.id} className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0">
                    <div className="w-7 h-7 bg-neutral-100 rounded flex items-center justify-center">
                      <Activity className="w-3.5 h-3.5 text-neutral-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-900">{a.title}</p>
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
      </div>
    </div>
  )
}
