import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Plus, Building2 } from 'lucide-react'
import type { Company } from '@/lib/supabase/types'

export const metadata = { title: '会社 — CRM Lite' }

export default async function CompaniesPage() {
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

  const { data: companies } = (await supabase
    .from('companies')
    .select('*')
    .eq('org_id', org.id)
    .order('name', { ascending: true })) as { data: Company[] | null }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900">会社</h1>
        <Link href="/dashboard/companies/new">
          <Button size="sm">
            <Plus className="w-4 h-4 mr-1" />
            追加
          </Button>
        </Link>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
        {(companies?.length ?? 0) === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Building2 className="w-10 h-10 text-neutral-300 mb-3" />
            <p className="text-sm text-neutral-500">会社がまだありません</p>
            <Link
              href="/dashboard/companies/new"
              className="mt-2 text-sm text-blue-600 hover:underline"
            >
              最初の会社を追加
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">
                  会社名
                </th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">
                  業種
                </th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">
                  ドメイン
                </th>
                <th className="text-left px-4 py-3 font-medium text-neutral-500">
                  従業員数
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {companies!.map((company) => (
                <tr
                  key={company.id}
                  className="hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/companies/${company.id}`}
                      className="font-medium text-neutral-900 hover:text-blue-600"
                    >
                      {company.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {company.industry ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {company.domain ? (
                      <a
                        href={`https://${company.domain}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600"
                      >
                        {company.domain}
                      </a>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">
                    {company.employee_count != null
                      ? company.employee_count.toLocaleString() + '人'
                      : '-'}
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
