// Wrapper singleton do cliente Resend — lazy init para não quebrar build estático
import { Resend } from 'resend';

let _client: Resend | null = null;

export function getResendClient(): Resend {
  if (!_client) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error('[email] RESEND_API_KEY não definida');
    }
    _client = new Resend(key);
  }
  return _client;
}
