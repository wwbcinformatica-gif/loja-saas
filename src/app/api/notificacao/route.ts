import { NextResponse } from 'next/server';

function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken || !accountSid.startsWith('AC')) {
    return null;
  }
  
  const twilio = require('twilio');
  return twilio(accountSid, authToken);
}

const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { telefone, mensagem } = body;

    if (!telefone || !mensagem) {
      return NextResponse.json({ error: 'Telefone e mensagem obrigatórios' }, { status: 400 });
    }

    const client = getTwilioClient();

    if (!client || !whatsappNumber) {
      console.log('Twilio não configurado. Notificação simulada:', { telefone, mensagem });
      return NextResponse.json({ success: true, simulada: true });
    }

    const formattedPhone = telefone.replace(/\D/g, '');
    const whatsappDestination = `whatsapp:+55${formattedPhone}`;

    const message = await client.messages.create({
      body: mensagem,
      from: whatsappNumber,
      to: whatsappDestination,
    });

    return NextResponse.json({ success: true, sid: message.sid });
  } catch (error: any) {
    console.error('Erro ao enviar WhatsApp:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}