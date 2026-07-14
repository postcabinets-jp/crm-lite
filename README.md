# CRM Lite

Pipedriveの代替となるOSS軽量CRM。SMB・SaaS企業向けに、コンタクト管理・パイプライン・アクティビティ・レポートを1つのアプリで提供。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpostcabinets-jp%2Fcrm-lite&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY&project-name=crm-lite)

## 機能

- **コンタクト管理** — タグ・ステータス・メモ付きの顧客データベース。CSVインポート対応。
- **会社（アカウント）管理** — 1社につき全コンタクト・案件・アクティビティを集約表示。
- **案件パイプライン** — カンバンビュー（ドラッグ&ドロップ）＋リストビュー。ステージ別金額管理。
- **アクティビティ追跡** — 電話・メール・会議・タスク・メモを案件/コンタクトに紐付け。
- **レポート** — パイプライン金額・月別トレンド・ステージ別案件数・勝率・加重予測収益。
- **シーケンス（Phase 2）** — 自動メールフォローアップ。Resend連携。
- **認証** — メール/パスワード + Google OAuth（Supabase Auth）。
- **RLS完全対応** — 全テーブルにRow Level Securityを適用。データリークなし。
- **セルフホスト可能** — Supabase CLI + Vercelで5分デプロイ。

## 競合比較

| 機能 | CRM Lite | Pipedrive Growth | Freshsales Pro |
|---|---|---|---|
| 料金（10名） | $0（OSS）/ $9定額 | $240/mo | $390/mo |
| パイプラインカンバン | ✅ | ✅ | ✅ |
| レポート | ✅ 全プラン | ❌ Pro以上 | ❌ Pro以上 |
| 自己ホスト | ✅ | ❌ | ❌ |
| per-user課金なし | ✅ | ❌ | ❌ |

## クイックスタート

### 1. Supabaseプロジェクトを作成

[supabase.com](https://supabase.com) でプロジェクトを新規作成し、`SUPABASE_URL` と `ANON_KEY` を取得。

### 2. スキーマを適用

```bash
# Supabase CLIを使う場合
supabase db push

# またはSupabase SQL Editorに貼り付け
cat supabase/migrations/20240101000000_initial.sql
```

### 3. ローカル起動

```bash
git clone https://github.com/postcabinets-jp/crm-lite
cd crm-lite
cp .env.example .env.local
# .env.local にSupabase URLとANON KEYを設定
npm install
npm run dev
```

### 4. Vercelにデプロイ

```bash
vercel --prod
# または上部のDeploy with Vercelボタン
```

環境変数に `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` を設定すれば完了。

### 5. シードデータ（オプション）

`supabase/seed.sql` の `YOUR_USER_ID` を実際のUUIDに置換してSQL Editorで実行。
リアルなデモデータが投入されます。

## 技術スタック

| カテゴリ | 採用 |
|---|---|
| Frontend | Next.js 16 (App Router) + TypeScript strict |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Deploy | Vercel |
| Email | Resend（Phase 2） |
| 決済 | Stripe（Phase 2） |

## 環境変数

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

詳細は `.env.example` を参照。

## 画面構成

| パス | 説明 |
|---|---|
| `/` | ランディングページ |
| `/register` | アカウント作成 |
| `/login` | ログイン（メール/Google） |
| `/onboarding` | 初期設定ウィザード |
| `/dashboard` | KPIダッシュボード |
| `/dashboard/contacts` | コンタクト一覧・管理 |
| `/dashboard/companies` | 会社一覧・詳細 |
| `/dashboard/deals` | 案件リスト |
| `/dashboard/pipeline` | カンバンビュー |
| `/dashboard/activities` | アクティビティ |
| `/dashboard/sequences` | メールシーケンス |
| `/dashboard/reports` | レポート・分析 |
| `/dashboard/settings` | 組織設定 |

## セキュリティ

- 全テーブルにRLSポリシー適用（組織間データ完全分離）
- セキュリティヘッダー: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` など
- `/api/*` レート制限: 60req/min/IP
- CORS: same-originのみ

## ライセンス

MIT

---

Built by [POST CABINETS](https://postcabinets.co.jp)
