/**
 * Tipos TypeScript do schema do banco — escritos manualmente.
 * TODO: gerar via `supabase gen types typescript` quando o CLI estiver setado.
 *
 * Cobre apenas o que precisamos para a Fase 3 (cadastro). Demais tabelas
 * podem ser adicionadas conforme a Fase 4 (catálogo) e Fase 6 (admin).
 */

export type ExperienciaStatus =
  | 'rascunho'
  | 'em_moderacao'
  | 'aprovada_ativa_em_andamento'
  | 'aprovada_ativa_perene'
  | 'aprovada_encerrada'
  | 'aguardando_confirmacao_coordenador'
  | 'inativa_nao_confirmada'
  | 'rejeitada';

export type FaixaFuzzy = 'vermelho' | 'amarelo' | 'verde';

export type DimensaoFuzzy =
  | 'participacao_comunitaria'
  | 'impacto_social'
  | 'apropriacao_tecnologica'
  | 'sustentabilidade'
  | 'replicabilidade';

export type PessoaVinculo =
  | 'docente'
  | 'tecnico_administrativo'
  | 'estudante_graduacao'
  | 'estudante_pos'
  | 'pesquisador_externo'
  | 'membro_comunidade'
  | 'representante_organizacao'
  | 'outro';

export type AnexoTipo =
  | 'foto_capa'
  | 'foto_secundaria_1'
  | 'foto_secundaria_2'
  | 'foto_galeria_extra'
  | 'logo'
  | 'video'
  | 'documento_pdf'
  | 'publicacao_academica'
  | 'material_didatico'
  | 'reportagem_midia'
  | 'link_externo_outro';

export type AnexoOrigem = 'supabase_storage' | 'link_externo';

export type EmailTipo =
  | 'confirmacao_submissao'
  | 'notificacao_admin'
  | 'aprovacao'
  | 'rejeicao'
  | 'solicitacao_atualizacao'
  | 'lembrete_atualizacao'
  | 'notificacao_inativacao';

export interface MacroareaTs {
  id: string;
  codigo: string;
  nome: string;
  nome_en: string | null;
  descricao: string | null;
  inclui: string | null;
  cnpq_sugerido: string | null;
  extensao_sugerida: string | null;
  ods_sugeridos: string | null;
  ordem: number | null;
  ativa: boolean;
}
