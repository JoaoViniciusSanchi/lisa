'use client';

import { useState, useTransition } from 'react';
import { EmailTemplateCard } from './EmailTemplateCard';
import { reenviarEmail } from '@/lib/admin/email-actions';

interface TemplateConfig {
  usar_padrao: boolean;
  assunto: string | null;
  corpo_md: string | null;
}

interface Disparo {
  id: string;
  tipo: string;
  destinatario: string;
  assunto: string | null;
  status: string;
  enviado_em: string | null;
  criado_em: string;
  resend_id: string | null;
  erro_mensagem: string | null;
  experiencia_id: string | null;
}

interface Props {
  templates: Record<string, TemplateConfig>;
  disparos: Disparo[];
}

// Mapeamento tipo → metadados de exibição
const TIPO_META: Record<string, { label: string; badge: 'Automático' | 'Manual' | 'Agendado'; variaveis: string[] }> = {
  confirmacao_submissao: {
    label: 'Confirmação de submissão',
    badge: 'Automático',
    variaveis: ['coordenador_nome', 'experiencia_titulo', 'protocolo']
  },
  notificacao_admin: {
    label: 'Notificação para admin',
    badge: 'Automático',
    variaveis: ['coordenador_nome', 'coordenador_email', 'experiencia_titulo', 'protocolo', 'admin_url']
  },
  aprovacao: {
    label: 'Aprovação de experiência',
    badge: 'Automático',
    variaveis: ['coordenador_nome', 'experiencia_titulo']
  },
  rejeicao: {
    label: 'Rejeição de experiência',
    badge: 'Automático',
    variaveis: ['coordenador_nome', 'experiencia_titulo', 'motivo_rejeicao']
  },
  solicitacao_atualizacao: {
    label: 'Solicitação de atualização',
    badge: 'Manual',
    variaveis: ['coordenador_nome', 'experiencia_titulo', 'link_atualizacao', 'dias_validade']
  },
  lembrete_atualizacao: {
    label: 'Lembrete de atualização',
    badge: 'Agendado',
    variaveis: ['coordenador_nome', 'experiencia_titulo', 'link_atualizacao', 'dias_restantes']
  },
  notificacao_inativacao: {
    label: 'Notificação de inativação',
    badge: 'Automático',
    variaveis: ['coordenador_nome', 'experiencia_titulo', 'email_contato']
  },
  validacao_traducao: {
    label: 'Validação de tradução (EN)',
    badge: 'Manual',
    variaveis: ['coordenador_nome', 'experiencia_titulo', 'link_aprovar', 'link_editar', 'dias_validade']
  }
};

const STATUS_STYLES: Record<string, string> = {
  enviado: 'text-green-400',
  entregue: 'text-green-400',
  falhou: 'text-danger',
  bounced: 'text-orange-400',
  pendente: 'text-warm-white/40'
};

export function EmailsClient({ templates, disparos }: Props) {
  const [aba, setAba] = useState<'templates' | 'historico'>('templates');
  const [isPending, startTransition] = useTransition();
  const [reenvioStatus, setReenvioStatus] = useState<Record<string, string>>({});

  function handleReenviar(id: string) {
    startTransition(async () => {
      const res = await reenviarEmail(id);
      setReenvioStatus((prev) => ({
        ...prev,
        [id]: res.ok ? '✓ Reenviado' : `✗ ${res.error}`
      }));
      setTimeout(() => {
        setReenvioStatus((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }, 5000);
    });
  }

  return (
    <div>
      {/* Abas */}
      <div className="flex border-b border-line mb-6">
        {(['templates', 'historico'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setAba(tab)}
            className={`px-5 py-3 text-[13px] font-medium transition-colors border-b-2 -mb-px ${
              aba === tab
                ? 'border-accent text-accent'
                : 'border-transparent text-warm-white/40 hover:text-warm-white'
            }`}
          >
            {tab === 'templates' ? 'Templates' : 'Histórico de disparos'}
          </button>
        ))}
      </div>

      {/* Aba Templates */}
      {aba === 'templates' && (
        <div className="space-y-4">
          {Object.entries(TIPO_META).map(([tipo, meta]) => {
            const config = templates[tipo] ?? { usar_padrao: true, assunto: null, corpo_md: null };
            return (
              <EmailTemplateCard
                key={tipo}
                tipo={tipo}
                config={config}
                label={meta.label}
                badge={meta.badge}
                variaveis={meta.variaveis}
              />
            );
          })}
        </div>
      )}

      {/* Aba Histórico */}
      {aba === 'historico' && (
        <div className="border border-line overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-line bg-bg-elevated">
                <th className="text-left px-4 py-3 text-warm-white/40 font-normal">Data</th>
                <th className="text-left px-4 py-3 text-warm-white/40 font-normal">Tipo</th>
                <th className="text-left px-4 py-3 text-warm-white/40 font-normal">Destinatário</th>
                <th className="text-left px-4 py-3 text-warm-white/40 font-normal">Status</th>
                <th className="text-left px-4 py-3 text-warm-white/40 font-normal">Resend ID</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {disparos.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-warm-white/30">
                    Nenhum disparo registrado ainda.
                  </td>
                </tr>
              )}
              {disparos.map((d) => (
                <tr key={d.id} className="border-b border-line/50 hover:bg-bg-elevated/50 transition-colors">
                  <td className="px-4 py-3 text-warm-white/60 whitespace-nowrap">
                    {new Date(d.criado_em).toLocaleString('pt-BR', {
                      day: '2-digit', month: '2-digit', year: '2-digit',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </td>
                  <td className="px-4 py-3 text-warm-white/80">
                    {TIPO_META[d.tipo]?.label ?? d.tipo}
                  </td>
                  <td className="px-4 py-3 text-warm-white/60 max-w-[200px] truncate">
                    {d.destinatario}
                  </td>
                  <td className={`px-4 py-3 ${STATUS_STYLES[d.status] ?? 'text-warm-white/40'}`}>
                    {d.status}
                    {d.erro_mensagem && (
                      <div className="text-[11px] text-danger/60 truncate max-w-[200px]">
                        {d.erro_mensagem}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-warm-white/30 font-mono text-[11px]">
                    {d.resend_id ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {d.status === 'falhou' && (
                      reenvioStatus[d.id] ? (
                        <span className={`text-[11px] ${reenvioStatus[d.id].startsWith('✓') ? 'text-green-400' : 'text-danger'}`}>
                          {reenvioStatus[d.id]}
                        </span>
                      ) : (
                        <button
                          onClick={() => handleReenviar(d.id)}
                          disabled={isPending}
                          className="text-[11px] text-accent hover:text-accent/80 transition-colors disabled:opacity-40"
                        >
                          Reenviar
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
