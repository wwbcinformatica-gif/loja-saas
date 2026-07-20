import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

async function verificarAdmin() {
  const cookieStore = await cookies()
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set() {},
        remove() {},
      },
    }
  )

  const { data: { user }, error: authError } = await authClient.auth.getUser()
  
  if (authError || !user || user.email?.toLowerCase() !== 'wwbcinformatica@gmail.com') {
    return null
  }
  
  return user
}

function criarAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        get() { return '' },
        set() {},
        remove() {},
      },
    }
  )
}

// Listar todos os usuários e lojas
export async function GET(request: NextRequest) {
  try {
    const admin = await verificarAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const adminClient = criarAdminClient()
    
    // Buscar usuários do auth
    const { data: usuarios, error: usuariosError } = await adminClient.auth.admin.listUsers()
    if (usuariosError) {
      throw new Error(`Erro ao listar usuários: ${usuariosError.message}`)
    }

    // Buscar lojas
    const { data: lojas, error: lojasError } = await adminClient
      .from('lojas')
      .select('*')
      .order('created_at', { ascending: false })

    if (lojasError) {
      throw new Error(`Erro ao listar lojas: ${lojasError.message}`)
    }

    // Combinar dados de usuários e lojas
    const dadosCombinados = usuarios.users.map(usuario => {
      const loja = lojas.find(l => l.owner_id === usuario.id)
      return {
        ...usuario,
        loja: loja || null
      }
    })

    return NextResponse.json({ 
      success: true,
      usuarios: dadosCombinados,
      totalUsuarios: usuarios.users.length,
      totalLojas: lojas.length
    })

  } catch (error) {
    console.error('Erro ao listar dados:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { error: `Erro interno: ${errorMessage}` }, 
      { status: 500 }
    )
  }
}

// Criar novo usuário
export async function POST(request: NextRequest) {
  try {
    const admin = await verificarAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { email, password, nome, plano = 'pro' } = await request.json()

    if (!email || !password || !nome) {
      return NextResponse.json({ error: 'Email, senha e nome da loja são obrigatórios' }, { status: 400 })
    }

    const adminClient = criarAdminClient()

    // 1. Criar usuário no auth
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Confirmar email automaticamente
    })

    if (authError) {
      throw new Error(`Erro ao criar usuário: ${authError.message}`)
    }

    // 2. Criar loja
    const { data: loja, error: lojaError } = await adminClient
      .from('lojas')
      .insert({
        owner_id: authUser.user.id,
        nome,
        tema: 'dark-gold',
        hora_abertura: 9,
        hora_fechamento: 18,
        status: 'ativo',
        plano,
        cadastro_completo: false
      })
      .select()
      .single()

    if (lojaError) {
      // Se falhar, deletar usuário criado
      await adminClient.auth.admin.deleteUser(authUser.user.id)
      throw new Error(`Erro ao criar loja: ${lojaError.message}`)
    }

    return NextResponse.json({ 
      success: true, 
      usuario: { email, id: authUser.user.id },
      loja: loja 
    })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { error: `Erro interno: ${errorMessage}` }, 
      { status: 500 }
    )
  }
}

// Editar dados do lojista
export async function PUT(request: NextRequest) {
  try {
    const admin = await verificarAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { 
      lojaId, 
      nome, 
      nome_completo, 
      telefone, 
      email, 
      site, 
      valor_mensalidade,
      status,
      plano 
    } = await request.json()

    if (!lojaId) {
      return NextResponse.json({ error: 'ID da loja é obrigatório' }, { status: 400 })
    }

    const adminClient = criarAdminClient()

    // Atualizar dados da loja
    const updateData: any = {}
    if (nome !== undefined) updateData.nome = nome
    if (nome_completo !== undefined) updateData.nome_completo = nome_completo
    if (telefone !== undefined) updateData.telefone = telefone
    if (email !== undefined) updateData.email = email
    if (site !== undefined) updateData.site = site
    if (valor_mensalidade !== undefined) updateData.valor_mensalidade = valor_mensalidade
    if (status !== undefined) updateData.status = status
    if (plano !== undefined) updateData.plano = plano

    const { data: loja, error: updateError } = await adminClient
      .from('lojas')
      .update(updateData)
      .eq('id', lojaId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Erro ao atualizar loja: ${updateError.message}`)
    }

    return NextResponse.json({ success: true, loja })

  } catch (error) {
    console.error('Erro ao editar lojista:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { error: `Erro interno: ${errorMessage}` }, 
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await verificarAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const body = await request.json()
    const { lojaId } = body

    console.log('📝 Dados recebidos para deleção:', body)

    if (!lojaId) {
      return NextResponse.json({ error: 'ID da loja é obrigatório' }, { status: 400 })
    }

    const adminClient = criarAdminClient()

    // Primeiro buscar dados da loja para obter owner_id
    const { data: loja, error: lojaError } = await adminClient
      .from('lojas')
      .select('owner_id, nome')
      .eq('id', lojaId)
      .single()

    if (lojaError) {
      throw new Error(`Loja não encontrada: ${lojaError.message}`)
    }

    console.log('🏪 Loja encontrada:', loja)

    // 1. Deletar dados relacionados
    const tabelasParaDeletar = [
      'vendas_aprazo',
      'produtos', 
      'agendamentos',
      'funcionarios',
      'clientes',
      'servicos',
      'ordens_servico',
      'orcamentos',
      'devolucoes'
    ]

    let deletedCount = 0
    for (const tabela of tabelasParaDeletar) {
      try {
        const { count, error } = await adminClient
          .from(tabela)
          .delete({ count: 'exact' })
          .eq('loja_id', lojaId)
        
        if (!error && count !== null) {
          deletedCount += count
          console.log(`✅ Deletados ${count} registros da tabela ${tabela}`)
        }
      } catch (err) {
        console.log(`⚠️ Erro ao deletar da tabela ${tabela}:`, err)
        // Continue mesmo com erro em tabelas específicas
      }
    }

    // 2. Deletar a loja
    const { error: deleteLojaError } = await adminClient
      .from('lojas')
      .delete()
      .eq('id', lojaId)

    if (deleteLojaError) {
      throw new Error(`Erro ao deletar loja: ${deleteLojaError.message}`)
    }

    console.log('✅ Loja deletada com sucesso')

    // 3. Deletar usuário do auth se tiver owner_id
    if (loja.owner_id) {
      try {
        const { error: userDeleteError } = await adminClient.auth.admin.deleteUser(loja.owner_id)
        if (userDeleteError) {
          console.log("⚠️ Erro ao deletar usuário do auth:", userDeleteError.message)
        } else {
          console.log("✅ Usuário deletado do auth")
        }
      } catch (authDeleteError) {
        console.log("⚠️ Não foi possível deletar do auth:", authDeleteError)
      }
    }

    return NextResponse.json({ 
      success: true, 
      deletedRecords: deletedCount,
      message: `Loja "${loja.nome}" e ${deletedCount} registros relacionados foram deletados`
    })

  } catch (error) {
    console.error('Erro ao deletar conta:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { error: `Erro interno: ${errorMessage}` }, 
      { status: 500 }
    )
  }
}