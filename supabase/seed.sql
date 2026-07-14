-- ============================================================
-- CRM Lite — Realistic Seed Data
-- Run AFTER creating your auth.users entry (e.g., via Supabase Auth UI)
-- Replace 'YOUR_USER_ID' with your actual auth.users UUID
-- ============================================================

DO $$
DECLARE
  v_user_id    UUID := 'YOUR_USER_ID'; -- ← Replace with your user UUID
  v_org_id     UUID;
  v_contact_1  UUID;
  v_contact_2  UUID;
  v_contact_3  UUID;
  v_contact_4  UUID;
  v_contact_5  UUID;
  v_company_1  UUID;
  v_company_2  UUID;
  v_company_3  UUID;
  v_deal_1     UUID;
  v_deal_2     UUID;
  v_deal_3     UUID;
  v_deal_4     UUID;
  v_deal_5     UUID;
BEGIN

-- ── Organization ─────────────────────────────────────────────
INSERT INTO organizations (user_id, name, slug, industry, website, plan)
VALUES (v_user_id, '株式会社テックセールス', 'tech-sales', 'IT / SaaS', 'https://techsales-example.co.jp', 'pro')
RETURNING id INTO v_org_id;

-- ── Companies ────────────────────────────────────────────────
INSERT INTO companies (id, org_id, name, domain, industry, employee_count, website_url)
VALUES (gen_random_uuid(), v_org_id, '株式会社アルファコマース', 'alphacommerce.co.jp', 'EC / 小売', 320, 'https://alphacommerce.co.jp')
RETURNING id INTO v_company_1;

INSERT INTO companies (id, org_id, name, domain, industry, employee_count, website_url)
VALUES (gen_random_uuid(), v_org_id, 'ベータ製造株式会社', 'betamanuf.co.jp', '製造業', 1200, 'https://betamanuf.co.jp')
RETURNING id INTO v_company_2;

INSERT INTO companies (id, org_id, name, domain, industry, employee_count, website_url)
VALUES (gen_random_uuid(), v_org_id, 'ガンマ物流サービス株式会社', 'gammalogistics.jp', '物流', 850, 'https://gammalogistics.jp')
RETURNING id INTO v_company_3;

-- ── Contacts ─────────────────────────────────────────────────
INSERT INTO contacts (id, org_id, first_name, last_name, email, phone, company, position, status, tags)
VALUES (
  gen_random_uuid(), v_org_id, '誠', '佐藤', 'makoto.sato@alphacommerce.co.jp',
  '03-1234-5678', '株式会社アルファコマース', 'IT部門長', 'prospect',
  ARRAY['EC', 'キーマン', 'Q1優先']
)
RETURNING id INTO v_contact_1;

INSERT INTO contacts (id, org_id, first_name, last_name, email, phone, company, position, status, tags)
VALUES (
  gen_random_uuid(), v_org_id, '恵子', '田中', 'keiko.tanaka@betamanuf.co.jp',
  '06-9876-5432', 'ベータ製造株式会社', '情報システム部 課長', 'customer',
  ARRAY['製造業', 'リピーター']
)
RETURNING id INTO v_contact_2;

INSERT INTO contacts (id, org_id, first_name, last_name, email, phone, company, position, status, tags)
VALUES (
  gen_random_uuid(), v_org_id, '健太', '鈴木', 'kenta.suzuki@gammalogistics.jp',
  '052-3333-4444', 'ガンマ物流サービス株式会社', '代表取締役', 'prospect',
  ARRAY['物流', '大型案件']
)
RETURNING id INTO v_contact_3;

INSERT INTO contacts (id, org_id, first_name, last_name, email, phone, company, position, status, tags)
VALUES (
  gen_random_uuid(), v_org_id, '美咲', '山本', 'misaki.yamamoto@startup-delta.io',
  '090-1111-2222', 'デルタスタートアップ株式会社', 'CEO', 'lead',
  ARRAY['スタートアップ', 'SaaS']
)
RETURNING id INTO v_contact_4;

INSERT INTO contacts (id, org_id, first_name, last_name, email, phone, company, position, status, tags)
VALUES (
  gen_random_uuid(), v_org_id, '拓也', '伊藤', 'takuya.ito@epsilon-retail.co.jp',
  '078-5555-6666', 'イプシロンリテール株式会社', '購買部長', 'churned',
  ARRAY['小売', '解約済み']
)
RETURNING id INTO v_contact_5;

-- ── Deals ────────────────────────────────────────────────────
INSERT INTO deals (id, org_id, contact_id, title, value, currency, stage, probability, expected_close_date)
VALUES (
  gen_random_uuid(), v_org_id, v_contact_1,
  'アルファコマース CRM導入プロジェクト', 4800000, 'JPY', 'proposal', 60,
  (CURRENT_DATE + INTERVAL '45 days')::DATE
)
RETURNING id INTO v_deal_1;

INSERT INTO deals (id, org_id, contact_id, title, value, currency, stage, probability, expected_close_date)
VALUES (
  gen_random_uuid(), v_org_id, v_contact_2,
  'ベータ製造 保守契約更新（3年）', 2160000, 'JPY', 'negotiation', 80,
  (CURRENT_DATE + INTERVAL '14 days')::DATE
)
RETURNING id INTO v_deal_2;

INSERT INTO deals (id, org_id, contact_id, title, value, currency, stage, probability, expected_close_date)
VALUES (
  gen_random_uuid(), v_org_id, v_contact_3,
  'ガンマ物流 基幹システム刷新', 18000000, 'JPY', 'qualified', 40,
  (CURRENT_DATE + INTERVAL '90 days')::DATE
)
RETURNING id INTO v_deal_3;

INSERT INTO deals (id, org_id, contact_id, title, value, currency, stage, probability, expected_close_date)
VALUES (
  gen_random_uuid(), v_org_id, v_contact_4,
  'デルタスタートアップ 営業支援ツール導入', 600000, 'JPY', 'lead', 20,
  (CURRENT_DATE + INTERVAL '60 days')::DATE
)
RETURNING id INTO v_deal_4;

INSERT INTO deals (id, org_id, contact_id, title, value, currency, stage, probability, expected_close_date)
VALUES (
  gen_random_uuid(), v_org_id, v_contact_2,
  'ベータ製造 追加モジュール導入', 980000, 'JPY', 'closed_won', 100,
  CURRENT_DATE - INTERVAL '7 days'
)
RETURNING id INTO v_deal_5;

-- ── Activities ───────────────────────────────────────────────
INSERT INTO activities (org_id, deal_id, contact_id, user_id, type, title, description, completed, completed_at)
VALUES (
  v_org_id, v_deal_1, v_contact_1, v_user_id, 'call',
  '初回ヒアリング完了', '現行システムの課題と予算感を確認。Q1末の導入希望。', true, now() - INTERVAL '5 days'
);

INSERT INTO activities (org_id, deal_id, contact_id, user_id, type, title, description, scheduled_at, completed)
VALUES (
  v_org_id, v_deal_1, v_contact_1, v_user_id, 'meeting',
  '提案デモ実施', 'デモ環境を使って要件を確認する。', now() + INTERVAL '3 days', false
);

INSERT INTO activities (org_id, deal_id, contact_id, user_id, type, title, description, completed, completed_at)
VALUES (
  v_org_id, v_deal_2, v_contact_2, v_user_id, 'email',
  '契約書ドラフト送付', '3年保守契約書のドラフトをメールで送付。', true, now() - INTERVAL '2 days'
);

INSERT INTO activities (org_id, deal_id, contact_id, user_id, type, title, description, scheduled_at, completed)
VALUES (
  v_org_id, v_deal_2, v_contact_2, v_user_id, 'call',
  '最終条件確認コール', '契約条件の最終調整。', now() + INTERVAL '1 day', false
);

INSERT INTO activities (org_id, deal_id, contact_id, user_id, type, title, description, completed, completed_at)
VALUES (
  v_org_id, v_deal_3, v_contact_3, v_user_id, 'meeting',
  'キックオフミーティング', '要件定義の初回打ち合わせ。担当3名出席。', true, now() - INTERVAL '10 days'
);

INSERT INTO activities (org_id, deal_id, contact_id, user_id, type, title, description, completed, completed_at)
VALUES (
  v_org_id, v_deal_5, v_contact_2, v_user_id, 'note',
  '受注完了メモ', '追加モジュール受注。次の更新時に保守契約も提案する。', true, now() - INTERVAL '7 days'
);

INSERT INTO activities (org_id, contact_id, user_id, type, title, description, scheduled_at, completed)
VALUES (
  v_org_id, v_contact_4, v_user_id, 'email',
  '情報提供メール送付', '製品概要資料とROI試算シートを送付予定。', now() + INTERVAL '2 days', false
);

-- ── Default pipeline ─────────────────────────────────────────
INSERT INTO pipelines (org_id, name, stages)
VALUES (
  v_org_id,
  '標準営業パイプライン',
  '[
    {"key": "lead", "label": "リード", "probability": 10},
    {"key": "qualified", "label": "見込み", "probability": 30},
    {"key": "proposal", "label": "提案", "probability": 60},
    {"key": "negotiation", "label": "交渉", "probability": 80},
    {"key": "closed_won", "label": "受注", "probability": 100},
    {"key": "closed_lost", "label": "失注", "probability": 0}
  ]'::jsonb
);

-- ── Tags ─────────────────────────────────────────────────────
INSERT INTO tags (org_id, name, color)
VALUES
  (v_org_id, 'VIP', '#DC2626'),
  (v_org_id, 'IT', '#2563EB'),
  (v_org_id, '製造業', '#7C3AED'),
  (v_org_id, 'Q1優先', '#D97706'),
  (v_org_id, 'EC', '#059669');

END $$;
