'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createDeal } from '@/app/actions/deals'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { ArrowLeft } from 'lucide-react'

export default function NewDealPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await createDeal(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/dashboard/deals')
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/deals">
          <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4" /></Button>
        </Link>
        <h1 className="text-2xl font-bold text-neutral-900">案件追加</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border border-neutral-200 rounded-xl p-6 space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="title">案件名 *</Label>
          <Input id="title" name="title" required placeholder="Web制作プロジェクト" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="value">金額</Label>
            <Input id="value" name="value" type="number" defaultValue="0" min="0" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency">通貨</Label>
            <Input id="currency" name="currency" defaultValue="JPY" maxLength={3} />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="stage">ステージ</Label>
            <select id="stage" name="stage" defaultValue="lead" className="w-full rounded-md border border-neutral-200 px-3 py-2 text-sm">
              <option value="lead">リード</option>
              <option value="qualified">見込み</option>
              <option value="proposal">提案</option>
              <option value="negotiation">交渉</option>
              <option value="closed_won">受注</option>
              <option value="closed_lost">失注</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="probability">確度（%）</Label>
            <Input id="probability" name="probability" type="number" defaultValue="0" min="0" max="100" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expected_close_date">クローズ予定日</Label>
          <Input id="expected_close_date" name="expected_close_date" type="date" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">メモ</Label>
          <Textarea id="notes" name="notes" rows={3} placeholder="案件に関するメモ..." />
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : '案件を保存'}
          </Button>
          <Link href="/dashboard/deals">
            <Button type="button" variant="outline">キャンセル</Button>
          </Link>
        </div>
      </form>
    </div>
  )
}
