'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()
  const email = formData.get('email')
  const password = formData.get('password')

  if (!email || typeof email !== 'string' || email.length > 255) {
    redirect('/login?error=Please provide a valid email address.')
  }

  if (!password || typeof password !== 'string' || password.length > 255) {
    redirect('/login?error=Please provide a valid password.')
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    if (error.status === 400 || error.message.includes('Invalid login credentials')) {
      redirect('/login?error=Invalid email or password. Please try again.')
    }
    redirect('/login?error=An unexpected error occurred during login. Please try again later.')
  }
  revalidatePath('/', 'layout')
  redirect('/')
}