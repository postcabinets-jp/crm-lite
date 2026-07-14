import { z } from 'zod'

// ─── Enums ───────────────────────────────────────────────
export const contactStatusSchema = z.enum(['lead', 'prospect', 'customer', 'churned'])

export const dealStageSchema = z.enum([
  'lead',
  'qualified',
  'proposal',
  'negotiation',
  'closed_won',
  'closed_lost',
])

export const activityTypeSchema = z.enum(['call', 'email', 'meeting', 'note', 'task'])

export const orgPlanSchema = z.enum(['free', 'pro', 'enterprise'])

// ─── UUID (reusable) ────────────────────────────────────────
const uuid = z.string().uuid()

// FormData.get() returns null for absent fields. Coerce null → undefined
// so z.string().optional() works correctly.
const optStr = z
  .string()
  .nullable()
  .optional()
  .transform((v) => v ?? undefined)

// ─── Auth ───────────────────────────────────────────────────
export const signUpSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上必要です'),
  display_name: z.string().min(1, '表示名は必須です').max(100, '表示名は100文字以内にしてください'),
})

export const signInSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(1, 'パスワードは必須です'),
})

export const resetPasswordSchema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
})

export const updatePasswordSchema = z.object({
  password: z.string().min(8, 'パスワードは8文字以上必要です'),
})

// ─── Organizations ──────────────────────────────────────────
export const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(1, '組織名は必須です')
    .max(100, '組織名は100文字以内にしてください')
    .transform((v) => v.trim()),
  industry: optStr.pipe(
    z
      .string()
      .max(100, '業種は100文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || null),
  ),
  website: optStr.pipe(
    z
      .string()
      .max(500, 'URLは500文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || null),
  ),
})

export const updateOrganizationSchema = z.object({
  orgId: uuid,
  name: z
    .string()
    .min(1, '組織名は必須です')
    .max(100, '組織名は100文字以内にしてください')
    .transform((v) => v.trim()),
  industry: optStr.pipe(
    z
      .string()
      .max(100, '業種は100文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || null),
  ),
  website: optStr.pipe(
    z
      .string()
      .max(500, 'URLは500文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || null),
  ),
})

// ─── Contacts ──────────────────────────────────────────────
export const createContactSchema = z.object({
  first_name: z
    .string()
    .min(1, '名は必須です')
    .max(100, '名は100文字以内にしてください')
    .transform((v) => v.trim()),
  last_name: z
    .string()
    .min(1, '姓は必須です')
    .max(100, '姓は100文字以内にしてください')
    .transform((v) => v.trim()),
  email: optStr.pipe(
    z
      .string()
      .email('有効なメールアドレスを入力してください')
      .optional()
      .or(z.literal('').transform(() => undefined)),
  ),
  phone: optStr.pipe(
    z
      .string()
      .max(50, '電話番号は50文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
  company: optStr.pipe(
    z
      .string()
      .max(200, '会社名は200文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
  position: optStr.pipe(
    z
      .string()
      .max(100, '役職は100文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
  status: contactStatusSchema.optional().default('lead'),
  tags: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    ),
  notes: optStr.pipe(
    z
      .string()
      .max(5000, 'メモは5000文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
})

export const updateContactSchema = z.object({
  contactId: uuid,
  first_name: z
    .string()
    .min(1, '名は必須です')
    .max(100, '名は100文字以内にしてください')
    .transform((v) => v.trim()),
  last_name: z
    .string()
    .min(1, '姓は必須です')
    .max(100, '姓は100文字以内にしてください')
    .transform((v) => v.trim()),
  email: optStr.pipe(
    z
      .string()
      .email('有効なメールアドレスを入力してください')
      .optional()
      .or(z.literal('').transform(() => undefined)),
  ),
  phone: optStr.pipe(
    z
      .string()
      .max(50, '電話番号は50文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
  company: optStr.pipe(
    z
      .string()
      .max(200, '会社名は200文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
  position: optStr.pipe(
    z
      .string()
      .max(100, '役職は100文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
  status: contactStatusSchema.optional(),
  tags: z
    .string()
    .optional()
    .transform((v) =>
      v
        ? v
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    ),
  notes: optStr.pipe(
    z
      .string()
      .max(5000, 'メモは5000文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
})

export const deleteContactSchema = z.object({
  contactId: uuid,
})

export const importContactSchema = z.object({
  first_name: z.string().min(1, '名は必須です').max(100),
  last_name: z.string().min(1, '姓は必須です').max(100),
  email: z.string().email('有効なメールアドレスを入力してください').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  company: z.string().max(200).optional(),
  position: z.string().max(100).optional(),
  status: contactStatusSchema.optional().default('lead'),
})

export const importContactsSchema = z.object({
  contacts: z
    .array(importContactSchema)
    .min(1, '1件以上のコンタクトが必要です')
    .max(1000, '一度にインポートできるのは1000件までです'),
})

// ─── Deals ──────────────────────────────────────────────────
export const createDealSchema = z.object({
  title: z
    .string()
    .min(1, '案件名は必須です')
    .max(200, '案件名は200文字以内にしてください')
    .transform((v) => v.trim()),
  contact_id: optStr.pipe(
    z.string().uuid('無効なコンタクトIDです').optional(),
  ),
  value: z
    .number({ message: '金額は数値で入力してください' })
    .min(0, '金額は0以上にしてください')
    .max(999_999_999_999, '金額が大きすぎます')
    .default(0),
  currency: z
    .string()
    .min(1, '通貨は必須です')
    .max(3, '通貨コードは3文字以内にしてください')
    .default('JPY'),
  stage: dealStageSchema.optional().default('lead'),
  probability: z
    .number({ message: '確度は数値で入力してください' })
    .min(0, '確度は0以上にしてください')
    .max(100, '確度は100以下にしてください')
    .default(0),
  expected_close_date: optStr.pipe(
    z
      .string()
      .refine(
        (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
        '日付はYYYY-MM-DD形式で入力してください',
      )
      .optional()
      .transform((v) => v || undefined),
  ),
  notes: optStr.pipe(
    z
      .string()
      .max(5000, 'メモは5000文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
})

export const updateDealSchema = z.object({
  dealId: uuid,
  title: z
    .string()
    .min(1, '案件名は必須です')
    .max(200, '案件名は200文字以内にしてください')
    .transform((v) => v.trim()),
  contact_id: optStr.pipe(
    z.string().uuid('無効なコンタクトIDです').optional(),
  ),
  value: z
    .number({ message: '金額は数値で入力してください' })
    .min(0, '金額は0以上にしてください')
    .max(999_999_999_999, '金額が大きすぎます')
    .default(0),
  currency: z
    .string()
    .min(1, '通貨は必須です')
    .max(3, '通貨コードは3文字以内にしてください')
    .default('JPY'),
  stage: dealStageSchema.optional(),
  probability: z
    .number({ message: '確度は数値で入力してください' })
    .min(0, '確度は0以上にしてください')
    .max(100, '確度は100以下にしてください')
    .default(0),
  expected_close_date: optStr.pipe(
    z
      .string()
      .refine(
        (v) => !v || /^\d{4}-\d{2}-\d{2}$/.test(v),
        '日付はYYYY-MM-DD形式で入力してください',
      )
      .optional()
      .transform((v) => v || undefined),
  ),
  notes: optStr.pipe(
    z
      .string()
      .max(5000, 'メモは5000文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
})

export const updateDealStageSchema = z.object({
  dealId: uuid,
  stage: dealStageSchema,
})

export const deleteDealSchema = z.object({
  dealId: uuid,
})

// ─── Activities ─────────────────────────────────────────────
export const createActivitySchema = z.object({
  type: activityTypeSchema,
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(200, 'タイトルは200文字以内にしてください')
    .transform((v) => v.trim()),
  description: optStr.pipe(
    z
      .string()
      .max(5000, '説明は5000文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
  deal_id: optStr.pipe(
    z.string().uuid('無効な案件IDです').optional(),
  ),
  contact_id: optStr.pipe(
    z.string().uuid('無効なコンタクトIDです').optional(),
  ),
  scheduled_at: optStr.pipe(
    z
      .string()
      .optional()
      .transform((v) => v || undefined),
  ),
})

export const updateActivitySchema = z.object({
  activityId: uuid,
  type: activityTypeSchema.optional(),
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(200, 'タイトルは200文字以内にしてください')
    .transform((v) => v.trim()),
  description: optStr.pipe(
    z
      .string()
      .max(5000, '説明は5000文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
  deal_id: optStr.pipe(
    z.string().uuid('無効な案件IDです').optional(),
  ),
  contact_id: optStr.pipe(
    z.string().uuid('無効なコンタクトIDです').optional(),
  ),
  scheduled_at: optStr.pipe(
    z
      .string()
      .optional()
      .transform((v) => v || undefined),
  ),
})

export const completeActivitySchema = z.object({
  activityId: uuid,
})

export const deleteActivitySchema = z.object({
  activityId: uuid,
})

// ─── Tags ──────────────────────────────────────────────────
export const createTagSchema = z.object({
  name: z
    .string()
    .min(1, 'タグ名は必須です')
    .max(50, 'タグ名は50文字以内にしてください')
    .transform((v) => v.trim()),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '有効なカラーコードを入力してください（例: #FF0000）')
    .default('#6B7280'),
})

export const updateTagSchema = z.object({
  tagId: uuid,
  name: z
    .string()
    .min(1, 'タグ名は必須です')
    .max(50, 'タグ名は50文字以内にしてください')
    .transform((v) => v.trim()),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, '有効なカラーコードを入力してください（例: #FF0000）')
    .optional(),
})

export const deleteTagSchema = z.object({
  tagId: uuid,
})

// ─── Companies ─────────────────────────────────────────────
export const createCompanySchema = z.object({
  name: z
    .string()
    .min(1, '会社名は必須です')
    .max(200, '会社名は200文字以内にしてください')
    .transform((v) => v.trim()),
  domain: optStr.pipe(
    z
      .string()
      .max(200, 'ドメインは200文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
  industry: optStr.pipe(
    z
      .string()
      .max(100, '業種は100文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
  employee_count: z
    .number()
    .int()
    .min(0)
    .max(9_999_999)
    .optional()
    .nullable(),
  website_url: optStr.pipe(
    z
      .string()
      .max(500, 'URLは500文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
  notes: optStr.pipe(
    z
      .string()
      .max(5000, 'メモは5000文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
})

export const updateCompanySchema = z.object({
  companyId: uuid,
  name: z
    .string()
    .min(1, '会社名は必須です')
    .max(200, '会社名は200文字以内にしてください')
    .transform((v) => v.trim()),
  domain: optStr.pipe(
    z
      .string()
      .max(200, 'ドメインは200文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
  industry: optStr.pipe(
    z
      .string()
      .max(100, '業種は100文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
  employee_count: z
    .number()
    .int()
    .min(0)
    .max(9_999_999)
    .optional()
    .nullable(),
  website_url: optStr.pipe(
    z
      .string()
      .max(500, 'URLは500文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
  notes: optStr.pipe(
    z
      .string()
      .max(5000, 'メモは5000文字以内にしてください')
      .optional()
      .transform((v) => v?.trim() || undefined),
  ),
})

export const deleteCompanySchema = z.object({
  companyId: uuid,
})

// ─── Pipelines ─────────────────────────────────────────────
export const createPipelineSchema = z.object({
  name: z
    .string()
    .min(1, 'パイプライン名は必須です')
    .max(100, 'パイプライン名は100文字以内にしてください')
    .transform((v) => v.trim()),
  stages: z
    .array(
      z.string().min(1, 'ステージ名は必須です').max(50, 'ステージ名は50文字以内にしてください'),
    )
    .min(1, '1つ以上のステージが必要です')
    .max(20, 'ステージは20個以内にしてください'),
})

export const updatePipelineSchema = z.object({
  pipelineId: uuid,
  name: z
    .string()
    .min(1, 'パイプライン名は必須です')
    .max(100, 'パイプライン名は100文字以内にしてください')
    .transform((v) => v.trim()),
  stages: z
    .array(
      z.string().min(1, 'ステージ名は必須です').max(50, 'ステージ名は50文字以内にしてください'),
    )
    .min(1, '1つ以上のステージが必要です')
    .max(20, 'ステージは20個以内にしてください'),
})
