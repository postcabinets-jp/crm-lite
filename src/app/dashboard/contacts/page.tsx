import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Search } from 'lucide-react'
import type { Contact } from '@/lib/supabase/types'

export const metadata = { title: 'コンタクト — CRM Lite' }

const statusLabels: Record<string, string> = {
  lead: 'リード',
  prospect: '見込み',
  customer: '顧客',
  churned: '解約',
}

const statusColors: Record<string, string> = {
  lead: 'bg-blue-50 text-blue-700 border-blue-200',
  prospect: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  customer: 'bg-green-50 text-green-700 border-green-200',
  churned: 'bg-neutral-100 text-neutral-500 border-neutral-200',
}

export default async function ContactsPage() {
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

  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .eq('org_id', org.id)
    .order('created_at', { ascending: false }) as { data: Contact[] | null }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">コンタクト</h1>
        <Link href="/dashboard/contacts/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            追加
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {(contacts?.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Search className="w-10 h-10 text-neutral-300 mb-3" />
            <p className="text-sm text-neutral-500">コンタクトがまだありません</p>
            <Link href="/dashboard/contacts/new" className="mt-2 text-sm text-blue-600 hover:underline">
              最初のコンタクトを追加
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">名前</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">会社</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">メール</th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">ステータス</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {contacts!.map((contact) => (
                <tr key={contact.id} className="hover:bg-neutral-50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/dashboard/contacts/${contact.id}`} className="font-medium text-neutral-900 hover:text-blue-600">
                      {contact.last_name} {contact.first_name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{contact.company ?? '-'}</td>
                  <td className="px-4 py-3 text-neutral-500">{contact.email ?? '-'}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={statusColors[contact.status]}>
                      {statusLabels[contact.status]}
                    </Badge>
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
