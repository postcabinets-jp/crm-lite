'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createTagSchema, updateTagSchema, deleteTagSchema } from '@/lib/validations'

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

export async function createTag(formData: FormData) {
  const parsed = createTagSchema.safeParse({
    name: formData.get('name'),
    color: formData.get('color') || '#6B7280',
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const orgId = await getOrgId()
  if (!orgId) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('tags')
    .insert({
      org_id: orgId,
      name: parsed.data.name,
      color: parsed.data.color,
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  return { success: 'タグを作成しました' }
}

export async function updateTag(formData: FormData) {
  const parsed = updateTagSchema.safeParse({
    tagId: formData.get('tagId'),
    name: formData.get('name'),
    color: formData.get('color'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const orgId = await getOrgId()
  if (!orgId) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const updateData: Record<string, string> = { name: parsed.data.name }
  if (parsed.data.color) updateData.color = parsed.data.color

  const { error } = await supabase
    .from('tags')
    .update(updateData)
    .eq('id', parsed.data.tagId)
    .eq('org_id', orgId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  return { success: 'タグを更新しました' }
}

export async function deleteTag(formData: FormData) {
  const parsed = deleteTagSchema.safeParse({
    tagId: formData.get('tagId'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const orgId = await getOrgId()
  if (!orgId) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('tags')
    .delete()
    .eq('id', parsed.data.tagId)
    .eq('org_id', orgId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  return { success: 'タグを削除しました' }
}
