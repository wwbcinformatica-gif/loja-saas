import { createClient } from '@supabase/supabase-js'

// Tentar conectar na API do Supabase Dashboard
const SUPABASE_PLATFORM_URL = 'https://api.supabase.com'
const DASHBOARD_URL = 'https://app.supabase.com'

async function tryPlatformLogin() {
  // Tentativa 1: usar o cliente supabase para tentar login no dashboard
  console.log('Tentando login na plataforma Supabase...')
  
  const supabase = createClient(
    'https://api.supabase.com',
    'sb-publishable-key-here', // Isso pode nao funcionar
  )

  // Tentar chamar a API de autenticação do dashboard
  try {
    const response = await fetch(`${DASHBOARD_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'wwbcinformatica@gmail.com',
        password: 'Wwbc220408@'
      })
    })
    const data = await response.json()
    console.log('Login response:', JSON.stringify(data, null, 2))
  } catch (err) {
    console.error('Login error:', err.message)
  }
}

tryPlatformLogin()
