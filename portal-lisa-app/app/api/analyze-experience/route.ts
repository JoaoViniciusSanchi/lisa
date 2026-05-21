import { NextResponse } from 'next/server';

const RETRY_DELAY_MS = 2000;
const BACKOFF_MULTIPLIER = 1.5;

const MODELS_FALLBACK = [
  { name: 'gemini-3.1-flash', maxRetries: 3 },
  { name: 'gemini-3.5-flash', maxRetries: 2 }
];

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function callGeminiWithModel(
  apiKey: string,
  prompt: string,
  modelName: string,
  attempt = 1,
  maxRetries = 3
): Promise<string> {
  try {
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return text;
  } catch (e) {
    const error = e instanceof Error ? e.message : 'Erro desconhecido';
    const isRetryable =
      error.includes('503') ||
      error.includes('Service Unavailable') ||
      error.includes('timeout') ||
      error.includes('429'); // rate limit

    if (isRetryable && attempt < maxRetries) {
      const delayMs = RETRY_DELAY_MS * Math.pow(BACKOFF_MULTIPLIER, attempt - 1);
      console.log(`[${modelName}] tentativa ${attempt}/${maxRetries} falhou, aguardando ${delayMs}ms...`);
      await sleep(delayMs);
      return callGeminiWithModel(apiKey, prompt, modelName, attempt + 1, maxRetries);
    }

    throw new Error(`${modelName}: ${error}`);
  }
}

async function callGeminiWithFallback(apiKey: string, prompt: string): Promise<string> {
  const errors: string[] = [];

  for (const { name, maxRetries } of MODELS_FALLBACK) {
    try {
      console.log(`[analyze-experience] tentando modelo ${name}...`);
      const text = await callGeminiWithModel(apiKey, prompt, name, 1, maxRetries);
      console.log(`[analyze-experience] sucesso com ${name}`);
      return text;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erro desconhecido';
      errors.push(msg);
      console.log(`[analyze-experience] ${msg}, tentando próximo modelo...`);
    }
  }

  throw new Error(`Todos os modelos falharam: ${errors.join(' | ')}`);
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
    const text = await callGeminiWithFallback(apiKey, prompt);
    return NextResponse.json({ text });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
