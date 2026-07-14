'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createCompany } from '@/app/actions/companies'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'

export default function NewCompanyPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await createCompany(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard/companies')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/companies">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">会社追加</h1>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="name">会社名 *</Label>
          <Input
            id="name"
            name="name"
            required
            placeholder="株式会社サンプル"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="domain">ドメイン</Label>
            <Input
              id="domain"
              name="domain"
              placeholder="example.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="industry">業種</Label>
            <Input
              id="industry"
              name="industry"
              placeholder="IT / 製造業 / 小売"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="employee_count">従業員数</Label>
            <Input
              id="employee_count"
              name="employee_count"
              type="number"
              min="0"
              placeholder="100"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website_url">Webサイト</Label>
            <Input
              id="website_url"
              name="website_url"
              type="url"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="notes">メモ</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            placeholder="メモを入力..."
          />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : '会社を保存'}
          </Button>
          <Link href="/dashboard/companies">
            <Button type="button" variant="outline">
              キャンセル
            </Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
