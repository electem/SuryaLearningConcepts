// src/twilio.ts
import Twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = Twilio(accountSid, authToken);

export async function sendSms({ to, body }: { to: string; body: string }) {
  // ensure E.164 on caller side ideally
  return client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
  });
}

export async function sendWhatsApp({ to, body }: { to: string; body: string }) { 
  // Twilio WhatsApp format requires "whatsapp:+<number>"
  const toWithPrefix = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  return client.messages.create({
    body,
    from: process.env.TWILIO_WHATSAPP_FROM, // e.g. 'whatsapp:+1415XXXXXX'
    to: toWithPrefix,
  });
}
