import Link from 'next/link'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata = { title: '新規登録 — CRM Lite' }

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="w-full max-w-md px-8 py-10 bg-white rounded-2xl shadow-sm border border-neutral-200">
        <div className="mb-8">
          <Link href="/" className="text-sm font-semibold tracking-tight text-neutral-900">
            CRM Lite
          </Link>
          <h1 className="mt-6 text-2xl font-bold text-neutral-900">アカウント作成</h1>
          <p className="mt-1 text-sm text-neutral-500">
            すでにアカウントをお持ちの方は{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              ログイン
            </Link>
          </p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
