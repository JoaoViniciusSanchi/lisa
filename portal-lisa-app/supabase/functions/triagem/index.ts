import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const answers = body.answers;

    if (!answers) {
      return new Response(
        JSON.stringify({ error: 'answers ausente' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Load fuzzy config from database
    const { data: configData } = await supabase
      .from('configuracao_sistema')
      .select('chave, valor')
      .eq('chave', 'fuzzy_config')
      .single();

    const config = configData ? JSON.parse(configData.valor) : { gateTriagemMin: 30 };

    // Import fuzzy calculation (note: in a real edge function, you'd need to implement this)
    // For now, using a simplified version
    const result = {
      indice_fuzzy: 50,
      faixa: 'amarelo',
      medias: { P: 0.5, I: 0.5, A: 0.5, S: 0.5, R: 0.5 },
      pertinencias: {},
      ativacoes: {},
      indice_linear: 0.5,
      versao_motor: '1.0'
    };

    const liberado = result.indice_fuzzy >= config.gateTriagemMin;

    return new Response(
      JSON.stringify({
        result,
        liberado,
        gateThreshold: config.gateTriagemMin
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'erro desconhecido';
    console.error('[triagem]', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
