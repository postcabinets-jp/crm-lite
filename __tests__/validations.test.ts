import { describe, it, expect } from 'vitest'
import {
  contactStatusSchema,
  dealStageSchema,
  activityTypeSchema,
  orgPlanSchema,
  signUpSchema,
  signInSchema,
  resetPasswordSchema,
  updatePasswordSchema,
  createOrganizationSchema,
  updateOrganizationSchema,
  createContactSchema,
  updateContactSchema,
  deleteContactSchema,
  importContactSchema,
  importContactsSchema,
  createDealSchema,
  updateDealSchema,
  updateDealStageSchema,
  deleteDealSchema,
  createActivitySchema,
  updateActivitySchema,
  completeActivitySchema,
  deleteActivitySchema,
  createTagSchema,
  updateTagSchema,
  deleteTagSchema,
  createPipelineSchema,
  updatePipelineSchema,
} from '@/lib/validations'

// ─── Helpers ──────────────────────────────────────────────
const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const INVALID_UUID = 'not-a-uuid'

function expectSuccess(result: { success: boolean }) {
  expect(result.success).toBe(true)
}

function expectFail(result: { success: boolean }) {
  expect(result.success).toBe(false)
}

function firstMessage(result: { error?: { issues: { message: string }[] } }): string {
  return result.error!.issues[0].message
}

// ─── contactStatusSchema ──────────────────────────────────
describe('contactStatusSchema', () => {
  const validStatuses = ['lead', 'prospect', 'customer', 'churned']

  it.each(validStatuses)('accepts "%s"', (status) => {
    expectSuccess(contactStatusSchema.safeParse(status))
  })

  it('rejects invalid status', () => {
    expectFail(contactStatusSchema.safeParse('active'))
  })

  it('rejects empty string', () => {
    expectFail(contactStatusSchema.safeParse(''))
  })

  it('rejects number', () => {
    expectFail(contactStatusSchema.safeParse(42))
  })
})

// ─── dealStageSchema ──────────────────────────────────────
describe('dealStageSchema', () => {
  const validStages = ['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost']

  it.each(validStages)('accepts "%s"', (stage) => {
    expectSuccess(dealStageSchema.safeParse(stage))
  })

  it('rejects invalid stage', () => {
    expectFail(dealStageSchema.safeParse('pending'))
  })

  it('rejects empty string', () => {
    expectFail(dealStageSchema.safeParse(''))
  })
})

// ─── activityTypeSchema ───────────────────────────────────
describe('activityTypeSchema', () => {
  const validTypes = ['call', 'email', 'meeting', 'note', 'task']

  it.each(validTypes)('accepts "%s"', (type) => {
    expectSuccess(activityTypeSchema.safeParse(type))
  })

  it('rejects invalid type', () => {
    expectFail(activityTypeSchema.safeParse('sms'))
  })
})

// ─── orgPlanSchema ────────────────────────────────────────
describe('orgPlanSchema', () => {
  it.each(['free', 'pro', 'enterprise'])('accepts "%s"', (plan) => {
    expectSuccess(orgPlanSchema.safeParse(plan))
  })

  it('rejects invalid plan', () => {
    expectFail(orgPlanSchema.safeParse('premium'))
  })
})

// ─── signUpSchema ─────────────────────────────────────────
describe('signUpSchema', () => {
  const valid = { email: 'user@example.com', password: '12345678', display_name: 'Nobu' }

  it('accepts valid input', () => {
    expectSuccess(signUpSchema.safeParse(valid))
  })

  it('rejects invalid email', () => {
    const r = signUpSchema.safeParse({ ...valid, email: 'bad' })
    expectFail(r)
    expect(firstMessage(r)).toBe('有効なメールアドレスを入力してください')
  })

  it('rejects empty email', () => {
    expectFail(signUpSchema.safeParse({ ...valid, email: '' }))
  })

  it('rejects password shorter than 8 chars', () => {
    const r = signUpSchema.safeParse({ ...valid, password: '1234567' })
    expectFail(r)
    expect(firstMessage(r)).toBe('パスワードは8文字以上必要です')
  })

  it('accepts password of exactly 8 chars', () => {
    expectSuccess(signUpSchema.safeParse({ ...valid, password: '12345678' }))
  })

  it('rejects empty display_name', () => {
    const r = signUpSchema.safeParse({ ...valid, display_name: '' })
    expectFail(r)
    expect(firstMessage(r)).toBe('表示名は必須です')
  })

  it('accepts display_name of 100 chars', () => {
    expectSuccess(signUpSchema.safeParse({ ...valid, display_name: 'a'.repeat(100) }))
  })

  it('rejects display_name over 100 chars', () => {
    expectFail(signUpSchema.safeParse({ ...valid, display_name: 'a'.repeat(101) }))
  })

  it('rejects missing fields', () => {
    expectFail(signUpSchema.safeParse({}))
  })
})

// ─── signInSchema ─────────────────────────────────────────
describe('signInSchema', () => {
  const valid = { email: 'user@example.com', password: 'pass' }

  it('accepts valid input', () => {
    expectSuccess(signInSchema.safeParse(valid))
  })

  it('rejects invalid email', () => {
    const r = signInSchema.safeParse({ ...valid, email: 'nope' })
    expectFail(r)
    expect(firstMessage(r)).toBe('有効なメールアドレスを入力してください')
  })

  it('rejects empty password', () => {
    const r = signInSchema.safeParse({ ...valid, password: '' })
    expectFail(r)
    expect(firstMessage(r)).toBe('パスワードは必須です')
  })

  it('accepts password of 1 char (min 1)', () => {
    expectSuccess(signInSchema.safeParse({ ...valid, password: 'x' }))
  })
})

// ─── resetPasswordSchema ──────────────────────────────────
describe('resetPasswordSchema', () => {
  it('accepts valid email', () => {
    expectSuccess(resetPasswordSchema.safeParse({ email: 'a@b.co' }))
  })

  it('rejects invalid email', () => {
    const r = resetPasswordSchema.safeParse({ email: 'bad' })
    expectFail(r)
    expect(firstMessage(r)).toBe('有効なメールアドレスを入力してください')
  })

  it('rejects missing email', () => {
    expectFail(resetPasswordSchema.safeParse({}))
  })
})

// ─── updatePasswordSchema ─────────────────────────────────
describe('updatePasswordSchema', () => {
  it('accepts 8-char password', () => {
    expectSuccess(updatePasswordSchema.safeParse({ password: '12345678' }))
  })

  it('accepts long password', () => {
    expectSuccess(updatePasswordSchema.safeParse({ password: 'a'.repeat(256) }))
  })

  it('rejects 7-char password', () => {
    const r = updatePasswordSchema.safeParse({ password: '1234567' })
    expectFail(r)
    expect(firstMessage(r)).toBe('パスワードは8文字以上必要です')
  })

  it('rejects empty password', () => {
    expectFail(updatePasswordSchema.safeParse({ password: '' }))
  })
})

// ─── createOrganizationSchema ─────────────────────────────
describe('createOrganizationSchema', () => {
  it('accepts valid input with all fields', () => {
    expectSuccess(createOrganizationSchema.safeParse({ name: 'My Org', industry: 'IT', website: 'https://example.com' }))
  })

  it('accepts valid input without optional fields', () => {
    expectSuccess(createOrganizationSchema.safeParse({ name: 'My Org' }))
  })

  it('trims name', () => {
    const r = createOrganizationSchema.safeParse({ name: '  My Org  ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.name).toBe('My Org')
  })

  it('rejects empty name', () => {
    const r = createOrganizationSchema.safeParse({ name: '' })
    expectFail(r)
    expect(firstMessage(r)).toBe('組織名は必須です')
  })

  it('accepts name of 100 chars', () => {
    expectSuccess(createOrganizationSchema.safeParse({ name: 'a'.repeat(100) }))
  })

  it('rejects name over 100 chars', () => {
    expectFail(createOrganizationSchema.safeParse({ name: 'a'.repeat(101) }))
  })

  it('transforms null industry to null', () => {
    const r = createOrganizationSchema.safeParse({ name: 'x', industry: null })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.industry).toBeNull()
  })

  it('transforms empty industry to null', () => {
    const r = createOrganizationSchema.safeParse({ name: 'x', industry: '' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.industry).toBeNull()
  })

  it('rejects industry over 100 chars', () => {
    expectFail(createOrganizationSchema.safeParse({ name: 'x', industry: 'a'.repeat(101) }))
  })

  it('rejects website over 500 chars', () => {
    expectFail(createOrganizationSchema.safeParse({ name: 'x', website: 'a'.repeat(501) }))
  })
})

// ─── updateOrganizationSchema ─────────────────────────────
describe('updateOrganizationSchema', () => {
  const valid = { orgId: VALID_UUID, name: 'Updated Org' }

  it('accepts valid input', () => {
    expectSuccess(updateOrganizationSchema.safeParse(valid))
  })

  it('rejects invalid orgId', () => {
    expectFail(updateOrganizationSchema.safeParse({ ...valid, orgId: INVALID_UUID }))
  })

  it('rejects empty name', () => {
    expectFail(updateOrganizationSchema.safeParse({ ...valid, name: '' }))
  })

  it('rejects name over 100 chars', () => {
    expectFail(updateOrganizationSchema.safeParse({ ...valid, name: 'a'.repeat(101) }))
  })
})

// ─── createContactSchema ──────────────────────────────────
describe('createContactSchema', () => {
  const valid = { first_name: '太郎', last_name: '山田' }

  it('accepts valid input with minimal fields', () => {
    expectSuccess(createContactSchema.safeParse(valid))
  })

  it('accepts valid input with all fields', () => {
    expectSuccess(createContactSchema.safeParse({
      ...valid,
      email: 'a@b.com',
      phone: '090-1234-5678',
      company: 'ACME',
      position: 'CEO',
      status: 'customer',
      tags: 'VIP, 大阪',
      notes: 'テストメモ',
    }))
  })

  it('trims first_name', () => {
    const r = createContactSchema.safeParse({ ...valid, first_name: '  太郎  ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.first_name).toBe('太郎')
  })

  it('trims last_name', () => {
    const r = createContactSchema.safeParse({ ...valid, last_name: '  山田  ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.last_name).toBe('山田')
  })

  it('rejects empty first_name', () => {
    const r = createContactSchema.safeParse({ ...valid, first_name: '' })
    expectFail(r)
    expect(firstMessage(r)).toBe('名は必須です')
  })

  it('rejects empty last_name', () => {
    const r = createContactSchema.safeParse({ ...valid, last_name: '' })
    expectFail(r)
    expect(firstMessage(r)).toBe('姓は必須です')
  })

  it('rejects first_name over 100 chars', () => {
    expectFail(createContactSchema.safeParse({ ...valid, first_name: 'a'.repeat(101) }))
  })

  it('rejects last_name over 100 chars', () => {
    expectFail(createContactSchema.safeParse({ ...valid, last_name: 'a'.repeat(101) }))
  })

  it('accepts valid email', () => {
    const r = createContactSchema.safeParse({ ...valid, email: 'test@example.com' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.email).toBe('test@example.com')
  })

  it('transforms empty email to undefined', () => {
    const r = createContactSchema.safeParse({ ...valid, email: '' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.email).toBeUndefined()
  })

  it('rejects invalid email', () => {
    expectFail(createContactSchema.safeParse({ ...valid, email: 'not-email' }))
  })

  it('rejects phone over 50 chars', () => {
    expectFail(createContactSchema.safeParse({ ...valid, phone: 'a'.repeat(51) }))
  })

  it('rejects company over 200 chars', () => {
    expectFail(createContactSchema.safeParse({ ...valid, company: 'a'.repeat(201) }))
  })

  it('rejects position over 100 chars', () => {
    expectFail(createContactSchema.safeParse({ ...valid, position: 'a'.repeat(101) }))
  })

  it('defaults status to lead', () => {
    const r = createContactSchema.safeParse(valid)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.status).toBe('lead')
  })

  it('accepts valid status', () => {
    const r = createContactSchema.safeParse({ ...valid, status: 'customer' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.status).toBe('customer')
  })

  it('parses tags from comma-separated string', () => {
    const r = createContactSchema.safeParse({ ...valid, tags: 'VIP, 大阪, IT' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.tags).toEqual(['VIP', '大阪', 'IT'])
  })

  it('returns empty array for absent tags', () => {
    const r = createContactSchema.safeParse(valid)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.tags).toEqual([])
  })

  it('filters empty tag entries', () => {
    const r = createContactSchema.safeParse({ ...valid, tags: 'VIP, , 大阪, ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.tags).toEqual(['VIP', '大阪'])
  })

  it('rejects notes over 5000 chars', () => {
    expectFail(createContactSchema.safeParse({ ...valid, notes: 'a'.repeat(5001) }))
  })

  it('accepts notes of 5000 chars', () => {
    expectSuccess(createContactSchema.safeParse({ ...valid, notes: 'a'.repeat(5000) }))
  })

  it('rejects missing fields', () => {
    expectFail(createContactSchema.safeParse({}))
  })
})

// ─── updateContactSchema ──────────────────────────────────
describe('updateContactSchema', () => {
  const valid = { contactId: VALID_UUID, first_name: '太郎', last_name: '山田' }

  it('accepts valid input', () => {
    expectSuccess(updateContactSchema.safeParse(valid))
  })

  it('rejects invalid contactId', () => {
    expectFail(updateContactSchema.safeParse({ ...valid, contactId: INVALID_UUID }))
  })

  it('rejects empty first_name', () => {
    expectFail(updateContactSchema.safeParse({ ...valid, first_name: '' }))
  })

  it('rejects empty last_name', () => {
    expectFail(updateContactSchema.safeParse({ ...valid, last_name: '' }))
  })

  it('accepts all optional fields', () => {
    expectSuccess(updateContactSchema.safeParse({
      ...valid,
      email: 'a@b.com',
      phone: '090',
      company: 'ACME',
      position: 'CEO',
      status: 'prospect',
      tags: 'tag1',
      notes: 'note',
    }))
  })
})

// ─── deleteContactSchema ──────────────────────────────────
describe('deleteContactSchema', () => {
  it('accepts valid UUID', () => {
    expectSuccess(deleteContactSchema.safeParse({ contactId: VALID_UUID }))
  })

  it('rejects invalid UUID', () => {
    expectFail(deleteContactSchema.safeParse({ contactId: INVALID_UUID }))
  })

  it('rejects missing contactId', () => {
    expectFail(deleteContactSchema.safeParse({}))
  })
})

// ─── importContactSchema ─────────────────────────────────
describe('importContactSchema', () => {
  const valid = { first_name: '太郎', last_name: '山田' }

  it('accepts valid input', () => {
    expectSuccess(importContactSchema.safeParse(valid))
  })

  it('accepts with all fields', () => {
    expectSuccess(importContactSchema.safeParse({
      ...valid,
      email: 'a@b.com',
      phone: '090',
      company: 'ACME',
      position: 'CEO',
      status: 'prospect',
    }))
  })

  it('rejects empty first_name', () => {
    expectFail(importContactSchema.safeParse({ ...valid, first_name: '' }))
  })

  it('rejects empty last_name', () => {
    expectFail(importContactSchema.safeParse({ ...valid, last_name: '' }))
  })

  it('defaults status to lead', () => {
    const r = importContactSchema.safeParse(valid)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.status).toBe('lead')
  })
})

// ─── importContactsSchema ─────────────────────────────────
describe('importContactsSchema', () => {
  const validContact = { first_name: '太郎', last_name: '山田' }

  it('accepts array with 1 contact', () => {
    expectSuccess(importContactsSchema.safeParse({ contacts: [validContact] }))
  })

  it('rejects empty array', () => {
    const r = importContactsSchema.safeParse({ contacts: [] })
    expectFail(r)
    expect(firstMessage(r)).toBe('1件以上のコンタクトが必要です')
  })

  it('rejects over 1000 contacts', () => {
    const contacts = Array.from({ length: 1001 }, () => validContact)
    const r = importContactsSchema.safeParse({ contacts })
    expectFail(r)
    expect(firstMessage(r)).toBe('一度にインポートできるのは1000件までです')
  })

  it('accepts 1000 contacts', () => {
    const contacts = Array.from({ length: 1000 }, () => validContact)
    expectSuccess(importContactsSchema.safeParse({ contacts }))
  })

  it('rejects if any contact is invalid', () => {
    expectFail(importContactsSchema.safeParse({ contacts: [validContact, { first_name: '' }] }))
  })
})

// ─── createDealSchema ─────────────────────────────────────
describe('createDealSchema', () => {
  const valid = { title: 'Web制作案件' }

  it('accepts valid input with minimal fields', () => {
    expectSuccess(createDealSchema.safeParse(valid))
  })

  it('accepts valid input with all fields', () => {
    expectSuccess(createDealSchema.safeParse({
      ...valid,
      contact_id: VALID_UUID,
      value: 1000000,
      currency: 'JPY',
      stage: 'proposal',
      probability: 50,
      expected_close_date: '2026-12-31',
      notes: 'テスト',
    }))
  })

  it('trims title', () => {
    const r = createDealSchema.safeParse({ ...valid, title: '  案件  ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.title).toBe('案件')
  })

  it('rejects empty title', () => {
    const r = createDealSchema.safeParse({ ...valid, title: '' })
    expectFail(r)
    expect(firstMessage(r)).toBe('案件名は必須です')
  })

  it('accepts title of 200 chars', () => {
    expectSuccess(createDealSchema.safeParse({ ...valid, title: 'a'.repeat(200) }))
  })

  it('rejects title over 200 chars', () => {
    expectFail(createDealSchema.safeParse({ ...valid, title: 'a'.repeat(201) }))
  })

  it('defaults value to 0', () => {
    const r = createDealSchema.safeParse(valid)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.value).toBe(0)
  })

  it('rejects negative value', () => {
    expectFail(createDealSchema.safeParse({ ...valid, value: -1 }))
  })

  it('rejects value over 999 billion', () => {
    expectFail(createDealSchema.safeParse({ ...valid, value: 1_000_000_000_000 }))
  })

  it('accepts value of 999 billion', () => {
    expectSuccess(createDealSchema.safeParse({ ...valid, value: 999_999_999_999 }))
  })

  it('defaults currency to JPY', () => {
    const r = createDealSchema.safeParse(valid)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.currency).toBe('JPY')
  })

  it('rejects currency over 3 chars', () => {
    expectFail(createDealSchema.safeParse({ ...valid, currency: 'USDT' }))
  })

  it('defaults stage to lead', () => {
    const r = createDealSchema.safeParse(valid)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.stage).toBe('lead')
  })

  it('rejects invalid stage', () => {
    expectFail(createDealSchema.safeParse({ ...valid, stage: 'invalid' }))
  })

  it('defaults probability to 0', () => {
    const r = createDealSchema.safeParse(valid)
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.probability).toBe(0)
  })

  it('rejects probability over 100', () => {
    expectFail(createDealSchema.safeParse({ ...valid, probability: 101 }))
  })

  it('rejects negative probability', () => {
    expectFail(createDealSchema.safeParse({ ...valid, probability: -1 }))
  })

  it('accepts probability of 100', () => {
    expectSuccess(createDealSchema.safeParse({ ...valid, probability: 100 }))
  })

  it('accepts valid date format', () => {
    const r = createDealSchema.safeParse({ ...valid, expected_close_date: '2026-06-30' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.expected_close_date).toBe('2026-06-30')
  })

  it('rejects invalid date format', () => {
    expectFail(createDealSchema.safeParse({ ...valid, expected_close_date: '2026/06/30' }))
  })

  it('transforms empty date to undefined', () => {
    const r = createDealSchema.safeParse({ ...valid, expected_close_date: '' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.expected_close_date).toBeUndefined()
  })

  it('rejects invalid contact_id UUID', () => {
    expectFail(createDealSchema.safeParse({ ...valid, contact_id: INVALID_UUID }))
  })

  it('accepts valid contact_id UUID', () => {
    expectSuccess(createDealSchema.safeParse({ ...valid, contact_id: VALID_UUID }))
  })

  it('rejects notes over 5000 chars', () => {
    expectFail(createDealSchema.safeParse({ ...valid, notes: 'a'.repeat(5001) }))
  })
})

// ─── updateDealSchema ─────────────────────────────────────
describe('updateDealSchema', () => {
  const valid = { dealId: VALID_UUID, title: 'Updated Deal' }

  it('accepts valid input', () => {
    expectSuccess(updateDealSchema.safeParse(valid))
  })

  it('rejects invalid dealId', () => {
    expectFail(updateDealSchema.safeParse({ ...valid, dealId: INVALID_UUID }))
  })

  it('rejects empty title', () => {
    expectFail(updateDealSchema.safeParse({ ...valid, title: '' }))
  })

  it('rejects title over 200 chars', () => {
    expectFail(updateDealSchema.safeParse({ ...valid, title: 'a'.repeat(201) }))
  })

  it('accepts all fields', () => {
    expectSuccess(updateDealSchema.safeParse({
      ...valid,
      value: 500000,
      currency: 'USD',
      stage: 'negotiation',
      probability: 75,
      expected_close_date: '2026-12-01',
      notes: 'Updated note',
    }))
  })
})

// ─── updateDealStageSchema ────────────────────────────────
describe('updateDealStageSchema', () => {
  const valid = { dealId: VALID_UUID, stage: 'qualified' as const }

  it('accepts valid input', () => {
    expectSuccess(updateDealStageSchema.safeParse(valid))
  })

  it('rejects invalid dealId', () => {
    expectFail(updateDealStageSchema.safeParse({ ...valid, dealId: INVALID_UUID }))
  })

  it('rejects invalid stage', () => {
    expectFail(updateDealStageSchema.safeParse({ ...valid, stage: 'invalid' }))
  })

  it.each(['lead', 'qualified', 'proposal', 'negotiation', 'closed_won', 'closed_lost'] as const)(
    'accepts stage "%s"',
    (stage) => {
      expectSuccess(updateDealStageSchema.safeParse({ ...valid, stage }))
    },
  )

  it('rejects missing fields', () => {
    expectFail(updateDealStageSchema.safeParse({}))
  })
})

// ─── deleteDealSchema ─────────────────────────────────────
describe('deleteDealSchema', () => {
  it('accepts valid UUID', () => {
    expectSuccess(deleteDealSchema.safeParse({ dealId: VALID_UUID }))
  })

  it('rejects invalid UUID', () => {
    expectFail(deleteDealSchema.safeParse({ dealId: INVALID_UUID }))
  })

  it('rejects missing dealId', () => {
    expectFail(deleteDealSchema.safeParse({}))
  })
})

// ─── createActivitySchema ─────────────────────────────────
describe('createActivitySchema', () => {
  const valid = { type: 'call' as const, title: 'Follow-up call' }

  it('accepts valid input', () => {
    expectSuccess(createActivitySchema.safeParse(valid))
  })

  it('accepts with all optional fields', () => {
    expectSuccess(createActivitySchema.safeParse({
      ...valid,
      description: 'Call about renewal',
      deal_id: VALID_UUID,
      contact_id: VALID_UUID,
      scheduled_at: '2026-07-10T09:00:00Z',
    }))
  })

  it('trims title', () => {
    const r = createActivitySchema.safeParse({ ...valid, title: '  Call  ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.title).toBe('Call')
  })

  it('rejects empty title', () => {
    const r = createActivitySchema.safeParse({ ...valid, title: '' })
    expectFail(r)
    expect(firstMessage(r)).toBe('タイトルは必須です')
  })

  it('accepts title of 200 chars', () => {
    expectSuccess(createActivitySchema.safeParse({ ...valid, title: 'a'.repeat(200) }))
  })

  it('rejects title over 200 chars', () => {
    expectFail(createActivitySchema.safeParse({ ...valid, title: 'a'.repeat(201) }))
  })

  it('rejects invalid type', () => {
    expectFail(createActivitySchema.safeParse({ ...valid, type: 'sms' }))
  })

  it.each(['call', 'email', 'meeting', 'note', 'task'] as const)(
    'accepts type "%s"',
    (type) => {
      expectSuccess(createActivitySchema.safeParse({ ...valid, type }))
    },
  )

  it('rejects description over 5000 chars', () => {
    expectFail(createActivitySchema.safeParse({ ...valid, description: 'a'.repeat(5001) }))
  })

  it('accepts description of 5000 chars', () => {
    expectSuccess(createActivitySchema.safeParse({ ...valid, description: 'a'.repeat(5000) }))
  })

  it('rejects invalid deal_id UUID', () => {
    expectFail(createActivitySchema.safeParse({ ...valid, deal_id: INVALID_UUID }))
  })

  it('rejects invalid contact_id UUID', () => {
    expectFail(createActivitySchema.safeParse({ ...valid, contact_id: INVALID_UUID }))
  })

  it('rejects missing fields', () => {
    expectFail(createActivitySchema.safeParse({}))
  })
})

// ─── updateActivitySchema ─────────────────────────────────
describe('updateActivitySchema', () => {
  const valid = { activityId: VALID_UUID, title: 'Updated activity' }

  it('accepts valid input', () => {
    expectSuccess(updateActivitySchema.safeParse(valid))
  })

  it('rejects invalid activityId', () => {
    expectFail(updateActivitySchema.safeParse({ ...valid, activityId: INVALID_UUID }))
  })

  it('rejects empty title', () => {
    expectFail(updateActivitySchema.safeParse({ ...valid, title: '' }))
  })

  it('rejects title over 200 chars', () => {
    expectFail(updateActivitySchema.safeParse({ ...valid, title: 'a'.repeat(201) }))
  })

  it('accepts with type', () => {
    expectSuccess(updateActivitySchema.safeParse({ ...valid, type: 'meeting' }))
  })

  it('rejects invalid type', () => {
    expectFail(updateActivitySchema.safeParse({ ...valid, type: 'invalid' }))
  })
})

// ─── completeActivitySchema ───────────────────────────────
describe('completeActivitySchema', () => {
  it('accepts valid UUID', () => {
    expectSuccess(completeActivitySchema.safeParse({ activityId: VALID_UUID }))
  })

  it('rejects invalid UUID', () => {
    expectFail(completeActivitySchema.safeParse({ activityId: INVALID_UUID }))
  })

  it('rejects missing activityId', () => {
    expectFail(completeActivitySchema.safeParse({}))
  })
})

// ─── deleteActivitySchema ─────────────────────────────────
describe('deleteActivitySchema', () => {
  it('accepts valid UUID', () => {
    expectSuccess(deleteActivitySchema.safeParse({ activityId: VALID_UUID }))
  })

  it('rejects invalid UUID', () => {
    expectFail(deleteActivitySchema.safeParse({ activityId: INVALID_UUID }))
  })

  it('rejects missing activityId', () => {
    expectFail(deleteActivitySchema.safeParse({}))
  })
})

// ─── createTagSchema ──────────────────────────────────────
describe('createTagSchema', () => {
  it('accepts valid input', () => {
    expectSuccess(createTagSchema.safeParse({ name: 'VIP', color: '#FF0000' }))
  })

  it('accepts with default color', () => {
    const r = createTagSchema.safeParse({ name: 'VIP' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.color).toBe('#6B7280')
  })

  it('trims name', () => {
    const r = createTagSchema.safeParse({ name: '  VIP  ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.name).toBe('VIP')
  })

  it('rejects empty name', () => {
    const r = createTagSchema.safeParse({ name: '' })
    expectFail(r)
    expect(firstMessage(r)).toBe('タグ名は必須です')
  })

  it('accepts name of 50 chars', () => {
    expectSuccess(createTagSchema.safeParse({ name: 'a'.repeat(50) }))
  })

  it('rejects name over 50 chars', () => {
    expectFail(createTagSchema.safeParse({ name: 'a'.repeat(51) }))
  })

  it('accepts valid hex color', () => {
    expectSuccess(createTagSchema.safeParse({ name: 'tag', color: '#AABBCC' }))
  })

  it('rejects invalid color format', () => {
    const r = createTagSchema.safeParse({ name: 'tag', color: 'red' })
    expectFail(r)
    expect(firstMessage(r)).toBe('有効なカラーコードを入力してください（例: #FF0000）')
  })

  it('rejects 3-char hex color', () => {
    expectFail(createTagSchema.safeParse({ name: 'tag', color: '#FFF' }))
  })

  it('rejects color without hash', () => {
    expectFail(createTagSchema.safeParse({ name: 'tag', color: 'AABBCC' }))
  })

  it('accepts lowercase hex color', () => {
    expectSuccess(createTagSchema.safeParse({ name: 'tag', color: '#aabbcc' }))
  })
})

// ─── updateTagSchema ──────────────────────────────────────
describe('updateTagSchema', () => {
  const valid = { tagId: VALID_UUID, name: 'Updated Tag' }

  it('accepts valid input', () => {
    expectSuccess(updateTagSchema.safeParse(valid))
  })

  it('accepts with color', () => {
    expectSuccess(updateTagSchema.safeParse({ ...valid, color: '#00FF00' }))
  })

  it('rejects invalid tagId', () => {
    expectFail(updateTagSchema.safeParse({ ...valid, tagId: INVALID_UUID }))
  })

  it('rejects empty name', () => {
    expectFail(updateTagSchema.safeParse({ ...valid, name: '' }))
  })

  it('rejects name over 50 chars', () => {
    expectFail(updateTagSchema.safeParse({ ...valid, name: 'a'.repeat(51) }))
  })

  it('rejects invalid color format', () => {
    expectFail(updateTagSchema.safeParse({ ...valid, color: 'blue' }))
  })
})

// ─── deleteTagSchema ──────────────────────────────────────
describe('deleteTagSchema', () => {
  it('accepts valid UUID', () => {
    expectSuccess(deleteTagSchema.safeParse({ tagId: VALID_UUID }))
  })

  it('rejects invalid UUID', () => {
    expectFail(deleteTagSchema.safeParse({ tagId: INVALID_UUID }))
  })

  it('rejects missing tagId', () => {
    expectFail(deleteTagSchema.safeParse({}))
  })
})

// ─── createPipelineSchema ─────────────────────────────────
describe('createPipelineSchema', () => {
  const valid = { name: 'Sales Pipeline', stages: ['Lead', 'Qualified', 'Won'] }

  it('accepts valid input', () => {
    expectSuccess(createPipelineSchema.safeParse(valid))
  })

  it('trims name', () => {
    const r = createPipelineSchema.safeParse({ ...valid, name: '  Pipeline  ' })
    expect(r.success).toBe(true)
    if (r.success) expect(r.data.name).toBe('Pipeline')
  })

  it('rejects empty name', () => {
    const r = createPipelineSchema.safeParse({ ...valid, name: '' })
    expectFail(r)
    expect(firstMessage(r)).toBe('パイプライン名は必須です')
  })

  it('accepts name of 100 chars', () => {
    expectSuccess(createPipelineSchema.safeParse({ ...valid, name: 'a'.repeat(100) }))
  })

  it('rejects name over 100 chars', () => {
    expectFail(createPipelineSchema.safeParse({ ...valid, name: 'a'.repeat(101) }))
  })

  it('rejects empty stages array', () => {
    const r = createPipelineSchema.safeParse({ ...valid, stages: [] })
    expectFail(r)
    expect(firstMessage(r)).toBe('1つ以上のステージが必要です')
  })

  it('accepts 1 stage', () => {
    expectSuccess(createPipelineSchema.safeParse({ ...valid, stages: ['Lead'] }))
  })

  it('accepts 20 stages', () => {
    const stages = Array.from({ length: 20 }, (_, i) => `Stage ${i + 1}`)
    expectSuccess(createPipelineSchema.safeParse({ ...valid, stages }))
  })

  it('rejects over 20 stages', () => {
    const stages = Array.from({ length: 21 }, (_, i) => `Stage ${i + 1}`)
    expectFail(createPipelineSchema.safeParse({ ...valid, stages }))
  })

  it('rejects empty stage name', () => {
    expectFail(createPipelineSchema.safeParse({ ...valid, stages: ['Lead', ''] }))
  })

  it('rejects stage name over 50 chars', () => {
    expectFail(createPipelineSchema.safeParse({ ...valid, stages: ['a'.repeat(51)] }))
  })

  it('accepts stage name of 50 chars', () => {
    expectSuccess(createPipelineSchema.safeParse({ ...valid, stages: ['a'.repeat(50)] }))
  })

  it('rejects missing fields', () => {
    expectFail(createPipelineSchema.safeParse({}))
  })
})

// ─── updatePipelineSchema ─────────────────────────────────
describe('updatePipelineSchema', () => {
  const valid = { pipelineId: VALID_UUID, name: 'Updated Pipeline', stages: ['New', 'In Progress', 'Done'] }

  it('accepts valid input', () => {
    expectSuccess(updatePipelineSchema.safeParse(valid))
  })

  it('rejects invalid pipelineId', () => {
    expectFail(updatePipelineSchema.safeParse({ ...valid, pipelineId: INVALID_UUID }))
  })

  it('rejects empty name', () => {
    expectFail(updatePipelineSchema.safeParse({ ...valid, name: '' }))
  })

  it('rejects name over 100 chars', () => {
    expectFail(updatePipelineSchema.safeParse({ ...valid, name: 'a'.repeat(101) }))
  })

  it('rejects empty stages array', () => {
    expectFail(updatePipelineSchema.safeParse({ ...valid, stages: [] }))
  })

  it('rejects over 20 stages', () => {
    const stages = Array.from({ length: 21 }, (_, i) => `Stage ${i}`)
    expectFail(updatePipelineSchema.safeParse({ ...valid, stages }))
  })

  it('rejects missing fields', () => {
    expectFail(updatePipelineSchema.safeParse({}))
  })
})
