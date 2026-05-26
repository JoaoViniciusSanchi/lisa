import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';

// Campos de texto para tradução
interface TextosPT {
  titulo?: string;
  historico?: string;
  metodologia?: string;
  resultadosImpactos?: string;
  desafiosPerspectivas?: string;
}

// Valida token de convite ativo (autenticação leve para esta rota)
async function validateToken(token: string): Promise<boolean> {
  if (!token) return false;
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from('convite_atualizacao')
    .select('id')
    .eq('token', token)
    .is('respondido_em', null)
    .gt('expira_em', new Date().toISOString())
    .maybeSingle();
  return Boolean(data);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { textos, conviteToken } = body as {
      textos: TextosPT;
      conviteToken?: string;
    };

    // Autenticação: conviteToken ou admin autenticado
    const isAdmin = req.headers.get('x-lisa-admin') === '1';
    const tokenValido = conviteToken ? await validateToken(conviteToken) : false;

    if (!isAdmin && !tokenValido) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'DEEPL_API_KEY não configurada' }, { status: 503 });
    }

    // Campos não-nulos para traduzir
    const fields = ['titulo', 'historico', 'metodologia', 'resultadosImpactos', 'desafiosPerspectivas'] as const;
    const resultado: Record<string, string> = {};

    for (const field of fields) {
      const texto = textos[field];
      if (!texto?.trim()) {
        resultado[field] = '';
        continue;
      }

      // Chamar DeepL Free API
      const deeplRes = await fetch('https://api-free.deepl.com/v2/translate', {
        method: 'POST',
        headers: {
          'Authorization': `DeepL-Auth-Key ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: [texto],
          source_lang: 'PT',
          target_lang: 'EN-US'
        })
      });

      if (!deeplRes.ok) {
        const errText = await deeplRes.text();
        console.error('[regerar-traducao] DeepL erro:', deeplRes.status, errText);
        return NextResponse.json(
          { error: `DeepL retornou ${deeplRes.status}` },
          { status: 502 }
        );
      }

      const deeplData = await deeplRes.json() as { translations: Array<{ text: string }> };
      resultado[field] = deeplData.translations[0]?.text ?? '';
    }

    return NextResponse.json(resultado);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'erro desconhecido';
    console.error('[regerar-traducao]', msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
