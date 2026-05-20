import type { ExperienciaImport } from './types';
import { DIMENSIONS, DIMENSION_DB_KEY } from '@/lib/fuzzy/types';
import type { DimensionKey } from '@/lib/fuzzy/types';

// =============================================================
// Helpers de escape SQL
// =============================================================

function sqlStr(s: string | null | undefined): string {
  if (s == null) return 'NULL';
  return `'${s.replace(/'/g, "''")}'`;
}

function sqlBool(b: boolean): string {
  return b ? 'true' : 'false';
}

function sqlNum(n: number): string {
  // Garante que valores como 0.652 não viram notação científica
  return n.toFixed(10).replace(/\.?0+$/, '') || '0';
}

function sqlJson(obj: unknown): string {
  return `${sqlStr(JSON.stringify(obj))}::jsonb`;
}

function sqlDate(d: string | undefined): string {
  if (!d || !/^\d{4}-\d{2}-\d{2}$/.test(d)) return 'NULL';
  return sqlStr(d);
}

// =============================================================
// Gerador principal
// =============================================================

/**
 * Gera um bloco SQL completo (DO $$...$$) para uma experiência importada.
 * Usa subqueries para resolver IDs de taxonomias — não requer pré-fetch.
 * @param startSeq número sequencial inicial (obtido do banco antes de gerar SQL)
 */
function generateExperienciaBlock(exp: ExperienciaImport, seqIndex: number, startSeq: number = 0): string {
  const year = String(new Date().getFullYear()).slice(-2); // últimos 2 dígitos (26 para 2026)
  // Protocolo sequencial global: IMP-YY-NNNN (ex: IMP-26-0042)
  // Cada número é único no banco, impedindo conflitos mesmo em múltiplas importações
  const seqNumber = startSeq + seqIndex;
  const protocolo = `IMP-${year}-${String(seqNumber).padStart(4, '0')}`;
  const nowIso = new Date().toISOString();

  const lines: string[] = [];

  lines.push(`-- ============================================================`);
  lines.push(`-- IMPORT #${seqIndex + 1}: ${exp.titulo}`);
  lines.push(`-- CSV linha: ${exp._meta.csvRowIndex + 1} | Score: ${sqlNum(exp.fuzzyResult.indice_fuzzy)} (${exp.fuzzyResult.faixa})`);
  if (exp._meta.docxSource) {
    lines.push(`-- Fonte .docx: ${exp._meta.docxSource}`);
  }
  const resumidos = Object.entries(exp._meta.textsResumidos)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k}: ${v!.originalChars} → 3000 chars`)
    .join(', ');
  if (resumidos) lines.push(`-- Textos resumidos: ${resumidos}`);
  lines.push(`-- ============================================================`);
  lines.push('');

  lines.push('DO $$');
  lines.push('DECLARE');
  lines.push('  v_exp_id uuid := gen_random_uuid();');
  lines.push('  v_pessoa_id uuid;');
  lines.push('BEGIN');
  lines.push('');

  // ---- 1. Pessoa (coordenador) ----
  lines.push('  -- 1. Coordenador');
  lines.push(`  SELECT id INTO v_pessoa_id FROM pessoa WHERE email = ${sqlStr(exp.coordenador.email)};`);
  lines.push('  IF v_pessoa_id IS NULL THEN');
  lines.push('    v_pessoa_id := gen_random_uuid();');
  lines.push('    INSERT INTO pessoa (id, nome_completo, email, vinculo, departamento, lattes_url, telefone)');
  lines.push('    VALUES (');
  lines.push(`      v_pessoa_id,`);
  lines.push(`      ${sqlStr(exp.coordenador.nome)},`);
  lines.push(`      ${sqlStr(exp.coordenador.email)},`);
  lines.push(`      ${sqlStr(exp.coordenador.vinculo)},`);
  lines.push(`      ${sqlStr(exp.coordenador.departamento)},`);
  lines.push(`      ${sqlStr(exp.coordenador.lattes_url)},`);
  lines.push(`      ${sqlStr(exp.coordenador.telefone)}`);
  lines.push('    );');
  lines.push('  END IF;');
  lines.push('');

  // ---- 2. Experiência ----
  lines.push('  -- 2. Experiência');
  lines.push('  INSERT INTO experiencia (');
  lines.push('    id, titulo, slug, resumo, data_inicio, data_fim, is_perene, status,');
  lines.push('    campus_uff, municipio, uf, categoria_editorial_id, email_contato,');
  lines.push('    indice_fuzzy, faixa_fuzzy_atual, score_calculado_em');
  lines.push('  ) VALUES (');
  lines.push(`    v_exp_id,`);
  lines.push(`    ${sqlStr(exp.titulo)},`);
  lines.push(`    ${sqlStr(exp.slug)},`);
  lines.push(`    ${sqlStr(exp.resumo)},`);
  lines.push(`    ${sqlDate(exp.dataInicio)},`);
  lines.push(`    ${sqlDate(exp.dataFim)},`);
  lines.push(`    ${sqlBool(exp.isPerene)},`);
  lines.push(`    '${exp.statusImportado}',`);
  lines.push(`    ${sqlStr(exp.campusUff)},`);
  lines.push(`    ${sqlStr(exp.municipio)},`);
  lines.push(`    ${sqlStr(exp.uf)},`);
  if (exp.categoriaEditorial) {
    lines.push(`    (SELECT id FROM categoria_editorial WHERE nome = ${sqlStr(exp.categoriaEditorial)}),`);
  } else {
    lines.push('    NULL,');
  }
  lines.push(`    ${sqlStr(exp.emailContato)},`);
  lines.push(`    ${sqlNum(exp.fuzzyResult.indice_fuzzy)},`);
  lines.push(`    '${exp.fuzzyResult.faixa}',`);
  lines.push(`    '${nowIso}'`);
  lines.push('  );');
  lines.push('');

  // ---- 3. Experiência Tradução PT ----
  lines.push('  -- 3. Tradução PT (original)');
  lines.push('  INSERT INTO experiencia_traducao (');
  lines.push('    experiencia_id, idioma, titulo, historico, metodologia,');
  lines.push('    resultados_impactos, desafios_perspectivas, is_original, status_global');
  lines.push('  ) VALUES (');
  lines.push(`    v_exp_id, 'pt',`);
  lines.push(`    ${sqlStr(exp.titulo)},`);
  lines.push(`    ${sqlStr(exp.historico)},`);
  lines.push(`    ${sqlStr(exp.metodologia)},`);
  lines.push(`    ${sqlStr(exp.resultadosImpactos)},`);
  lines.push(`    ${sqlStr(exp.desafiosPerspectivas)},`);
  lines.push(`    true, 'publicavel'`);
  lines.push('  );');
  lines.push('');

  // ---- 3b. Experiência Tradução EN (se disponível) ----
  if (exp.historico_en || exp.metodologia_en || exp.resultados_impactos_en) {
    lines.push('  -- 3b. Tradução EN (quando disponível)');
    lines.push('  INSERT INTO experiencia_traducao (');
    lines.push('    experiencia_id, idioma, titulo, historico, metodologia,');
    lines.push('    resultados_impactos, desafios_perspectivas, is_original, status_global');
    lines.push('  ) VALUES (');
    lines.push(`    v_exp_id, 'en',`);
    lines.push(`    ${sqlStr(exp.titulo)},`);
    lines.push(`    ${sqlStr(exp.historico_en || '')},`);
    lines.push(`    ${sqlStr(exp.metodologia_en || '')},`);
    lines.push(`    ${sqlStr(exp.resultados_impactos_en || '')},`);
    lines.push(`    NULL,`);
    lines.push(`    false, 'pendente'`);
    lines.push('  );');
    lines.push('');
  }

  // ---- 4. Experiência Conteúdo ----
  const textoBruto = {
    historico: exp.historico,
    metodologia: exp.metodologia,
    resultados_impactos: exp.resultadosImpactos,
    desafios_perspectivas: exp.desafiosPerspectivas
  };

  lines.push('  -- 4. Conteúdo editorial');
  lines.push('  INSERT INTO experiencia_conteudo (');
  lines.push('    experiencia_id, email_contato_publico, instagram, facebook, youtube, site_externo,');
  lines.push('    versao_atual, texto_bruto_snapshot');
  lines.push('  ) VALUES (');
  lines.push(`    v_exp_id,`);
  lines.push(`    ${sqlStr(exp.emailContatoPublico ?? exp.emailContato)},`);
  lines.push(`    ${sqlStr(exp.instagram)},`);
  lines.push(`    ${sqlStr(exp.facebook)},`);
  lines.push(`    ${sqlStr(exp.youtube)},`);
  lines.push(`    ${sqlStr(exp.siteExterno)},`);
  lines.push(`    'publicado',`);
  lines.push(`    ${sqlJson(textoBruto)}`);
  lines.push('  );');
  lines.push('');

  // ---- 5. Experiência Pessoa ----
  lines.push('  -- 5. Vínculo coordenador');
  lines.push('  INSERT INTO experiencia_pessoa (experiencia_id, pessoa_id, papel, ordem)');
  lines.push('  VALUES (v_exp_id, v_pessoa_id, \'coordenador\', 0);');
  lines.push('');

  // ---- 5b. Membros da equipe ----
  if (exp.equipe.length > 0) {
    lines.push('  -- 5b. Membros da equipe');
    for (let i = 0; i < exp.equipe.length; i++) {
      const membro = exp.equipe[i];
      lines.push(`  v_pessoa_id := NULL;`);
      if (membro.email) {
        lines.push(`  SELECT id INTO v_pessoa_id FROM pessoa WHERE email = ${sqlStr(membro.email)};`);
      }
      lines.push('  IF v_pessoa_id IS NULL THEN');
      lines.push('    v_pessoa_id := gen_random_uuid();');
      lines.push('    INSERT INTO pessoa (id, nome_completo, email, vinculo)');
      lines.push('    VALUES (');
      lines.push(`      v_pessoa_id,`);
      lines.push(`      ${sqlStr(membro.nome)},`);
      lines.push(`      ${sqlStr(membro.email || '')},`);
      lines.push(`      ${sqlStr(membro.vinculo)}`);
      lines.push('    );');
      lines.push('  END IF;');
      lines.push('  INSERT INTO experiencia_pessoa (experiencia_id, pessoa_id, papel, ordem)');
      lines.push(`  VALUES (v_exp_id, v_pessoa_id, 'membro_equipe', ${i + 1});`);
    }
    lines.push('');
  }

  // ---- 6. Respostas Fuzzy ----
  lines.push('  -- 6. Respostas EFITS (20 perguntas)');
  lines.push('  INSERT INTO resposta_fuzzy (experiencia_id, pergunta_id, valor) VALUES');
  const respostaLines: string[] = [];
  for (const dim of DIMENSIONS) {
    const vals = exp.fuzzyAnswers[dim];
    for (let i = 0; i < 4; i++) {
      const codigo = `${dim}${i + 1}`;
      const valor = vals[i];
      respostaLines.push(
        `    (v_exp_id, (SELECT id FROM pergunta_fuzzy WHERE codigo = '${codigo}'), ${sqlNum(valor)})`
      );
    }
  }
  lines.push(respostaLines.join(',\n') + ';');
  lines.push('');

  // ---- 7. Justificativas ----
  const justifEntries = DIMENSIONS.filter(
    (d) => exp.justificativas[d as DimensionKey]?.trim()
  );

  if (justifEntries.length > 0) {
    lines.push('  -- 7. Justificativas por dimensão');
    lines.push('  INSERT INTO justificativa_dimensao (experiencia_id, dimensao, texto) VALUES');
    const justifLines = justifEntries.map((d) => {
      const dbKey = DIMENSION_DB_KEY[d as DimensionKey];
      const texto = exp.justificativas[d as DimensionKey]!.slice(0, 1000);
      return `    (v_exp_id, '${dbKey}', ${sqlStr(texto)})`;
    });
    lines.push(justifLines.join(',\n') + ';');
    lines.push('');
  }

  // ---- 8. Avaliação Fuzzy ----
  const fr = exp.fuzzyResult;
  const pertinenciasJson = JSON.stringify(fr.pertinencias);
  const ativacoesJson = JSON.stringify(fr.ativacoes);

  lines.push('  -- 8. Avaliação Fuzzy (snapshot)');
  lines.push('  INSERT INTO avaliacao_fuzzy (');
  lines.push('    experiencia_id, media_participacao, media_impacto, media_apropriacao,');
  lines.push('    media_sustentabilidade, media_replicabilidade,');
  lines.push('    pertinencias, ativacoes_fuzzy, indice_fuzzy, indice_linear, faixa, versao_motor');
  lines.push('  ) VALUES (');
  lines.push(`    v_exp_id,`);
  lines.push(`    ${sqlNum(fr.medias.P)}, ${sqlNum(fr.medias.I)}, ${sqlNum(fr.medias.A)},`);
  lines.push(`    ${sqlNum(fr.medias.S)}, ${sqlNum(fr.medias.R)},`);
  lines.push(`    ${sqlStr(pertinenciasJson)}::jsonb,`);
  lines.push(`    ${sqlStr(ativacoesJson)}::jsonb,`);
  lines.push(`    ${sqlNum(fr.indice_fuzzy)}, ${sqlNum(fr.indice_linear)},`);
  lines.push(`    '${fr.faixa}', ${sqlStr(fr.versao_motor)}`);
  lines.push('  );');
  lines.push('');

  // ---- 9. N:N Classificações ----

  // ODS
  if (exp.ods.length > 0) {
    lines.push('  -- 9a. ODS');
    lines.push('  INSERT INTO experiencia_ods (experiencia_id, ods_id, is_principal) VALUES');
    const odsLines = exp.ods.map(
      (o) => `    (v_exp_id, ${o.id}, ${sqlBool(o.isPrincipal)})`
    );
    lines.push(odsLines.join(',\n') + ';');
    lines.push('');
  }

  // CNPq Subareas
  if (exp.cnpqSubareas.length > 0) {
    lines.push('  -- 9b. CNPq Subareas');
    lines.push('  INSERT INTO experiencia_cnpq (experiencia_id, subarea_id, is_principal) VALUES');
    const cnpqLines = exp.cnpqSubareas.map(
      (s) =>
        `    (v_exp_id, (SELECT id FROM subarea_cnpq WHERE codigo = ${sqlStr(s.codigo)}), ${sqlBool(s.isPrincipal)})`
    );
    lines.push(cnpqLines.join(',\n') + ';');
    lines.push('');
  }

  // Macroareas TS
  if (exp.macroareas.length > 0) {
    lines.push('  -- 9c. Macroareas TS');
    lines.push('  INSERT INTO experiencia_macroarea (experiencia_id, macroarea_id, is_principal) VALUES');
    const macLines = exp.macroareas.map(
      (m) =>
        `    (v_exp_id, (SELECT id FROM macroarea_ts WHERE codigo = ${sqlStr(m.codigo)}), ${sqlBool(m.isPrincipal)})`
    );
    lines.push(macLines.join(',\n') + ';');
    lines.push('');
  }

  // FORPROEX
  if (exp.forproexCodigos.length > 0) {
    lines.push('  -- 9d. FORPROEX');
    lines.push('  INSERT INTO experiencia_forproex (experiencia_id, forproex_id)');
    lines.push(`  SELECT v_exp_id, id FROM area_tematica_forproex WHERE codigo IN (${exp.forproexCodigos.map(sqlStr).join(', ')});`);
    lines.push('');
  }

  // Finalidade Social
  if (exp.finalidadeSocialCodigos.length > 0) {
    lines.push('  -- 9e. Finalidade Social');
    lines.push('  INSERT INTO experiencia_finalidade_social (experiencia_id, finalidade_id)');
    lines.push(`  SELECT v_exp_id, id FROM finalidade_social WHERE codigo IN (${exp.finalidadeSocialCodigos.map(sqlStr).join(', ')});`);
    lines.push('');
  }

  // Público Alvo
  if (exp.publicoAlvoCodigos.length > 0) {
    lines.push('  -- 9f. Público Alvo');
    lines.push('  INSERT INTO experiencia_publico_alvo (experiencia_id, publico_alvo_id)');
    lines.push(`  SELECT v_exp_id, id FROM publico_alvo WHERE codigo IN (${exp.publicoAlvoCodigos.map(sqlStr).join(', ')});`);
    lines.push('');
  }

  // Tipo Solução
  if (exp.tipoSolucaoCodigos.length > 0) {
    lines.push('  -- 9g. Tipo Solução');
    lines.push('  INSERT INTO experiencia_tipo_solucao (experiencia_id, tipo_solucao_id)');
    lines.push(`  SELECT v_exp_id, id FROM tipo_solucao WHERE codigo IN (${exp.tipoSolucaoCodigos.map(sqlStr).join(', ')});`);
    lines.push('');
  }

  // Arranjo Institucional
  if (exp.arranjoCodigos.length > 0) {
    lines.push('  -- 9h. Arranjo Institucional');
    lines.push('  INSERT INTO experiencia_arranjo (experiencia_id, arranjo_id)');
    lines.push(`  SELECT v_exp_id, id FROM arranjo_institucional WHERE codigo IN (${exp.arranjoCodigos.map(sqlStr).join(', ')});`);
    lines.push('');
  }

  // ---- 10. Histórico de Status ----
  lines.push('  -- 10. Histórico de status');
  lines.push('  INSERT INTO historico_status (experiencia_id, status_anterior, status_novo, motivo, alterado_por)');
  lines.push(`  VALUES (v_exp_id, NULL, '${exp.statusImportado}', 'Importado do catálogo LISA 2024', 'admin-import');`);
  lines.push('');

  // ---- 11. Submissão (auditoria) ----
  const respostasBrutas = { origem: 'import', csv_row: exp._meta.csvRowIndex + 1, docx: exp._meta.docxSource ?? null };
  const triagemResultado = { indice_fuzzy: fr.indice_fuzzy, indice_linear: fr.indice_linear, faixa: fr.faixa };

  lines.push('  -- 11. Submissão (snapshot de auditoria)');
  lines.push('  INSERT INTO submissao_formulario (');
  lines.push('    experiencia_id, protocolo, respostas_brutas, triagem_resultado, versao_motor_fuzzy, user_agent');
  lines.push('  ) VALUES (');
  lines.push(`    v_exp_id,`);
  lines.push(`    ${sqlStr(protocolo)},`);
  lines.push(`    ${sqlJson(respostasBrutas)},`);
  lines.push(`    ${sqlJson(triagemResultado)},`);
  lines.push(`    ${sqlStr(fr.versao_motor)},`);
  lines.push(`    'admin-import-tool'`);
  lines.push('  );');
  lines.push('');

  lines.push('END $$;');

  return lines.join('\n');
}

/**
 * Gera o arquivo SQL completo para todas as experiências aprovadas.
 * @param startSeq número sequencial inicial (obtido do banco para evitar duplicatas)
 */
export function generateImportSql(experiences: ExperienciaImport[], startSeq: number = 0): string {
  const approved = experiences.filter((e) => e._meta.reviewStatus === 'approved');

  if (approved.length === 0) return '-- Nenhuma experiência aprovada para importação.';

  const header = [
    '-- ============================================================',
    '-- LISA — SQL de Importação de Experiências do Catálogo 2024',
    `-- Gerado em: ${new Date().toISOString()}`,
    `-- Total: ${approved.length} experiência(s)`,
    `-- Sequência: ${String(startSeq).padStart(4, '0')} a ${String(startSeq + approved.length - 1).padStart(4, '0')}`,
    '-- INSTRUÇÃO: Copie e cole no SQL Editor do Supabase.',
    '-- Cada bloco DO $$ ... $$ é uma transação independente.',
    '-- ============================================================',
    ''
  ].join('\n');

  const blocks = approved.map((exp, i) => generateExperienciaBlock(exp, i, startSeq));

  return header + blocks.join('\n\n');
}
