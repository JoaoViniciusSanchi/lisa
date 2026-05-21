import { NextResponse } from 'next/server';

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 2000;
const BACKOFF_MULTIPLIER = 1.5;

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiWithRetry(apiKey: string, prompt: string, attempt = 1): Promise<string> {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return text;
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Erro desconhecido';
    const isRetryable = error.includes('503') || error.includes('Service Unavailable') || error.includes('timeout');

    if (isRetryable && attempt < MAX_RETRIES) {
      const delayMs = RETRY_DELAY_MS * Math.pow(BACKOFF_MULTIPLIER, attempt - 1);
      console.log(`[analyze-experience] tentativa ${attempt} falhou, aguardando ${delayMs}ms antes de nova tentativa...`);
      await sleep(delayMs);
      return callGeminiWithRetry(apiKey, prompt, attempt + 1);
    }

    throw new Error(`${error}${!isRetryable ? '' : ` (após ${attempt} tentativa${attempt > 1 ? 's' : ''})`}`);
  }
}

export async function POST(request: Request) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'GOOGLE_API_KEY não configurada' }, { status: 500 });
  }

  let prompt: string;
  try {
    const body = await request.json();
    prompt = body.prompt;
    if (!prompt || typeof prompt !== 'string') throw new Error('prompt ausente');
  } catch {
    return NextResponse.json({ error: 'Body inválido' }, { status: 400 });
  }

  try {
    const text = await callGeminiWithRetry(apiKey, prompt);
    return NextResponse.json({ text });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
