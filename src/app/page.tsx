import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Users, BarChart3, Activity, Shield, Zap, Clock } from 'lucide-react'

export const metadata = {
  title: 'CRM Lite — 小規模ビジネス向け軽量CRM',
  description: 'コンタクト・案件・アクティビティを一元管理。セルフホストで無制限に使えるOSS CRM。',
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-neutral-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-neutral-900 rounded flex items-center justify-center">
              <Users className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-sm text-neutral-900">CRM Lite</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="https://github.com/postcabinets-jp/crm-lite"
              target="_blank"
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              GitHub
            </Link>
            <Link href="/login">
              <Button variant="outline" size="sm">ログイン</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">無料で始める</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-neutral-100 border border-neutral-200 text-neutral-600 rounded-full px-3 py-1 text-xs font-medium mb-6">
          Salesforceの代替・オープンソースCRM
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 leading-tight mb-4">
          顧客管理を<br />
          シンプルに
        </h1>
        <p className="text-lg text-neutral-500 max-w-xl mx-auto mb-8">
          コンタクト・案件パイプライン・アクティビティ管理を
          セルフホストで無制限に。月額$300以上のCRMツールは不要。
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <Link href="/register">
            <Button size="lg" className="px-6">
              無料でセットアップ
            </Button>
          </Link>
          <a
            href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpostcabinets-jp%2Fcrm-lite&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=crm-lite"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="lg" className="px-6">
              Vercelにデプロイ
            </Button>
          </a>
        </div>
      </section>

      {/* Demo visual */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="bg-neutral-100 border-b border-neutral-200 flex items-center gap-1.5 px-4 py-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
            <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
            <div className="mx-auto text-xs text-neutral-400 font-mono">your-crm.vercel.app/dashboard</div>
          </div>
          <div className="bg-white p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-neutral-900">パイプライン</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-neutral-400 bg-neutral-100 rounded px-2 py-1">今月</span>
                <span className="text-xs text-neutral-400 bg-neutral-100 rounded px-2 py-1">全案件</span>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {[
                { stage: 'リード', count: 12, value: '¥2,400,000', color: 'bg-blue-50 border-blue-200 text-blue-700' },
                { stage: '提案中', count: 5, value: '¥8,500,000', color: 'bg-yellow-50 border-yellow-200 text-yellow-700' },
                { stage: '交渉中', count: 3, value: '¥4,200,000', color: 'bg-orange-50 border-orange-200 text-orange-700' },
                { stage: '受注', count: 8, value: '¥12,800,000', color: 'bg-green-50 border-green-200 text-green-700' },
              ].map((item) => (
                <div key={item.stage} className={`border rounded-xl p-3 ${item.color}`}>
                  <p className="text-xs font-medium mb-1">{item.stage}</p>
                  <p className="text-lg font-bold">{item.count}件</p>
                  <p className="text-xs mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-neutral-100 bg-neutral-50">
        <div className="max-w-5xl mx-auto px-4 py-20">
          <h2 className="text-2xl font-bold text-neutral-900 text-center mb-3">
            高額CRMの主要機能をOSSで
          </h2>
          <p className="text-neutral-500 text-center mb-12 text-sm">
            月額$300のSalesforceは不要
          </p>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: Users,
                title: 'コンタクト管理',
                desc: '顧客・リード・見込み客を一元管理。タグ・ステータス・メモで分類。検索・フィルタで即座にアクセス。',
              },
              {
                icon: BarChart3,
                title: '案件パイプライン',
                desc: 'リードから受注まで案件をステージ管理。金額・確度・期限を可視化して営業プロセスを最適化。',
              },
              {
                icon: Activity,
                title: 'アクティビティ追跡',
                desc: '電話・メール・会議・タスクを記録。コンタクト・案件に紐づけて営業活動を漏れなく管理。',
              },
              {
                icon: Clock,
                title: 'タイムライン',
                desc: 'コンタクト・案件ごとに全アクティビティを時系列表示。過去のやり取りを瞬時に把握。',
              },
              {
                icon: Zap,
                title: 'カスタムパイプライン',
                desc: '業種・ビジネスモデルに合わせてパイプラインのステージを自由にカスタマイズ。',
              },
              {
                icon: Shield,
                title: 'RLS完全対応',
                desc: 'Supabase Row Level Securityで全テーブル保護。組織間のデータ分離を完全保証。',
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white border border-neutral-200 rounded-2xl p-5">
                <div className="w-8 h-8 bg-neutral-900 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <h3 className="font-semibold text-neutral-900 mb-1.5">{title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deploy section */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="bg-neutral-900 rounded-3xl p-10 text-center">
          <div className="inline-flex items-center gap-1.5 bg-neutral-800 text-neutral-300 text-xs rounded-full px-3 py-1 mb-4">
            <Zap className="w-3.5 h-3.5" />
            5分でデプロイ完了
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
            今すぐCRMを導入する
          </h2>
          <p className="text-neutral-400 mb-8 text-sm max-w-md mx-auto">
            Supabaseプロジェクト + Vercelアカウントがあれば即日運用開始。
            クレジットカード不要。
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpostcabinets-jp%2Fcrm-lite&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=crm-lite"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-neutral-900 font-semibold text-sm rounded-xl px-5 py-2.5 hover:bg-neutral-100 transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 76 76" fill="none">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" fill="black" />
              </svg>
              Deploy with Vercel
            </a>
            <a
              href="https://github.com/postcabinets-jp/crm-lite"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-neutral-700 text-neutral-300 text-sm rounded-xl px-5 py-2.5 hover:border-neutral-600 hover:text-white transition-colors"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-200 py-8">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-neutral-900 rounded flex items-center justify-center">
              <Users className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-neutral-500">CRM Lite</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-neutral-400">
            <a href="https://github.com/postcabinets-jp/crm-lite" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-600">
              GitHub
            </a>
            <span>MIT License</span>
            <a href="https://postcabinets.co.jp" target="_blank" rel="noopener noreferrer" className="hover:text-neutral-600">
              POST CABINETS
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
