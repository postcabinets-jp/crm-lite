'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createOrganizationSchema, updateOrganizationSchema } from '@/lib/validations'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export async function createOrganization(formData: FormData) {
  const parsed = createOrganizationSchema.safeParse({
    name: formData.get('name'),
    industry: formData.get('industry'),
    website: formData.get('website'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const slug = slugify(parsed.data.name) + '-' + Date.now().toString(36)

  const { error } = await supabase
    .from('organizations')
    .insert({
      user_id: user.id,
      name: parsed.data.name,
      slug,
      industry: parsed.data.industry,
      website: parsed.data.website,
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: '組織を作成しました' }
}

export async function updateOrganization(formData: FormData) {
  const parsed = updateOrganizationSchema.safeParse({
    orgId: formData.get('orgId'),
    name: formData.get('name'),
    industry: formData.get('industry'),
    website: formData.get('website'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: '認証が必要です' }

  const { error } = await supabase
    .from('organizations')
    .update({
      name: parsed.data.name,
      industry: parsed.data.industry,
      website: parsed.data.website,
    })
    .eq('id', parsed.data.orgId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  return { success: '組織情報を更新しました' }
}
