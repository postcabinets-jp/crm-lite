'use client'

import { useState } from 'react'
import { updatePassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function UpdatePasswordPage() {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await updatePassword(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-2xl shadow-sm border border-neutral-200">
        <div className="mb-8">
          <span className="text-sm font-semibold tracking-tight text-neutral-900">CRM Lite</span>
          <h1 className="mt-6 text-2xl font-bold text-neutral-900">新しいパスワードを設定</h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password">新しいパスワード</Label>
            <Input id="password" name="password" type="password" required minLength={8} placeholder="8文字以上" />
          </div>
          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? '更新中...' : 'パスワードを更新'}
          </Button>
        </form>
      </div>
    </div>
  )
}
