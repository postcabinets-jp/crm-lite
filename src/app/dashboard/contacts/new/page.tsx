'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createContact } from '@/app/actions/contacts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'

export default function NewContactPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await createContact(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard/contacts')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/contacts">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">コンタクト追加</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="last_name">姓 *</Label>
            <Input id="last_name" name="last_name" required placeholder="山田" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="first_name">名 *</Label>
            <Input id="first_name" name="first_name" required placeholder="太郎" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" name="email" type="email" placeholder="yamada@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="phone">電話番号</Label>
            <Input id="phone" name="phone" placeholder="090-1234-5678" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="company">会社名</Label>
            <Input id="company" name="company" placeholder="株式会社サンプル" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="position">役職</Label>
            <Input id="position" name="position" placeholder="代表取締役" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="status">ステータス</Label>
          <select id="status" name="status" defaultValue="lead" className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm">
            <option value="lead">リード</option>
            <option value="prospect">見込み</option>
            <option value="customer">顧客</option>
            <option value="churned">解約</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tags">タグ（カンマ区切り）</Label>
          <Input id="tags" name="tags" placeholder="VIP, 大阪, IT" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">メモ</Label>
          <Textarea id="notes" name="notes" rows={3} placeholder="メモを入力..." />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : 'コンタクトを保存'}
          </Button>
          <Link href="/dashboard/contacts">
            <Button type="button" variant="outline">キャンセル</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
