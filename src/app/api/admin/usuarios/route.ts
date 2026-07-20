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

// Listar usuários
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

    // Combinar dados
    const dadosCombinados = usuarios.users.map(usuario => {
      const loja = lojas.find(l => l.owner_id === usuario.id)
      return {
        id: usuario.id,
        email: usuario.email,
        email_confirmed: !!usuario.email_confirmed_at,
        created_at: usuario.created_at,
        last_sign_in_at: usuario.last_sign_in_at,
        loja: loja ? {
          id: loja.id,
          nome: loja.nome,
          status: loja.status,
          plano: loja.plano,
          nome_completo: loja.nome_completo,
          telefone: loja.telefone,
          email: loja.email,
          empresa: loja.empresa,
          cnpj_cpf: loja.cnpj_cpf,
          cadastro_completo: loja.cadastro_completo,
          valor_mensalidade: loja.valor_mensalidade
        } : null
      }
    })

    return NextResponse.json({ 
      success: true,
      usuarios: dadosCombinados
    })

  } catch (error) {
    console.error('Erro ao listar usuários:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { error: `Erro interno: ${errorMessage}` }, 
      { status: 500 }
    )
  }
}

// Criar usuário
export async function POST(request: NextRequest) {
  try {
    const admin = await verificarAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { 
      email, 
      password, 
      nome_loja,
      nome_completo,
      telefone,
      email_contato,
      empresa,
      cnpj_cpf,
      plano = 'pro',
      status = 'ativo',
      valor_mensalidade = 49.90
    } = await request.json()

    if (!email || !password || !nome_loja) {
      return NextResponse.json({ error: 'Email, senha e nome da loja são obrigatórios' }, { status: 400 })
    }

    const adminClient = criarAdminClient()

    // 1. Criar usuário no auth
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true // Confirmar automaticamente
    })

    if (authError) {
      throw new Error(`Erro ao criar usuário: ${authError.message}`)
    }

    // 2. Determinar se cadastro está completo
    const camposObrigatorios = [nome_completo, telefone, email_contato, empresa, cnpj_cpf]
    const cadastroCompleto = camposObrigatorios.every(campo => campo && campo.toString().trim() !== '')

    // 3. Criar loja
    const { data: loja, error: lojaError } = await adminClient
      .from('lojas')
      .insert({
        owner_id: authUser.user.id,
        nome: nome_loja,
        nome_completo: nome_completo || null,
        telefone: telefone || null,
        email: email_contato || null,
        empresa: empresa || null,
        cnpj_cpf: cnpj_cpf || null,
        tema: 'dark-gold',
        hora_abertura: 9,
        hora_fechamento: 18,
        status,
        plano,
        valor_mensalidade,
        cadastro_completo: cadastroCompleto
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
      message: 'Usuário e loja criados com sucesso',
      usuario: {
        id: authUser.user.id,
        email: authUser.user.email,
        loja: loja
      }
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

// Editar usuário
export async function PUT(request: NextRequest) {
  try {
    const admin = await verificarAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { 
      userId,
      lojaId,
      email,
      nova_senha,
      nome_loja,
      nome_completo,
      telefone,
      email_contato,
      empresa,
      cnpj_cpf,
      plano,
      status,
      valor_mensalidade
    } = await request.json()

    if (!userId || !lojaId) {
      return NextResponse.json({ error: 'ID do usuário e da loja são obrigatórios' }, { status: 400 })
    }

    const adminClient = criarAdminClient()

    // 1. Atualizar email do usuário se fornecido
    if (email) {
      const { error: emailError } = await adminClient.auth.admin.updateUserById(userId, {
        email: email
      })
      
      if (emailError) {
        throw new Error(`Erro ao atualizar email: ${emailError.message}`)
      }
    }

    // 2. Atualizar senha se fornecida
    if (nova_senha) {
      const { error: senhaError } = await adminClient.auth.admin.updateUserById(userId, {
        password: nova_senha
      })
      
      if (senhaError) {
        throw new Error(`Erro ao atualizar senha: ${senhaError.message}`)
      }
    }

    // 3. Atualizar dados da loja
    const updateData: any = {}
    if (nome_loja !== undefined) updateData.nome = nome_loja
    if (nome_completo !== undefined) updateData.nome_completo = nome_completo
    if (telefone !== undefined) updateData.telefone = telefone
    if (email_contato !== undefined) updateData.email = email_contato
    if (empresa !== undefined) updateData.empresa = empresa
    if (cnpj_cpf !== undefined) updateData.cnpj_cpf = cnpj_cpf
    if (plano !== undefined) updateData.plano = plano
    if (status !== undefined) updateData.status = status
    if (valor_mensalidade !== undefined) updateData.valor_mensalidade = valor_mensalidade

    // Verificar se cadastro ficou completo
    const { data: lojaAtual } = await adminClient
      .from('lojas')
      .select('nome_completo, telefone, email, empresa, cnpj_cpf')
      .eq('id', lojaId)
      .single()

    if (lojaAtual) {
      const dadosFinais = { ...lojaAtual, ...updateData }
      const camposObrigatorios = [
        dadosFinais.nome_completo,
        dadosFinais.telefone,
        dadosFinais.email,
        dadosFinais.empresa,
        dadosFinais.cnpj_cpf
      ]
      updateData.cadastro_completo = camposObrigatorios.every(campo => campo && campo.toString().trim() !== '')
    }

    const { data: loja, error: updateError } = await adminClient
      .from('lojas')
      .update(updateData)
      .eq('id', lojaId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Erro ao atualizar loja: ${updateError.message}`)
    }

    return NextResponse.json({ 
      success: true,
      message: 'Usuário atualizado com sucesso',
      loja 
    })

  } catch (error) {
    console.error('Erro ao editar usuário:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { error: `Erro interno: ${errorMessage}` }, 
      { status: 500 }
    )
  }
}

// Deletar usuário
export async function DELETE(request: NextRequest) {
  try {
    const admin = await verificarAdmin()
    if (!admin) {
      return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
    }

    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json({ error: 'ID do usuário é obrigatório' }, { status: 400 })
    }

    const adminClient = criarAdminClient()

    // 1. Buscar loja do usuário
    const { data: loja, error: lojaError } = await adminClient
      .from('lojas')
      .select('id, nome')
      .eq('owner_id', userId)
      .single()

    if (lojaError && lojaError.code !== 'PGRST116') {
      throw new Error(`Erro ao buscar loja: ${lojaError.message}`)
    }

    if (loja) {
      // 2. Deletar dados relacionados da loja
      const tabelasParaDeletar = [
        'vendas_aprazo', 'produtos', 'agendamentos', 'funcionarios',
        'clientes', 'servicos', 'ordens_servico', 'orcamentos', 'devolucoes'
      ]

      for (const tabela of tabelasParaDeletar) {
        try {
          await adminClient
            .from(tabela)
            .delete()
            .eq('loja_id', loja.id)
        } catch (err) {
          console.log(`Aviso: Erro ao deletar da tabela ${tabela}:`, err)
        }
      }

      // 3. Deletar loja
      const { error: deleteLojaError } = await adminClient
        .from('lojas')
        .delete()
        .eq('id', loja.id)

      if (deleteLojaError) {
        throw new Error(`Erro ao deletar loja: ${deleteLojaError.message}`)
      }
    }

    // 4. Deletar usuário do auth
    const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(userId)
    
    if (deleteUserError) {
      throw new Error(`Erro ao deletar usuário: ${deleteUserError.message}`)
    }

    return NextResponse.json({ 
      success: true,
      message: loja ? `Usuário e loja "${loja.nome}" deletados com sucesso` : 'Usuário deletado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    return NextResponse.json(
      { error: `Erro interno: ${errorMessage}` }, 
      { status: 500 }
    )
  }
}