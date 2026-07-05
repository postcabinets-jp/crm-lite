import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Mail, Phone, Building2, Briefcase, Activity } from 'lucide-react'
import type { Contact, Deal, Activity as ActivityType } from '@/lib/supabase/types'

export const metadata = { title: 'コンタクト詳細 — CRM Lite' }

const statusLabels: Record<string, string> = {
  lead: 'リード', prospect: '見込み', customer: '顧客', churned: '解約',
}
const stageLabels: Record<string, string> = {
  lead: 'リード', qualified: '見込み', proposal: '提案', negotiation: '交渉', closed_won: '受注', closed_lost: '失注',
}

export default async function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: contact } = await supabase
    .from('contacts')
    .select('*')
    .eq('id', id)
    .eq('org_id', org.id)
    .single() as { data: Contact | null }

  if (!contact) return notFound()

  const [{ data: deals }, { data: activities }] = await Promise.all([
    supabase.from('deals').select('*').eq('contact_id', contact.id).order('created_at', { ascending: false }) as unknown as Promise<{ data: Deal[] | null }>,
    supabase.from('activities').select('*').eq('contact_id', contact.id).order('created_at', { ascending: false }) as unknown as Promise<{ data: ActivityType[] | null }>,
  ])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/contacts">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">
          {contact.last_name} {contact.first_name}
        </h1>
        <Badge variant="outline">{statusLabels[contact.status]}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Contact Info */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 lg:col-span-1">
          <h2 className="font-semibold text-neutral-900 mb-4">基本情報</h2>
          <div className="space-y-3 text-sm">
            {contact.email && (
              <div className="flex items-center gap-2 text-neutral-600">
                <Mail className="w-4 h-4 text-neutral-400" />
                {contact.email}
              </div>
            )}
            {contact.phone && (
              <div className="flex items-center gap-2 text-neutral-600">
                <Phone className="w-4 h-4 text-neutral-400" />
                {contact.phone}
              </div>
            )}
            {contact.company && (
              <div className="flex items-center gap-2 text-neutral-600">
                <Building2 className="w-4 h-4 text-neutral-400" />
                {contact.company}
              </div>
            )}
            {contact.position && (
              <div className="flex items-center gap-2 text-neutral-600">
                <Briefcase className="w-4 h-4 text-neutral-400" />
                {contact.position}
              </div>
            )}
            {contact.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-2">
                {contact.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
                ))}
              </div>
            )}
            {contact.notes && (
              <div className="pt-3 border-t border-neutral-100">
                <p className="text-xs text-neutral-400 mb-1">メモ</p>
                <p className="text-neutral-600 whitespace-pre-wrap">{contact.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Deals & Activities */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="font-semibold text-neutral-900 mb-3">案件</h2>
            {(deals?.length ?? 0) === 0 ? (
              <p className="text-sm text-neutral-400">案件がありません</p>
            ) : (
              <div className="space-y-2">
                {deals!.map((deal) => (
                  <Link key={deal.id} href={`/dashboard/deals/${deal.id}`} className="flex items-center justify-between p-3 border border-neutral-100 rounded-lg hover:bg-neutral-50 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-neutral-900">{deal.title}</p>
                      <p className="text-xs text-neutral-400">{stageLabels[deal.stage]}</p>
                    </div>
                    <p className="text-sm font-semibold text-neutral-700">¥{deal.value.toLocaleString()}</p>
                  </Link>
                ))}
              </div>
            )}
          </div>

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
