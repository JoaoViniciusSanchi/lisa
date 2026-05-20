import 'server-only';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { DEFAULT_FUZZY_CONFIG } from './types';
import type { FuzzyConfig } from './types';

const CONFIG_KEYS = [
  'fuzzy_peso_participacao',
  'fuzzy_peso_impacto',
  'fuzzy_peso_apropriacao',
  'fuzzy_peso_sustentabilidade',
  'fuzzy_peso_replicabilidade',
  'fuzzy_faixa_vermelho_max',
  'fuzzy_faixa_amarelo_max',
  'fuzzy_versao_motor',
  'fuzzy_gate_triagem_min'
] as const;

/**
 * Lê os pesos e thresholds fuzzy de configuracao_sistema (decisão 16).
 * Em caso de falha, retorna o DEFAULT_FUZZY_CONFIG e loga warning.
 *
 * NOTA: não usa cache. Cada chamada hidrata. Se virar gargalo, adicionar
 * cache em memória com TTL curto (~1min) — tipicamente isso é chamado
 * apenas no submit final do cadastro.
 */
export async function loadFuzzyConfig(): Promise<FuzzyConfig> {
  try {
    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from('configuracao_sistema')
      .select('chave, valor')
      .in('chave', [...CONFIG_KEYS]);

    if (error || !data) {
      console.warn('[fuzzy/config] erro ao ler configuracao_sistema:', error);
      return DEFAULT_FUZZY_CONFIG;
    }

    const map = new Map<string, unknown>();
    for (const row of data) {
      map.set(row.chave, row.valor);
    }

    const num = (key: string, fallback: number): number => {
      const v = map.get(key);
      return typeof v === 'number' ? v : fallback;
    };

    const str = (key: string, fallback: string): string => {
      const v = map.get(key);
      return typeof v === 'string' ? v : fallback;
    };

    return {
      pesos: {
        P: num('fuzzy_peso_participacao', 0.3),
        I: num('fuzzy_peso_impacto', 0.25),
        A: num('fuzzy_peso_apropriacao', 0.2),
        S: num('fuzzy_peso_sustentabilidade', 0.15),
        R: num('fuzzy_peso_replicabilidade', 0.1)
      },
      faixaVermelhoMax: num('fuzzy_faixa_vermelho_max', 0.3),
      faixaAmareloMax: num('fuzzy_faixa_amarelo_max', 0.7),
      versaoMotor: str('fuzzy_versao_motor', '2.0-fuzzy'),
      gateTriagemMin: num('fuzzy_gate_triagem_min', 0.3)
    };
  } catch (e) {
    console.warn('[fuzzy/config] exceção:', e);
    return DEFAULT_FUZZY_CONFIG;
  }
}
