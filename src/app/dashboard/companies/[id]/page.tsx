import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Globe, Users, Building2, Activity } from 'lucide-react'
import type { Company, Contact, Deal, Activity as ActivityType } from '@/lib/supabase/types'

export const metadata = { title: '会社詳細 — CRM Lite' }

const stageLabels: Record<string, string> = {
  lead: 'リード',
  qualified: '見込み',
  proposal: '提案',
  negotiation: '交渉',
  closed_won: '受注',
  closed_lost: '失注',
}

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
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
  if (!org) return notFound()

  const { data: company } = (await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .eq('org_id', org.id)
    .single()) as { data: Company | null }

  if (!company) return notFound()

  // Contacts that reference this company by name (best-effort without FK)
  const { data: contacts } = (await supabase
    .from('contacts')
    .select('*')
    .eq('org_id', org.id)
    .ilike('company', company.name)
    .order('created_at', { ascending: false })
    .limit(20)) as { data: Contact[] | null }

  // Deals linked to contacts at this company
  const contactIds = (contacts ?? []).map((c) => c.id)
  const { data: deals } =
    contactIds.length > 0
      ? ((await supabase
          .from('deals')
          .select('*')
          .eq('org_id', org.id)
          .in('contact_id', contactIds)
          .order('created_at', { ascending: false })
          .limit(20)) as { data: Deal[] | null })
      : { data: [] as Deal[] }

  // Recent activities linked to this company's contacts
  const { data: activities } =
    contactIds.length > 0
      ? ((await supabase
          .from('activities')
          .select('*')
          .eq('org_id', org.id)
          .in('contact_id', contactIds)
          .order('created_at', { ascending: false })
          .limit(10)) as { data: ActivityType[] | null })
      : { data: [] as ActivityType[] }

  const totalDealValue = (deals ?? []).reduce((s, d) => s + d.value, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/companies">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-neutral-100 rounded-lg flex items-center justify-center">
            <Building2 className="w-5 h-5 text-neutral-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">
              {company.name}
            </h1>
            {company.industry && (
              <p className="text-sm text-neutral-500">{company.industry}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Company info */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
          <h2 className="font-semibold text-neutral-900">会社情報</h2>
          <div className="space-y-3 text-sm">
            {company.domain && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-neutral-400" />
                <a
                  href={`https://${company.domain}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {company.domain}
                </a>
              </div>
            )}
            {company.employee_count != null && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-neutral-400" />
                <span className="text-neutral-700">
                  {company.employee_count.toLocaleString()}人
                </span>
              </div>
            )}
            {company.website_url && (
              <div>
                <p className="text-xs text-neutral-400 mb-0.5">Webサイト</p>
                <a
                  href={company.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline break-all"
                >
                  {company.website_url}
                </a>
              </div>
            )}
            {company.notes && (
              <div className="pt-3 border-t border-neutral-100">
                <p className="text-xs text-neutral-400 mb-1">メモ</p>
                <p className="text-neutral-600 whitespace-pre-wrap">
                  {company.notes}
                </p>
              </div>
            )}
          </div>

          {/* KPI summary */}
          <div className="pt-3 border-t border-neutral-100 grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-neutral-400">コンタクト</p>
              <p className="text-lg font-bold text-neutral-900">
                {(contacts ?? []).length}
              </p>
            </div>
            <div>
              <p className="text-xs text-neutral-400">案件合計</p>
              <p className="text-lg font-bold text-neutral-900">
                ¥{totalDealValue.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          {/* Contacts */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="font-semibold text-neutral-900 mb-3">
              コンタクト ({(contacts ?? []).length})
            </h2>
            {(contacts ?? []).length === 0 ? (
              <p className="text-sm text-neutral-400">コンタクトなし</p>
            ) : (
              <div className="space-y-1">
                {contacts!.map((c) => (
                  <Link
                    key={c.id}
                    href={`/dashboard/contacts/${c.id}`}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="w-7 h-7 bg-neutral-100 rounded-full flex items-center justify-center text-xs font-medium text-neutral-600">
                      {c.last_name?.[0] ?? c.first_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {c.last_name} {c.first_name}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {c.position ?? c.email ?? ''}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Deals */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="font-semibold text-neutral-900 mb-3">
              案件 ({(deals ?? []).length})
            </h2>
            {(deals ?? []).length === 0 ? (
              <p className="text-sm text-neutral-400">案件なし</p>
            ) : (
              <div className="space-y-2">
                {deals!.map((d) => (
                  <Link
                    key={d.id}
                    href={`/dashboard/deals/${d.id}`}
                    className="flex items-center gap-3 py-2 border-b border-neutral-50 last:border-0 hover:bg-neutral-50 px-2 rounded transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {d.title}
                      </p>
                      <p className="text-xs text-neutral-400">
                        ¥{d.value.toLocaleString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs shrink-0">
                      {stageLabels[d.stage] ?? d.stage}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Activities */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5">
            <h2 className="font-semibold text-neutral-900 mb-3">
              最近のアクティビティ
            </h2>
            {(activities ?? []).length === 0 ? (
              <p className="text-sm text-neutral-400">アクティビティなし</p>
            ) : (
              <div className="space-y-2">
                {activities!.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-start gap-3 py-2 border-b border-neutral-50 last:border-0"
                  >
                    <div className="w-7 h-7 bg-neutral-100 rounded flex items-center justify-center mt-0.5">
                      <Activity className="w-3.5 h-3.5 text-neutral-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-neutral-900">{a.title}</p>
                      <p className="text-xs text-neutral-400">
                        {a.type} •{' '}
                        {new Date(a.created_at).toLocaleDateString('ja-JP')}
                      </p>
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
