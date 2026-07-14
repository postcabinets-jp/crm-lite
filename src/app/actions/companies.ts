'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createCompanySchema,
  updateCompanySchema,
  deleteCompanySchema,
} from '@/lib/validations'

async function getOrgId() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: org } = await supabase
    .from('organizations')
    .select('id')
    .eq('user_id', user.id)
    .limit(1)
    .single()

  return org?.id ?? null
}

export async function createCompany(formData: FormData) {
  const parsed = createCompanySchema.safeParse({
    name: formData.get('name'),
    domain: formData.get('domain'),
    industry: formData.get('industry'),
    employee_count: formData.get('employee_count')
      ? Number(formData.get('employee_count'))
      : null,
    website_url: formData.get('website_url'),
    notes: formData.get('notes'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const orgId = await getOrgId()
  if (!orgId) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase.from('companies').insert({
    org_id: orgId,
    name: parsed.data.name,
    domain: parsed.data.domain || null,
    industry: parsed.data.industry || null,
    employee_count: parsed.data.employee_count ?? null,
    website_url: parsed.data.website_url || null,
    notes: parsed.data.notes || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/companies')
  return { success: '会社を作成しました' }
}

export async function updateCompany(formData: FormData) {
  const parsed = updateCompanySchema.safeParse({
    companyId: formData.get('companyId'),
    name: formData.get('name'),
    domain: formData.get('domain'),
    industry: formData.get('industry'),
    employee_count: formData.get('employee_count')
      ? Number(formData.get('employee_count'))
      : null,
    website_url: formData.get('website_url'),
    notes: formData.get('notes'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const orgId = await getOrgId()
  if (!orgId) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('companies')
    .update({
      name: parsed.data.name,
      domain: parsed.data.domain || null,
      industry: parsed.data.industry || null,
      employee_count: parsed.data.employee_count ?? null,
      website_url: parsed.data.website_url || null,
      notes: parsed.data.notes || null,
    })
    .eq('id', parsed.data.companyId)
    .eq('org_id', orgId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/companies')
  return { success: '会社を更新しました' }
}

export async function deleteCompany(formData: FormData) {
  const parsed = deleteCompanySchema.safeParse({
    companyId: formData.get('companyId'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const orgId = await getOrgId()
  if (!orgId) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', parsed.data.companyId)
    .eq('org_id', orgId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/companies')
  return { success: '会社を削除しました' }
}
