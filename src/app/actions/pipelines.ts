'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createPipelineSchema, updatePipelineSchema } from '@/lib/validations'

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

export async function createPipeline(formData: FormData) {
  const stagesRaw = formData.get('stages')
  const stages = typeof stagesRaw === 'string'
    ? stagesRaw.split('\n').map((s) => s.trim()).filter(Boolean)
    : []

  const parsed = createPipelineSchema.safeParse({
    name: formData.get('name'),
    stages,
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const orgId = await getOrgId()
  if (!orgId) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('pipelines')
    .insert({
      org_id: orgId,
      name: parsed.data.name,
      stages: parsed.data.stages,
    })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  return { success: 'パイプラインを作成しました' }
}

export async function updatePipeline(formData: FormData) {
  const stagesRaw = formData.get('stages')
  const stages = typeof stagesRaw === 'string'
    ? stagesRaw.split('\n').map((s) => s.trim()).filter(Boolean)
    : []

  const parsed = updatePipelineSchema.safeParse({
    pipelineId: formData.get('pipelineId'),
    name: formData.get('name'),
    stages,
  })
  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const orgId = await getOrgId()
  if (!orgId) return { error: '組織が見つかりません' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('pipelines')
    .update({
      name: parsed.data.name,
      stages: parsed.data.stages,
    })
    .eq('id', parsed.data.pipelineId)
    .eq('org_id', orgId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/settings')
  return { success: 'パイプラインを更新しました' }
}
