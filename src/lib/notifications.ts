import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER;

const client = accountSid && authToken ? twilio(accountSid, authToken) : null;

export interface NotificationData {
  telefone: string;
  mensagem: string;
}

export async function sendWhatsAppNotification(data: NotificationData): Promise<boolean> {
  if (!client || !whatsappNumber) {
    console.log('Twilio não configurado. Mensagem simulada:', data);
    return false;
  }

  try {
    const formattedPhone = data.telefone.replace(/\D/g, '');
    const whatsappDestination = `whatsapp:+55${formattedPhone}`;

    await client.messages.create({
      body: data.mensagem,
      from: whatsappNumber,
      to: whatsappDestination,
    });

    return true;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return false;
  }
}

export function formatPhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

export const NotificationTemplates = {
  agendamentoConfirmado: (cliente: string, servico: string, data: string, hora: string, loja: string) => 
    `✅ *Agendamento Confirmado*\n\nOlá ${cliente}!\nSeu horário foi confirmado.\n\n📅 *Servico:* ${servico}\n🕐 *Data:* ${data} às ${hora}\n🏪 *Loja:* ${loja}\n\nAguardamos você!`,

  agendamentoCancelado: (cliente: string, servico: string, data: string, hora: string, loja: string) =>
    `❌ *Agendamento Cancelado*\n\nOlá ${cliente}!\nSeu agendamento foi cancelado.\n\n📅 *Servico:* ${servico}\n🕐 *Data:* ${data} às ${hora}\n🏪 *Loja:* ${loja}\n\nCaso precise reagendar,联系我们!`,

  lembrete: (cliente: string, servico: string, data: string, hora: string, loja: string) =>
    `⏰ *Lembrete de Agendamento*\n\nOlá ${cliente}!\nVocê tem um horario amanhã.\n\n📅 *Servico:* ${servico}\n🕐 *Data:* ${data} às ${hora}\n🏪 *Loja:* ${loja}\n\nAté amanhã!`,
};