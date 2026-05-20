import { NextResponse } from 'next/server';

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
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim().replace(/^```json\n?/, '').replace(/\n?```$/, '');
    return NextResponse.json({ text });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erro desconhecido';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
