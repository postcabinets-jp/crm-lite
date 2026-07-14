import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { KanbanBoard } from '@/components/crm/kanban-board'
import { Plus } from 'lucide-react'
import type { Deal } from '@/lib/supabase/types'

export const metadata = { title: 'パイプライン — CRM Lite' }

export default async function PipelinePage() {
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

  const { data: deals } = (await supabase
    .from('deals')
    .select('*')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false })) as { data: Deal[] | null }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">パイプライン</h1>
        <Link href="/dashboard/deals/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            案件追加
          </Button>
        </Link>
      </div>
      <p className="text-sm text-neutral-500">
        カードをドラッグして案件のステージを移動できます
      </p>
      <KanbanBoard initialDeals={deals ?? []} />
    </div>
  )
}
