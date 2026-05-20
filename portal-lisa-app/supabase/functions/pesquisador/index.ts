import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CadastroPesquisadorInput {
  nome: string;
  email: string;
  instituicao?: string;
  lattes?: string;
  departamento?: string;
  forproex_ids?: string[];
}

interface CadastroPesquisadorResponse {
  ok: boolean;
  error?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body: CadastroPesquisadorInput = await req.json();

    if (!body.nome?.trim() || !body.email?.trim()) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Nome e e-mail são obrigatórios.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: expert, error } = await supabase
      .from('pesquisador_expert')
      .insert({
        nome: body.nome.trim(),
        email: body.email.trim().toLowerCase(),
        instituicao: body.instituicao?.trim() || null,
        lattes: body.lattes?.trim() || null,
        departamento: body.departamento?.trim() || null,
        ativo: false,
      })
      .select('id')
      .single();

    if (error) {
      if (error.code === '23505') {
        return new Response(
          JSON.stringify({ ok: false, error: 'Este e-mail já está cadastrado.' }),
          { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      return new Response(
        JSON.stringify({ ok: false, error: 'Erro ao registrar. Tente novamente.' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (body.forproex_ids?.length && expert) {
      await supabase.from('expert_forproex').insert(
        body.forproex_ids.map((id) => ({ expert_id: expert.id, area_tematica_forproex_id: id }))
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'erro desconhecido';
    console.error('[pesquisador]', message);
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
