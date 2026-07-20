import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Rota para receber notificações do Mercado Pago (Webhook)
export async function POST(request: Request) {
  try {
    // 1. Pegar o corpo da requisição do Mercado Pago
    const body = await request.json();
    console.log('--- Notificação Mercado Pago Recebida ---', body);

    // O Mercado Pago envia o ID do pagamento no campo data.id
    const paymentId = body.data?.id || body.id;
    
    if (!paymentId) {
      return NextResponse.json({ error: 'ID de pagamento não encontrado' }, { status: 400 });
    }

    // 2. Consultar o status real do pagamento na API do Mercado Pago
    const token = (process.env.MERCADO_PAGO_ACCESS_TOKEN || '').trim();
    const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!mpResponse.ok) {
      throw new Error('Falha ao consultar pagamento no Mercado Pago');
    }

    const paymentData = await mpResponse.json();
    console.log('Status do Pagamento:', paymentData.status);

    // 3. Se o pagamento estiver APROVADO
    if (paymentData.status === 'approved') {
      const lojaId = paymentData.external_reference; // Identificador da loja que passamos na criação do link
      
      if (!lojaId) {
        throw new Error('ID da loja (external_reference) ausente no pagamento');
      }

      // Conectar ao Supabase com a Service Role (para ignorar RLS e atualizar status)
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      // Calcular data de expiração (Hoje + 30 dias)
      const dataExpira = new Date();
      dataExpira.setDate(dataExpira.getDate() + 30);

      // 4. Atualizar a loja no banco de dados
      const { error } = await supabase
        .from('lojas')
        .update({
          status: 'ativo',
          expira_em: dataExpira.toISOString(),
          plano: 'pro'
        })
        .eq('id', lojaId);

      if (error) throw error;
      
      console.log(`✅ Sucesso: Loja ${lojaId} ativada por mais 30 dias.`);
    }

    return NextResponse.json({ status: 'ok' }, { status: 200 });

  } catch (error: any) {
    console.error('❌ Erro no Webhook Pagamento:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
