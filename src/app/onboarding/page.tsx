'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createOrganization } from '@/app/actions/organizations'
import { createDeal } from '@/app/actions/deals'
import { createContact } from '@/app/actions/contacts'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Users, Building2, BarChart3, Check } from 'lucide-react'

type Step = 'org' | 'contact' | 'deal' | 'done'

const STEPS: { key: Step; label: string; icon: typeof Users }[] = [
  { key: 'org', label: '組織設定', icon: Building2 },
  { key: 'contact', label: 'コンタクト追加', icon: Users },
  { key: 'deal', label: '案件追加', icon: BarChart3 },
  { key: 'done', label: '完了', icon: Check },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>('org')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const currentIdx = STEPS.findIndex((s) => s.key === step)

  async function handleOrgSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await createOrganization(new FormData(e.currentTarget))
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setStep('contact')
    }
  }

  async function handleContactSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await createContact(new FormData(e.currentTarget))
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setStep('deal')
    }
  }

  async function handleDealSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const result = await createDeal(new FormData(e.currentTarget))
    setLoading(false)
    if (result?.error) {
      setError(result.error)
    } else {
      setStep('done')
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-7 h-7 bg-neutral-900 rounded flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-neutral-900">CRM Lite</span>
        </div>

        {/* Step indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const isDone = i < currentIdx
            const isCurrent = s.key === step
            return (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                    isDone
                      ? 'bg-green-500 text-white'
                      : isCurrent
                        ? 'bg-neutral-900 text-white'
                        : 'bg-neutral-200 text-neutral-500'
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : i + 1}
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={`w-8 h-px ${isDone ? 'bg-green-500' : 'bg-neutral-200'}`}
                  />
                )}
              </div>
            )
          })}
        </div>

        {/* Step content */}
        {step === 'org' && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-8">
            <h1 className="text-xl font-bold text-neutral-900 mb-1">
              組織を設定する
            </h1>
            <p className="text-sm text-neutral-500 mb-6">
              まずはCRMで使う組織名を設定してください。
            </p>
            <form onSubmit={handleOrgSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="name">組織名 *</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="株式会社サンプル"
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="industry">業種</Label>
                <Input
                  id="industry"
                  name="industry"
                  placeholder="IT / 製造業 / サービス業"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="website">Webサイト</Label>
                <Input
                  id="website"
                  name="website"
                  type="url"
                  placeholder="https://example.com"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? '保存中...' : '次へ →'}
              </Button>
            </form>
          </div>
        )}

        {step === 'contact' && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-8">
            <h1 className="text-xl font-bold text-neutral-900 mb-1">
              最初のコンタクトを追加
            </h1>
            <p className="text-sm text-neutral-500 mb-6">
              営業先の担当者情報を入力してください。後からでも追加できます。
            </p>
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="last_name">姓 *</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    required
                    placeholder="山田"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="first_name">名 *</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    required
                    placeholder="太郎"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="yamada@example.com"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="company">会社名</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="株式会社サンプル"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="position">役職</Label>
                  <Input
                    id="position"
                    name="position"
                    placeholder="代表取締役"
                  />
                </div>
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? '保存中...' : '次へ →'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('deal')}
                >
                  スキップ
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 'deal' && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-8">
            <h1 className="text-xl font-bold text-neutral-900 mb-1">
              最初の案件を追加
            </h1>
            <p className="text-sm text-neutral-500 mb-6">
              進行中の商談を追加してください。後からでも追加できます。
            </p>
            <form onSubmit={handleDealSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">案件名 *</Label>
                <Input
                  id="title"
                  name="title"
                  required
                  placeholder="○○社 CRMシステム導入"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="value">金額</Label>
                  <Input
                    id="value"
                    name="value"
                    type="number"
                    min="0"
                    placeholder="1000000"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="probability">確度 (%)</Label>
                  <Input
                    id="probability"
                    name="probability"
                    type="number"
                    min="0"
                    max="100"
                    defaultValue="50"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="expected_close_date">クローズ予定日</Label>
                <Input
                  id="expected_close_date"
                  name="expected_close_date"
                  type="date"
                />
              </div>
              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}
              <div className="flex gap-3">
                <Button type="submit" className="flex-1" disabled={loading}>
                  {loading ? '保存中...' : '次へ →'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('done')}
                >
                  スキップ
                </Button>
              </div>
            </form>
          </div>
        )}

        {step === 'done' && (
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-neutral-900 mb-2">
              セットアップ完了！
            </h1>
            <p className="text-sm text-neutral-500 mb-6">
              CRM Liteの準備が整いました。ダッシュボードから営業活動を管理しましょう。
            </p>
            <Button className="w-full" onClick={() => router.push('/dashboard')}>
              ダッシュボードへ
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
