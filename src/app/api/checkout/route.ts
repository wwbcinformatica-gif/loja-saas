import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Rota para criar um link de pagamento (Preferência) no Mercado Pago
export async function POST(request: Request) {
  try {
    const { lojaId, lojaNome } = await request.json();

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      throw new Error('Configuração do Mercado Pago ausente (Access Token)');
    }

const token = (process.env.MERCADO_PAGO_ACCESS_TOKEN || '').trim();
const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://loja-saas-ten.vercel.app').trim().replace(/\/+$/, '');
console.log('siteUrl value:', siteUrl);
console.log('back_urls:', { success: `${siteUrl}/dashboard`, failure: `${siteUrl}/dashboard`, pending: `${siteUrl}/dashboard` });

    // Buscar o valor da mensalidade no banco
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data: loja } = await supabase
      .from("lojas")
      .select("valor_mensalidade")
      .eq("id", lojaId)
      .single();
    const valor = loja?.valor_mensalidade || 49.90;

    // Criar a preferência de pagamento
    const body = {
      items: [
        {
          id: 'mensalidade-pro',
          title: `Assinatura Mensal LojaSaaS - ${lojaNome}`,
          quantity: 1,
          unit_price: valor,
          currency_id: 'BRL',
          description: `Acesso total à plataforma LojaSaaS por 30 dias.`
        }
      ],
      external_reference: lojaId,
      payment_methods: {
        installments: 1
      }
    };
    console.log('MP Request:', JSON.stringify(body, null, 2));
    const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('MP Error Response:', errorData);
      throw new Error(errorData || 'Erro ao criar preferência no Mercado Pago');
    }

    const data = await response.json();

    return NextResponse.json({ url: data.init_point });

  } catch (error: any) {
    console.error('Erro no Checkout:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
