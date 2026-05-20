'use client';

import { useState, useTransition } from 'react';
import { cadastrarPesquisadorPublicoAction } from '@/lib/actions/cadastrarPesquisador';

interface AreaOption {
  id: string;
  nome: string;
  codigo: string;
}

interface Props {
  forproexAreas: AreaOption[];
}

export default function CadastrarPesquisadorForm({ forproexAreas }: Props) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [instituicao, setInstituicao] = useState('');
  const [lattes, setLattes] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [forproexIds, setForproexIds] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [isPending, startTransition] = useTransition();

  function toggleForproex(id: string) {
    setForproexIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await cadastrarPesquisadorPublicoAction({
        nome,
        email,
        instituicao,
        lattes,
        departamento,
        forproex_ids: forproexIds,
      });
      if (result.ok) {
        setStatus('success');
      } else {
        setStatus('error');
        setErrorMsg(result.error ?? 'Erro ao enviar.');
      }
    });
  }

  if (status === 'success') {
    return (
      <div className="border border-accent/40 bg-accent/5 p-8 text-center space-y-3">
        <div className="text-3xl text-accent">◈</div>
        <h2 className="font-display font-bold text-[18px]">Cadastro recebido!</h2>
        <p className="text-[13px] text-warm-white/60 leading-relaxed">
          Seus dados foram registrados e serão revisados pela equipe LISA.
          Você será contactado por e-mail quando seu cadastro for ativado.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome */}
      <div>
        <label className="text-[11px] uppercase tracking-eyebrow text-warm-white/40 block mb-1.5">
          Nome completo *
        </label>
        <input
          type="text"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full bg-bg-elevated border border-line text-warm-white px-4 py-3 text-[14px] outline-none focus:border-accent transition-colors"
          placeholder="Seu nome completo"
        />
      </div>

      {/* Email */}
      <div>
        <label className="text-[11px] uppercase tracking-eyebrow text-warm-white/40 block mb-1.5">
          E-mail *
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-bg-elevated border border-line text-warm-white px-4 py-3 text-[14px] outline-none focus:border-accent transition-colors"
          placeholder="seu@email.com"
        />
      </div>

      {/* Instituição */}
      <div>
        <label className="text-[11px] uppercase tracking-eyebrow text-warm-white/40 block mb-1.5">
          Instituição
        </label>
        <input
          type="text"
          value={instituicao}
          onChange={(e) => setInstituicao(e.target.value)}
          className="w-full bg-bg-elevated border border-line text-warm-white px-4 py-3 text-[14px] outline-none focus:border-accent transition-colors"
          placeholder="Universidade, instituto ou organização"
        />
      </div>

      {/* Lattes + Departamento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-[11px] uppercase tracking-eyebrow text-warm-white/40 block mb-1.5">
            Currículo Lattes (URL)
          </label>
          <input
            type="url"
            value={lattes}
            onChange={(e) => setLattes(e.target.value)}
            className="w-full bg-bg-elevated border border-line text-warm-white px-4 py-3 text-[14px] outline-none focus:border-accent transition-colors"
            placeholder="http://lattes.cnpq.br/..."
          />
        </div>
        <div>
          <label className="text-[11px] uppercase tracking-eyebrow text-warm-white/40 block mb-1.5">
            Departamento/Unidade
          </label>
          <input
            type="text"
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
            className="w-full bg-bg-elevated border border-line text-warm-white px-4 py-3 text-[14px] outline-none focus:border-accent transition-colors"
            placeholder="Ex: Engenharia de Software"
          />
        </div>
      </div>

      {/* Áreas FORPROEX */}
      {forproexAreas.length > 0 && (
        <div>
          <label className="text-[11px] uppercase tracking-eyebrow text-warm-white/40 block mb-2">
            Área(s) de atuação — FORPROEX
          </label>
          <p className="text-[12px] text-warm-white/30 mb-3">
            Selecione as áreas em que você tem experiência ou interesse.
          </p>
          <div className="flex flex-wrap gap-2">
            {forproexAreas.map((area) => {
              const selected = forproexIds.includes(area.id);
              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => toggleForproex(area.id)}
                  className={`text-[12px] px-3 py-2 border transition-colors ${
                    selected
                      ? 'border-accent text-accent bg-accent/10'
                      : 'border-line text-warm-white/50 hover:border-accent/40 hover:text-warm-white/70'
                  }`}
                >
                  <span className="font-mono mr-1.5 text-[10px]">{area.codigo}</span>
                  {area.nome}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Erro */}
      {status === 'error' && (
        <div className="text-[13px] text-danger border border-danger/30 px-4 py-3">
          {errorMsg}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-accent text-bg-base text-[13px] uppercase tracking-widest py-3.5 font-bold hover:bg-accent-glow transition-colors disabled:opacity-50"
      >
        {isPending ? 'Enviando...' : 'Enviar cadastro'}
      </button>

      <p className="text-[11px] text-warm-white/25 text-center leading-relaxed">
        Seus dados serão usados exclusivamente para contato sobre demandas de tecnologia social.
        Nenhuma informação será compartilhada sem seu consentimento.
      </p>
    </form>
  );
}
