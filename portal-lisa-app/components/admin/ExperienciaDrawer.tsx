// @ts-nocheck
'use client';

import { useState, useTransition } from 'react';
import { FuzzyBadge, DimBar } from './FuzzyBadge';
import { approveExperiencia, rejectExperiencia, updateIsInternaAction } from '@/lib/admin/actions';

interface DrawerProps {
  details: {
    exp: Record<string, unknown> | null;
    avaliacao: Record<string, unknown> | null;
    respostas: unknown[];
    pessoas: unknown[];
    anexos: unknown[];
    traducaoPt: Record<string, unknown> | null;
    justificativas: unknown[];
  } | null;
  onClose: () => void;
  showActions?: boolean;
}

type AcaoModal = 'aprovar' | 'rejeitar' | null;

const PAPEL_LABEL: Record<string, string> = {
  coordenador: 'Coordenador',
  vice_coordenador: 'Vice-coordenador',
  membro_equipe: 'Membro da equipe',
  representante_comunidade: 'Representante da comunidade',
  parceiro_externo: 'Parceiro externo'
};

const VINCULO_LABEL: Record<string, string> = {
  docente: 'Docente',
  tecnico_administrativo: 'Técnico-administrativo',
  estudante_graduacao: 'Estudante de graduação',
  estudante_pos: 'Estudante de pós-graduação',
  pesquisador_externo: 'Pesquisador externo',
  membro_comunidade: 'Membro da comunidade',
  representante_organizacao: 'Representante de organização',
  outro: 'Outro'
};

const CAMPO_LABEL: Record<string, string> = {
  historico: 'Histórico',
  metodologia: 'Metodologia',
  resultados_impactos: 'Resultados e impactos',
  desafios_perspectivas: 'Desafios e perspectivas'
};

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-[11px] uppercase tracking-eyebrow text-warm-white/40 mb-3 pb-2 border-b border-line/40">
      {children}
    </div>
  );
}

export function ExperienciaDrawer({ details, onClose, showActions = true }: DrawerProps) {
  const [acao, setAcao] = useState<AcaoModal>(null);
  const [motivo, setMotivo] = useState('');
  const [isPerene, setIsPerene] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState('');
  const [internaFeedback, setInternaFeedback] = useState('');

  if (!details?.exp) {
    return (
      <>
        <div className="fixed inset-0 bg-black/70 z-40" onClick={onClose} />
        <div className="fixed right-0 top-0 bottom-0 w-[720px] max-w-[95vw] bg-bg-base border-l border-line z-50 flex items-center justify-center">
          <div className="text-warm-white/30 text-sm">Carregando...</div>
        </div>
      </>
    );
  }

  const exp = details.exp as Record<string, unknown>;
  const avaliacao = details.avaliacao as Record<string, unknown> | null;
  const trad = details.traducaoPt as Record<string, unknown> | null;
  const experienciaId = exp.id as string;

  const rawConteudo = exp.experiencia_conteudo;
  const conteudo = Array.isArray(rawConteudo)
    ? (rawConteudo as Record<string, unknown>[])[0]
    : (rawConteudo as Record<string, unknown> | undefined);

  const rawCategoria = exp.categoria_editorial;
  const categoria = Array.isArray(rawCategoria)
    ? (rawCategoria as Record<string, string>[])[0]
    : (rawCategoria as Record<string, string> | undefined);

  function formatDate(d: unknown) {
    if (!d) return '—';
    return new Date(d as string).toLocaleDateString('pt-BR');
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  function getAnexoUrl(anexo: Record<string, unknown>): string | null {
    if (anexo.url_externa) return anexo.url_externa as string;
    if (anexo.caminho_storage && supabaseUrl) {
      return `${supabaseUrl}/storage/v1/object/public/anexos-experiencias/${anexo.caminho_storage}`;
    }
    return null;
  }

  const fotos = (details.anexos as Record<string, unknown>[]).filter(a => {
    const tipo = (a.tipo as string | undefined)?.toLowerCase() ?? '';
    return ['imagem', 'foto', 'capa'].includes(tipo);
  });

  const outrosAnexos = (details.anexos as Record<string, unknown>[]).filter(a => {
    const tipo = (a.tipo as string | undefined)?.toLowerCase() ?? '';
    return !['imagem', 'foto', 'capa'].includes(tipo);
  });

  function handleConfirmar() {
    if (!motivo.trim() && acao === 'rejeitar') {
      setFeedback('Informe o motivo da rejeição.');
      return;
    }
    startTransition(async () => {
      let result: { ok: boolean };
      if (acao === 'aprovar') {
        result = await approveExperiencia(experienciaId, isPerene, motivo);
      } else {
        result = await rejectExperiencia(experienciaId, motivo);
      }
      if (result.ok) {
        setFeedback(acao === 'aprovar' ? 'Aprovada com sucesso.' : 'Rejeitada com sucesso.');
        setTimeout(() => onClose(), 1200);
      }
    });
  }

  if (!details) {
    return null;
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 bottom-0 w-[720px] max-w-[95vw] bg-bg-base border-l border-line z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between px-8 py-4 border-b border-line flex-shrink-0">
          <div className="flex-1 pr-4 min-w-0">
            <div className="text-[11px] uppercase tracking-eyebrow text-accent-glow mb-1">
              {showActions ? 'Revisão de Experiência' : 'Detalhes da Experiência'}
            </div>
            <h2 className="font-display font-bold text-[16px] leading-tight">{exp.titulo as string}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-warm-white/40 hover:text-warm-white text-2xl leading-none w-8 h-8 flex items-center justify-center border border-line-strong hover:border-line-brighter transition-colors flex-shrink-0"
          >
            ×
          </button>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-7">

          {/* Score Fuzzy */}
          <section>
            <SectionTitle>Score Fuzzy EFITS</SectionTitle>
            <div className="flex items-start gap-6">
              <FuzzyBadge
                faixa={exp.faixa_fuzzy_atual as 'verde' | 'amarelo' | 'vermelho' | null}
                indice={typeof exp.indice_fuzzy === 'number' ? exp.indice_fuzzy : null}
                showBar
              />
              {avaliacao && (
                <div className="flex-1 space-y-2">
                  <DimBar label="P" value={avaliacao.media_participacao as number | null} />
                  <DimBar label="I" value={avaliacao.media_impacto as number | null} />
                  <DimBar label="A" value={avaliacao.media_apropriacao as number | null} />
                  <DimBar label="S" value={avaliacao.media_sustentabilidade as number | null} />
                  <DimBar label="R" value={avaliacao.media_replicabilidade as number | null} />
                </div>
              )}
            </div>
          </section>

          {/* Resumo */}
          {exp.resumo && (
            <section>
              <SectionTitle>Resumo</SectionTitle>
              <p className="text-[13px] text-warm-white/80 leading-relaxed">{exp.resumo as string}</p>
            </section>
          )}

          {/* Dados Gerais */}
          <section>
            <SectionTitle>Dados Gerais</SectionTitle>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-[13px]">
              <div>
                <span className="text-warm-white/40">Campus: </span>
                <span>{(exp.campus_uff as string) || '—'}</span>
              </div>
              <div>
                <span className="text-warm-white/40">Município/UF: </span>
                <span>{[exp.municipio, exp.uf].filter(Boolean).join(' / ') || '—'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-warm-white/40">Período: </span>
                <span>
                  {exp.is_perene
                    ? `${formatDate(exp.data_inicio)} — perene (sem encerramento previsto)`
                    : `${formatDate(exp.data_inicio)} → ${formatDate(exp.data_fim)}`}
                </span>
              </div>
              <div>
                <span className="text-warm-white/40">E-mail de contato: </span>
                <span>{exp.email_contato as string}</span>
              </div>
              <div>
                <span className="text-warm-white/40">Status: </span>
                <span className="text-[12px]">{exp.status as string}</span>
              </div>
              <div className="col-span-2 flex items-center gap-4">
                <span className="text-warm-white/40">Origem: </span>
                <button
                  onClick={() => {
                    const novoValor = !(exp.is_interna as boolean);
                    startTransition(async () => {
                      await updateIsInternaAction(experienciaId, novoValor);
                      setInternaFeedback(novoValor ? 'Marcada como interna (UFF).' : 'Marcada como externa.');
                      setTimeout(() => setInternaFeedback(''), 2500);
                    });
                  }}
                  disabled={isPending}
                  className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 transition-colors ${
                    (exp.is_interna as boolean)
                      ? 'bg-accent/15 text-accent hover:bg-accent/25'
                      : 'bg-white/8 text-warm-white/40 border border-line/60 hover:border-accent/40 hover:text-accent'
                  }`}
                >
                  {(exp.is_interna as boolean) ? 'UFF — interna' : 'EXT — externa'}
                </button>
                <span className="text-[11px] text-warm-white/30">clique para alternar</span>
                {internaFeedback && (
                  <span className="text-[11px] text-accent">{internaFeedback}</span>
                )}
              </div>
              <div>
                <span className="text-warm-white/40">Submetida em: </span>
                <span>{formatDate(exp.submetida_em)}</span>
              </div>
              {exp.aprovada_em && (
                <div>
                  <span className="text-warm-white/40">Aprovada em: </span>
                  <span>{formatDate(exp.aprovada_em)}</span>
                </div>
              )}
            </div>
          </section>

          {/* Equipe */}
          {(details.pessoas as unknown[]).length > 0 && (
            <section>
              <SectionTitle>Equipe</SectionTitle>
              <div className="space-y-2">
                {(details.pessoas as Record<string, unknown>[]).map((ep, i) => {
                  const p = ep.pessoa as Record<string, string | null> | null;
                  return (
                    <div key={i} className="bg-bg-elevated border border-line p-3.5">
                      <div className="flex items-start justify-between gap-3 mb-1.5">
                        <span className="text-[13px] font-medium">{p?.nome_completo}</span>
                        <span className="text-[10px] uppercase tracking-widest text-accent border border-accent/40 px-2 py-0.5 flex-shrink-0">
                          {PAPEL_LABEL[ep.papel as string] ?? (ep.papel as string)}
                        </span>
                      </div>
                      <div className="text-[12px] text-warm-white/50 space-y-0.5">
                        {p?.email && <div>{p.email}</div>}
                        {p?.vinculo && <div>{VINCULO_LABEL[p.vinculo] ?? p.vinculo}</div>}
                        {p?.lattes_url && (
                          <a
                            href={p.lattes_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline"
                            onClick={e => e.stopPropagation()}
                          >
                            Currículo Lattes ↗
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Classificação */}
          <section>
            <SectionTitle>Classificação</SectionTitle>
            <div className="space-y-4 text-[13px]">
              {categoria?.nome && (
                <div>
                  <span className="text-warm-white/40">Categoria editorial: </span>
                  <span>{categoria.nome}</span>
                </div>
              )}

              {((exp.experiencia_finalidade_social as unknown[]) ?? []).length > 0 && (
                <div>
                  <div className="text-warm-white/40 text-[11px] mb-1.5">Finalidade Social:</div>
                  <div className="flex flex-wrap gap-2">
                    {(exp.experiencia_finalidade_social as Record<string, unknown>[]).map((ef, i) => {
                      const fs = ef.finalidade_social as Record<string, string> | null;
                      return (
                        <span key={i} className={`text-[11px] px-2 py-1 border ${ef.principal ? 'border-accent text-accent' : 'border-line text-warm-white/60'}`}>
                          {fs?.nome}{ef.principal ? ' ★' : ''}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {((exp.experiencia_forproex as unknown[]) ?? []).length > 0 && (
                <div>
                  <div className="text-warm-white/40 text-[11px] mb-1.5">Área Temática FORPROEX:</div>
                  <div className="flex flex-wrap gap-2">
                    {(exp.experiencia_forproex as Record<string, unknown>[]).map((ef, i) => {
                      const at = ef.area_tematica_forproex as Record<string, string> | null;
                      return (
                        <span key={i} className={`text-[11px] px-2 py-1 border ${ef.principal ? 'border-accent text-accent' : 'border-line text-warm-white/60'}`}>
                          {at?.codigo} — {at?.nome}{ef.principal ? ' ★' : ''}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {((exp.experiencia_cnpq as unknown[]) ?? []).length > 0 && (
                <div>
                  <div className="text-warm-white/40 text-[11px] mb-1.5">Grande Área CNPq:</div>
                  <div className="flex flex-wrap gap-2">
                    {(exp.experiencia_cnpq as Record<string, unknown>[]).map((ec, i) => {
                      const sub = ec.subarea_cnpq as Record<string, unknown> | null;
                      const grande = sub?.grande_area_cnpq as Record<string, string> | null;
                      return (
                        <span key={i} className={`text-[11px] px-2 py-1 border ${ec.is_principal ? 'border-accent text-accent' : 'border-line text-warm-white/60'}`}>
                          {grande?.nome} › {sub?.nome as string}{ec.is_principal ? ' ★' : ''}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {((exp.experiencia_ods as unknown[]) ?? []).length > 0 && (
                <div>
                  <div className="text-warm-white/40 text-[11px] mb-1.5">ODS:</div>
                  <div className="flex flex-wrap gap-2">
                    {(exp.experiencia_ods as Record<string, unknown>[]).map((eo, i) => {
                      const ods = eo.ods as Record<string, unknown> | null;
                      return (
                        <span
                          key={i}
                          className="text-[11px] px-2 py-1 text-bg-base font-medium"
                          style={{ backgroundColor: (ods?.cor_hex as string) ?? '#2EA39B' }}
                        >
                          ODS {eo.ods_id as number} — {ods?.nome as string}{eo.is_principal ? ' ★' : ''}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Conteúdo Editorial PT */}
          {trad && (
            <section>
              <SectionTitle>Conteúdo Editorial (PT)</SectionTitle>
              {(['historico', 'metodologia', 'resultados_impactos', 'desafios_perspectivas'] as const).map((campo) => {
                if (!trad[campo]) return null;
                return (
                  <div key={campo} className="mb-4">
                    <div className="text-[11px] uppercase tracking-widest text-warm-white/30 mb-1.5">{CAMPO_LABEL[campo]}</div>
                    <div className="text-[13px] text-warm-white/80 leading-relaxed bg-bg-elevated border border-line p-4 max-h-48 overflow-y-auto whitespace-pre-wrap">
                      {trad[campo] as string}
                    </div>
                  </div>
                );
              })}
            </section>
          )}

          {/* Links e Redes */}
          {conteudo && (conteudo.instagram || conteudo.facebook || conteudo.youtube || conteudo.site_externo) && (
            <section>
              <SectionTitle>Links e Redes Sociais</SectionTitle>
              <div className="space-y-2 text-[13px]">
                {conteudo.site_externo && (
                  <div>
                    <span className="text-warm-white/40">Site: </span>
                    <a href={conteudo.site_externo as string} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      {conteudo.site_externo as string} ↗
                    </a>
                  </div>
                )}
                {conteudo.instagram && (
                  <div>
                    <span className="text-warm-white/40">Instagram: </span>
                    <span>{conteudo.instagram as string}</span>
                  </div>
                )}
                {conteudo.facebook && (
                  <div>
                    <span className="text-warm-white/40">Facebook: </span>
                    <span>{conteudo.facebook as string}</span>
                  </div>
                )}
                {conteudo.youtube && (
                  <div>
                    <span className="text-warm-white/40">YouTube: </span>
                    <a href={conteudo.youtube as string} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                      {conteudo.youtube as string} ↗
                    </a>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Fotos e Anexos */}
          {details.anexos.length > 0 && (
            <section>
              <SectionTitle>Fotos e Anexos</SectionTitle>
              {fotos.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {fotos.map((anexo, i) => {
                    const url = getAnexoUrl(anexo);
                    if (!url) return null;
                    return (
                      <a
                        key={i}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative block aspect-video border border-line overflow-hidden bg-bg-elevated hover:border-accent/50 transition-colors"
                        onClick={e => e.stopPropagation()}
                      >
                        {(anexo.is_capa as boolean) && (
                          <span className="absolute top-1.5 left-1.5 text-[9px] uppercase tracking-widest bg-accent text-bg-base px-1.5 py-0.5 z-10">
                            Capa
                          </span>
                        )}
                        <img
                          src={url}
                          alt={(anexo.titulo as string) || `Foto ${i + 1}`}
                          className="w-full h-full object-cover"
                        />
                        {anexo.titulo && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-[10px] text-white px-2 py-1 truncate">
                            {anexo.titulo as string}
                          </div>
                        )}
                      </a>
                    );
                  })}
                </div>
              )}
              {outrosAnexos.length > 0 && (
                <div className="space-y-2">
                  {outrosAnexos.map((anexo, i) => {
                    const url = getAnexoUrl(anexo);
                    return (
                      <div key={i} className="flex items-center gap-3 text-[12px] py-2 border-b border-line/40">
                        <span className="text-warm-white/40 uppercase text-[10px] tracking-widest w-16 flex-shrink-0">{(anexo.tipo as string) || '—'}</span>
                        <span className="flex-1 text-warm-white/70">{(anexo.titulo as string) || 'Sem título'}</span>
                        {url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent hover:underline flex-shrink-0"
                            onClick={e => e.stopPropagation()}
                          >
                            Abrir ↗
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}

          {/* Justificativas por dimensão */}
          {(details.justificativas as unknown[]).length > 0 && (
            <section>
              <SectionTitle>Justificativas por Dimensão</SectionTitle>
              <div className="space-y-3">
                {(details.justificativas as Record<string, string>[]).map((j, i) => (
                  <div key={i}>
                    <div className="font-mono text-accent text-[11px] uppercase tracking-widest mb-1">{j.dimensao}</div>
                    <div className="text-[13px] text-warm-white/70 bg-bg-elevated border border-line p-3 leading-relaxed">{j.texto}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Respostas fuzzy */}
          {(details.respostas as unknown[]).length > 0 && (
            <section>
              <SectionTitle>Respostas do Formulário de Triagem</SectionTitle>
              <div className="space-y-1.5">
                {(details.respostas as Record<string, unknown>[]).map((r, i) => {
                  const perg = r.pergunta_fuzzy as Record<string, unknown> | null;
                  return (
                    <div key={i} className="flex items-start gap-3 text-[12px]">
                      <span className="font-mono text-accent w-5 flex-shrink-0">{perg?.codigo as string}</span>
                      <span className="flex-1 text-warm-white/60 leading-snug">{perg?.texto_pergunta as string}</span>
                      <span className="font-mono text-warm-white/80 w-8 text-right">{r.valor as number}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </div>

        {/* Footer com ações */}
        {showActions && (
          <div className="flex-shrink-0 border-t border-line px-8 py-5">
            {feedback ? (
              <div className="text-center text-[13px] text-accent py-2">{feedback}</div>
            ) : acao ? (
              <div className="space-y-3">
                {acao === 'aprovar' && (
                  <label className="flex items-center gap-2 text-[13px] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isPerene}
                      onChange={(e) => setIsPerene(e.target.checked)}
                      className="accent-[#2EA39B]"
                    />
                    Experiência perene (sem data de fim)
                  </label>
                )}
                <textarea
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value)}
                  placeholder={acao === 'aprovar' ? 'Observações (opcional)...' : 'Motivo da rejeição (obrigatório)...'}
                  rows={3}
                  className="w-full bg-bg-base border border-line-strong text-warm-white text-[13px] px-4 py-3 outline-none focus:border-accent resize-none"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setAcao(null)}
                    disabled={isPending}
                    className="flex-1 border border-line-strong text-[12px] uppercase tracking-widest py-2.5 text-warm-white/60 hover:border-line-brighter transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmar}
                    disabled={isPending}
                    className={`flex-1 text-[12px] uppercase tracking-widest py-2.5 font-semibold transition-colors disabled:opacity-50 ${
                      acao === 'aprovar'
                        ? 'bg-accent text-bg-base hover:bg-accent-glow'
                        : 'bg-danger text-white hover:bg-[#c44433]'
                    }`}
                  >
                    {isPending ? 'Salvando...' : `Confirmar ${acao === 'aprovar' ? 'aprovação' : 'rejeição'}`}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex gap-3">
                <button
                  onClick={() => setAcao('aprovar')}
                  className="flex-1 bg-accent text-bg-base text-[12px] uppercase tracking-widest py-2.5 font-semibold hover:bg-accent-glow transition-colors"
                >
                  Aprovar
                </button>
                <button
                  onClick={() => setAcao('rejeitar')}
                  className="flex-1 border border-danger/50 text-danger text-[12px] uppercase tracking-widest py-2.5 hover:bg-danger/10 transition-colors"
                >
                  Rejeitar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
