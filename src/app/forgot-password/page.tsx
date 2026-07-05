import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const metadata = { title: 'パスワードリセット — CRM Lite' }

export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-2xl shadow-sm border border-neutral-200">
        <div className="mb-8">
          <Link href="/" className="text-sm font-semibold tracking-tight text-neutral-900">
            CRM Lite
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-neutral-900">パスワードリセット</h1>
          <p className="mt-1 text-sm text-neutral-500">
            登録済みのメールアドレスにリセットリンクをお送りします
          </p>
        </div>
        <ForgotPasswordForm />
        <p className="mt-4 text-center text-sm text-neutral-500">
          <Link href="/login" className="text-blue-600 hover:underline">
            ログインに戻る
          </Link>
        </p>
      </div>
    </div>
  )
}
