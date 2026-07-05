'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createActivitySchema,
  updateActivitySchema,
  completeActivitySchema,
  deleteActivitySchema,
} from '@/lib/validations'

async function getOrgAndUserId() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  return org ? { orgId: org.id, userId: user.id } : null
}

export async function createActivity(formData: FormData) {
  const parsed = createActivitySchema.safeParse({
    type: formData.get('type'),
    title: formData.get('title'),
    description: formData.get('description'),
    deal_id: formData.get('deal_id'),
    contact_id: formData.get('contact_id'),
    scheduled_at: formData.get('scheduled_at'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const ctx = await getOrgAndUserId()
  if (!ctx) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('activities')
    .insert({
      org_id: ctx.orgId,
      user_id: ctx.userId,
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description || null,
      deal_id: parsed.data.deal_id || null,
      contact_id: parsed.data.contact_id || null,
      scheduled_at: parsed.data.scheduled_at || null,
      completed: false,
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/activities')
  return { success: 'アクティビティを作成しました' }
}

export async function updateActivity(formData: FormData) {
  const parsed = updateActivitySchema.safeParse({
    activityId: formData.get('activityId'),
    type: formData.get('type'),
    title: formData.get('title'),
    description: formData.get('description'),
    deal_id: formData.get('deal_id'),
    contact_id: formData.get('contact_id'),
    scheduled_at: formData.get('scheduled_at'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const ctx = await getOrgAndUserId()
  if (!ctx) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('activities')
    .update({
      type: parsed.data.type,
      title: parsed.data.title,
      description: parsed.data.description || null,
      deal_id: parsed.data.deal_id || null,
      contact_id: parsed.data.contact_id || null,
      scheduled_at: parsed.data.scheduled_at || null,
    })
    .eq('id', parsed.data.activityId)
    .eq('org_id', ctx.orgId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/activities')
  return { success: 'アクティビティを更新しました' }
}

export async function completeActivity(formData: FormData) {
  const parsed = completeActivitySchema.safeParse({
    activityId: formData.get('activityId'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const ctx = await getOrgAndUserId()
  if (!ctx) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('activities')
    .update({
      completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq('id', parsed.data.activityId)
    .eq('org_id', ctx.orgId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/activities')
  return { success: 'アクティビティを完了しました' }
}

export async function deleteActivity(formData: FormData) {
  const parsed = deleteActivitySchema.safeParse({
    activityId: formData.get('activityId'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const ctx = await getOrgAndUserId()
  if (!ctx) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', parsed.data.activityId)
    .eq('org_id', ctx.orgId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/activities')
  return { success: 'アクティビティを削除しました' }
}
