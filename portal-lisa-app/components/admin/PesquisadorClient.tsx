'use client';

import { useState, useTransition } from 'react';
import {
  createExpertAction,
  updateExpertAction,
  toggleExpertAtivoAction,
  type PesquisadorExpert,
  type ExpertInput,
} from '@/lib/admin/expertActions';

interface AreaOption {
  id: string;
  nome: string;
  codigo?: string;
}

interface Props {
  experts: PesquisadorExpert[];
  forproexAreas: AreaOption[];
  grandesAreas: AreaOption[];
  shareUrl: string;
}

const EMPTY_FORM: ExpertInput = {
  nome: '',
  email: '',
  instituicao: '',
  lattes: '',
  departamento: '',
  ativo: true,
  forproex_ids: [] as string[],
  cnpq_ids: [] as string[],
};

export default function PesquisadorClient({ experts: initial, forproexAreas, grandesAreas, shareUrl }: Props) {
  const [experts, setExperts] = useState(initial);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpertInput>(EMPTY_FORM);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState('');
  const [copied, setCopied] = useState(false);

  const filtered = experts.filter((e) =>
    !search || e.nome.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setFeedback('');
    setShowModal(true);
  }

  function openEdit(expert: PesquisadorExpert) {
    setEditId(expert.id);
    setForm({
      nome: expert.nome,
      email: expert.email,
      instituicao: expert.instituicao ?? '',
      lattes: expert.lattes ?? '',
      departamento: expert.departamento ?? '',
      ativo: expert.ativo,
      forproex_ids: expert.expert_forproex.map((f) => f.area_tematica_forproex.id),
      cnpq_ids: expert.expert_cnpq.map((c) => c.grande_area_cnpq.id),
    });
    setFeedback('');
    setShowModal(true);
  }

  function toggleForproex(id: string) {
    setForm((prev) => {
      const ids = prev.forproex_ids ?? [];
      return {
        ...prev,
        forproex_ids: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
      };
    });
  }

  function toggleCnpq(id: string) {
    setForm((prev) => {
      const ids = prev.cnpq_ids ?? [];
      return {
        ...prev,
        cnpq_ids: ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id],
      };
    });
  }

  function handleSubmit() {
    if (!form.nome.trim() || !form.email.trim()) {
      setFeedback('Nome e e-mail são obrigatórios.');
      return;
    }
    startTransition(async () => {
      if (editId) {
        await updateExpertAction(editId, form);
      } else {
        const result = await createExpertAction(form);
        if (!result.ok) {
          setFeedback(result.error ?? 'Erro ao salvar.');
          return;
        }
      }
      setShowModal(false);
      // Refresh inline — server revalidation will update on next navigation
      window.location.reload();
    });
  }

  function handleToggleAtivo(expert: PesquisadorExpert) {
    startTransition(async () => {
      await toggleExpertAtivoAction(expert.id, !expert.ativo);
      setExperts((prev) =>
        prev.map((e) => (e.id === expert.id ? { ...e, ativo: !e.ativo } : e))
      );
    });
  }

  function copyShareUrl() {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <input
          type="text"
          placeholder="Buscar por nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 bg-bg-elevated border border-line text-warm-white px-4 py-2.5 text-[13px] outline-none focus:border-accent transition-colors placeholder:text-warm-white/30"
        />
        <button
          onClick={copyShareUrl}
          className="px-4 py-2.5 text-[12px] uppercase tracking-widest border border-line text-warm-white/60 hover:border-accent/50 hover:text-accent transition-colors"
        >
          {copied ? 'Link copiado!' : 'Copiar link público'}
        </button>
        <button
          onClick={openCreate}
          className="px-5 py-2.5 text-[12px] uppercase tracking-widest bg-accent text-bg-base font-bold hover:bg-accent-glow transition-colors"
        >
          + Cadastrar
        </button>
      </div>

      {/* Contagem */}
      <div className="text-[12px] text-warm-white/40 mb-4">
        {filtered.length} {filtered.length === 1 ? 'pesquisador' : 'pesquisadores'}
      </div>

      {/* Lista */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-warm-white/30">
          <div className="text-3xl mb-2">◍</div>
          <div className="text-[14px]">Nenhum pesquisador encontrado</div>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((expert) => (
            <div
              key={expert.id}
              className="bg-bg-elevated border border-line p-4 flex items-start justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 ${
                      expert.ativo
                        ? 'bg-accent/15 text-accent'
                        : 'bg-white/5 text-warm-white/30 border border-line/40'
                    }`}
                  >
                    {expert.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className="font-medium text-[14px] text-warm-white">{expert.nome}</span>
                </div>
                <div className="text-[12px] text-warm-white/50 mb-2">{expert.email}</div>
                {expert.instituicao && (
                  <div className="text-[12px] text-warm-white/40">{expert.instituicao}</div>
                )}
                {/* Áreas */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {expert.expert_forproex.map((f) => (
                    <span key={f.area_tematica_forproex.id} className="text-[10px] px-2 py-0.5 border border-accent/30 text-accent/80">
                      {f.area_tematica_forproex.codigo} — {f.area_tematica_forproex.nome}
                    </span>
                  ))}
                  {expert.expert_cnpq.map((c) => (
                    <span key={c.grande_area_cnpq.id} className="text-[10px] px-2 py-0.5 border border-line text-warm-white/40">
                      CNPq: {c.grande_area_cnpq.nome}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <button
                  onClick={() => openEdit(expert)}
                  className="text-[11px] uppercase tracking-widest border border-line px-3 py-1.5 text-warm-white/60 hover:border-accent/50 hover:text-accent transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleToggleAtivo(expert)}
                  disabled={isPending}
                  className="text-[11px] uppercase tracking-widest border border-line/40 px-3 py-1.5 text-warm-white/30 hover:text-warm-white/60 transition-colors disabled:opacity-40"
                >
                  {expert.ativo ? 'Desativar' : 'Ativar'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de criação/edição */}
      {showModal && (
        <>
          <div className="fixed inset-0 bg-black/70 z-40" onClick={() => setShowModal(false)} />
          <div className="fixed inset-y-0 right-0 w-[560px] max-w-[95vw] bg-bg-base border-l border-line z-50 flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-5 border-b border-line flex-shrink-0">
              <div>
                <div className="text-[11px] uppercase tracking-eyebrow text-accent-glow mb-1">Pesquisadores</div>
                <h2 className="font-display font-bold text-[16px]">
                  {editId ? 'Editar Pesquisador' : 'Cadastrar Pesquisador'}
                </h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-warm-white/40 hover:text-warm-white text-2xl w-8 h-8 flex items-center justify-center border border-line hover:border-line-brighter transition-colors"
              >
                ×
              </button>
            </div>

            {/* Formulário */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-5">
              {/* Nome */}
              <div>
                <label className="text-[11px] uppercase tracking-eyebrow text-warm-white/40 block mb-1.5">
                  Nome completo *
                </label>
                <input
                  type="text"
                  value={form.nome}
                  onChange={(e) => setForm((p) => ({ ...p, nome: e.target.value }))}
                  className="w-full bg-bg-elevated border border-line text-warm-white px-4 py-2.5 text-[13px] outline-none focus:border-accent transition-colors"
                  placeholder="Nome do pesquisador"
                />
              </div>

              {/* Email */}
              <div>
                <label className="text-[11px] uppercase tracking-eyebrow text-warm-white/40 block mb-1.5">
                  E-mail *
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  className="w-full bg-bg-elevated border border-line text-warm-white px-4 py-2.5 text-[13px] outline-none focus:border-accent transition-colors"
                  placeholder="email@exemplo.com"
                />
              </div>

              {/* Instituição */}
              <div>
                <label className="text-[11px] uppercase tracking-eyebrow text-warm-white/40 block mb-1.5">
                  Instituição
                </label>
                <input
                  type="text"
                  value={form.instituicao}
                  onChange={(e) => setForm((p) => ({ ...p, instituicao: e.target.value }))}
                  className="w-full bg-bg-elevated border border-line text-warm-white px-4 py-2.5 text-[13px] outline-none focus:border-accent transition-colors"
                  placeholder="UFF, UFRJ, etc."
                />
              </div>

              {/* Lattes + Departamento */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[11px] uppercase tracking-eyebrow text-warm-white/40 block mb-1.5">
                    Lattes (URL)
                  </label>
                  <input
                    type="url"
                    value={form.lattes}
                    onChange={(e) => setForm((p) => ({ ...p, lattes: e.target.value }))}
                    className="w-full bg-bg-elevated border border-line text-warm-white px-4 py-2.5 text-[13px] outline-none focus:border-accent transition-colors"
                    placeholder="http://lattes.cnpq.br/..."
                  />
                </div>
                <div>
                  <label className="text-[11px] uppercase tracking-eyebrow text-warm-white/40 block mb-1.5">
                    Departamento/Unidade
                  </label>
                  <input
                    type="text"
                    value={form.departamento}
                    onChange={(e) => setForm((p) => ({ ...p, departamento: e.target.value }))}
                    className="w-full bg-bg-elevated border border-line text-warm-white px-4 py-2.5 text-[13px] outline-none focus:border-accent transition-colors"
                    placeholder="Ex: Engenharia de Software"
                  />
                </div>
              </div>

              {/* Áreas FORPROEX */}
              <div>
                <label className="text-[11px] uppercase tracking-eyebrow text-warm-white/40 block mb-2">
                  Áreas Temáticas FORPROEX
                </label>
                <div className="flex flex-wrap gap-2">
                  {forproexAreas.map((area) => {
                    const selected = (form.forproex_ids ?? []).includes(area.id);
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => toggleForproex(area.id)}
                        className={`text-[11px] px-2.5 py-1.5 border transition-colors ${
                          selected
                            ? 'border-accent text-accent bg-accent/10'
                            : 'border-line text-warm-white/50 hover:border-accent/40'
                        }`}
                      >
                        {area.codigo && <span className="font-mono mr-1">{area.codigo}</span>}
                        {area.nome}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Grandes Áreas CNPq */}
              <div>
                <label className="text-[11px] uppercase tracking-eyebrow text-warm-white/40 block mb-2">
                  Grande Área CNPq
                </label>
                <div className="flex flex-wrap gap-2">
                  {grandesAreas.map((area) => {
                    const selected = (form.cnpq_ids ?? []).includes(area.id);
                    return (
                      <button
                        key={area.id}
                        type="button"
                        onClick={() => toggleCnpq(area.id)}
                        className={`text-[11px] px-2.5 py-1.5 border transition-colors ${
                          selected
                            ? 'border-accent text-accent bg-accent/10'
                            : 'border-line text-warm-white/50 hover:border-accent/40'
                        }`}
                      >
                        {area.nome}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ativo */}
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.ativo}
                  onChange={(e) => setForm((p) => ({ ...p, ativo: e.target.checked }))}
                  className="accent-[#2EA39B] w-4 h-4"
                />
                <span className="text-[13px] text-warm-white/70">Pesquisador ativo (disponível para receber demandas)</span>
              </label>

              {feedback && (
                <div className="text-[12px] text-danger border border-danger/30 px-4 py-3">
                  {feedback}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 border-t border-line px-8 py-5 flex gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-line text-[12px] uppercase tracking-widest py-2.5 text-warm-white/60 hover:border-line-brighter transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending}
                className="flex-1 bg-accent text-bg-base text-[12px] uppercase tracking-widest py-2.5 font-bold hover:bg-accent-glow transition-colors disabled:opacity-50"
              >
                {isPending ? 'Salvando...' : editId ? 'Salvar alterações' : 'Cadastrar'}
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
