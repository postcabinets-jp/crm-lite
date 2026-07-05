'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  createContactSchema,
  updateContactSchema,
  deleteContactSchema,
  importContactsSchema,
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

export async function createContact(formData: FormData) {
  const parsed = createContactSchema.safeParse({
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    company: formData.get('company'),
    position: formData.get('position'),
    status: formData.get('status') || 'lead',
    tags: formData.get('tags'),
    notes: formData.get('notes'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const orgId = await getOrgId()
  if (!orgId) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('contacts')
    .insert({
      org_id: orgId,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      position: parsed.data.position || null,
      status: parsed.data.status,
      tags: parsed.data.tags,
      notes: parsed.data.notes || null,
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/contacts')
  return { success: 'コンタクトを作成しました' }
}

export async function updateContact(formData: FormData) {
  const parsed = updateContactSchema.safeParse({
    contactId: formData.get('contactId'),
    first_name: formData.get('first_name'),
    last_name: formData.get('last_name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    company: formData.get('company'),
    position: formData.get('position'),
    status: formData.get('status'),
    tags: formData.get('tags'),
    notes: formData.get('notes'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const orgId = await getOrgId()
  if (!orgId) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('contacts')
    .update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      email: parsed.data.email || null,
      phone: parsed.data.phone || null,
      company: parsed.data.company || null,
      position: parsed.data.position || null,
      status: parsed.data.status,
      tags: parsed.data.tags,
      notes: parsed.data.notes || null,
    })
    .eq('id', parsed.data.contactId)
    .eq('org_id', orgId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/contacts')
  return { success: 'コンタクトを更新しました' }
}

export async function deleteContact(formData: FormData) {
  const parsed = deleteContactSchema.safeParse({
    contactId: formData.get('contactId'),
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const orgId = await getOrgId()
  if (!orgId) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('contacts')
    .delete()
    .eq('id', parsed.data.contactId)
    .eq('org_id', orgId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/contacts')
  return { success: 'コンタクトを削除しました' }
}

export async function importContacts(data: { contacts: Array<Record<string, unknown>> }) {
  const parsed = importContactsSchema.safeParse(data)
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const orgId = await getOrgId()
  if (!orgId) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const rows = parsed.data.contacts.map((c) => ({
    org_id: orgId,
    first_name: c.first_name,
    last_name: c.last_name,
    email: c.email || null,
    phone: c.phone || null,
    company: c.company || null,
    position: c.position || null,
    status: c.status,
    tags: [],
  }))

  const { error } = await supabase.from('contacts').insert(rows)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/contacts')
  return { success: `${rows.length}件のコンタクトをインポートしました` }
}
