'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createDealSchema,
  updateDealSchema,
  updateDealStageSchema,
  deleteDealSchema,
} from '@/lib/validations'

async function getOrgId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  return org?.id ?? null
}

export async function createDeal(formData: FormData) {
  const parsed = createDealSchema.safeParse({
    title: formData.get('title'),
    contact_id: formData.get('contact_id'),
    value: Number(formData.get('value') || 0),
    currency: formData.get('currency') || 'JPY',
    stage: formData.get('stage') || 'lead',
    probability: Number(formData.get('probability') || 0),
    expected_close_date: formData.get('expected_close_date'),
    notes: formData.get('notes'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const orgId = await getOrgId()
  if (!orgId) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('deals')
    .insert({
      org_id: orgId,
      title: parsed.data.title,
      contact_id: parsed.data.contact_id || null,
      value: parsed.data.value,
      currency: parsed.data.currency,
      stage: parsed.data.stage,
      probability: parsed.data.probability,
      expected_close_date: parsed.data.expected_close_date || null,
      notes: parsed.data.notes || null,
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/deals')
  return { success: '案件を作成しました' }
}

export async function updateDeal(formData: FormData) {
  const parsed = updateDealSchema.safeParse({
    dealId: formData.get('dealId'),
    title: formData.get('title'),
    contact_id: formData.get('contact_id'),
    value: Number(formData.get('value') || 0),
    currency: formData.get('currency') || 'JPY',
    stage: formData.get('stage'),
    probability: Number(formData.get('probability') || 0),
    expected_close_date: formData.get('expected_close_date'),
    notes: formData.get('notes'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const orgId = await getOrgId()
  if (!orgId) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('deals')
    .update({
      title: parsed.data.title,
      contact_id: parsed.data.contact_id || null,
      value: parsed.data.value,
      currency: parsed.data.currency,
      stage: parsed.data.stage,
      probability: parsed.data.probability,
      expected_close_date: parsed.data.expected_close_date || null,
      notes: parsed.data.notes || null,
    })
    .eq('id', parsed.data.dealId)
    .eq('org_id', orgId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/deals')
  return { success: '案件を更新しました' }
}

export async function updateDealStage(formData: FormData) {
  const parsed = updateDealStageSchema.safeParse({
    dealId: formData.get('dealId'),
    stage: formData.get('stage'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const orgId = await getOrgId()
  if (!orgId) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('deals')
    .update({ stage: parsed.data.stage })
    .eq('id', parsed.data.dealId)
    .eq('org_id', orgId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/deals')
  return { success: 'ステージを更新しました' }
}

export async function deleteDeal(formData: FormData) {
  const parsed = deleteDealSchema.safeParse({
    dealId: formData.get('dealId'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const orgId = await getOrgId()
  if (!orgId) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('deals')
    .delete()
    .eq('id', parsed.data.dealId)
    .eq('org_id', orgId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/deals')
  return { success: '案件を削除しました' }
}
