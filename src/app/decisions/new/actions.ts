'use server'

import { supabase } from '@/lib/supabase'
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'

export async function createDecision(formData: FormData) {
  const { userId } = await auth()
  if (!userId) throw new Error('Not authenticated')

  const options_considered = (formData.get('options_considered') as string)
    ?.split('\n')
    .map((o) => o.trim())
    .filter(Boolean)

  const tags = (formData.get('tags') as string)
    ?.split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  const { error } = await supabase.from('decisions').insert({
    user_id: userId,
    project: formData.get('project') as string,
    context: formData.get('context') as string,
    decision: formData.get('decision') as string,
    reasoning: formData.get('reasoning') as string,
    options_considered,
    trade_offs: formData.get('trade_offs') as string,
    outcome: formData.get('outcome') as string,
    tags,
  })

  if (error) throw new Error(error.message)

  redirect('/')
}