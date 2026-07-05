'use client'

import { useState } from 'react'
import { createOrganization, updateOrganization } from '@/app/actions/organizations'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreateOrg(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)
    const result = await createOrganization(new FormData(e.currentTarget))
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.success)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-5 h-5 text-neutral-400" />
        <h1 className="text-2xl font-bold text-neutral-900">設定</h1>
      </div>

      <div className="bg-white border border-neutral-200 rounded-xl p-6">
        <h2 className="font-semibold text-neutral-900 mb-4">組織設定</h2>
        <form onSubmit={handleCreateOrg} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">組織名 *</Label>
            <Input id="name" name="name" required placeholder="株式会社サンプル" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="industry">業種</Label>
            <Input id="industry" name="industry" placeholder="IT / 製造業 / サービス業" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="website">Webサイト</Label>
            <Input id="website" name="website" type="url" placeholder="https://example.com" />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
          )}
          {success && (
            <p className="text-sm text-green-700 bg-green-50 border border-green-100 rounded-lg px-3 py-2">{success}</p>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? '保存中...' : '組織を作成'}
          </Button>
        </form>
      </div>
    </div>
  )
}
