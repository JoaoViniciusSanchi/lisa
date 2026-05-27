'use client';

import {
  FieldGroupTS,
  FieldInputTS,
  FieldTextareaTS
} from '../FormFieldsTS';
import { HairlineTS } from '../HairlineTS';
import { EyebrowTS } from '../EyebrowTS';
import { UploadZoneTS } from '../UploadZoneTS';
import { useCadastroForm } from '@/components/cadastro/FormProvider';
import type { ArquivoSlot } from '@/components/cadastro/state';

export function ResultadosMateriaisStepTS() {
  const { state, dispatch } = useCadastroForm();
  const r = state.resultados;
  const m = state.materiais;
  const arquivos = state.arquivos;
  const termoAceito = state.termoAceito;

  const setResultado = (field: string, value: string) =>
    dispatch({ type: 'SET_FIELD', section: 'resultados', field, value });

  const setMaterial = (field: string, value: string) =>
    dispatch({ type: 'SET_FIELD', section: 'materiais', field, value });

  const setArquivo = (slot: ArquivoSlot, file: File | null) =>
    dispatch({ type: 'SET_ARQUIVO', slot, file });

  return (
    <div className="font-nunito">
      <div className="mb-12">
        <div className="font-nunito text-[11px] font-semibold tracking-[0.15em] text-white/50 mb-4">
          [ Cadastro · Etapa 08 de 08 · Finalização ]
        </div>
        <p className="text-lg font-light leading-relaxed text-white/80 max-w-[680px]">
          Descreva resultados, impactos e perspectivas. Em seguida, anexe
          imagens e informe os canais de divulgação da experiência.
        </p>
      </div>

      <FieldGroupTS label="Resultados e impactos" required>
        <FieldTextareaTS
          rows={6}
          placeholder="Quais resultados concretos a experiência alcançou? Que impactos foram observados nos beneficiários e na comunidade?"
          value={r.resultadosImpactos}
          onChange={(e) => setResultado('resultadosImpactos', e.target.value)}
        />
      </FieldGroupTS>

      <FieldGroupTS label="Desafios e perspectivas" required>
        <FieldTextareaTS
          rows={6}
          placeholder="Quais os principais desafios enfrentados? Quais as perspectivas futuras da experiência?"
          value={r.desafiosPerspectivas}
          onChange={(e) => setResultado('desafiosPerspectivas', e.target.value)}
        />
      </FieldGroupTS>

      <FieldGroupTS label="Público beneficiado">
        <FieldTextareaTS
          rows={3}
          placeholder="Descreva o público atendido pela experiência..."
          value={r.publicoBeneficiado}
          onChange={(e) => setResultado('publicoBeneficiado', e.target.value)}
        />
      </FieldGroupTS>

      <FieldGroupTS label="Número estimado de pessoas atendidas">
        <FieldInputTS
          type="number"
          placeholder="Ex: 150"
          value={r.numPessoasAtendidas}
          onChange={(e) => setResultado('numPessoasAtendidas', e.target.value)}
        />
      </FieldGroupTS>

      <FieldGroupTS label="Fontes de financiamento">
        <FieldTextareaTS
          rows={3}
          placeholder="Editais, bolsas, recursos próprios, parcerias..."
          value={r.fontesFinanciamento}
          onChange={(e) => setResultado('fontesFinanciamento', e.target.value)}
        />
      </FieldGroupTS>

      <FieldGroupTS label="Parcerias">
        <FieldTextareaTS
          rows={3}
          placeholder="Organizações, instituições e comunidades parceiras..."
          value={r.parcerias}
          onChange={(e) => setResultado('parcerias', e.target.value)}
        />
      </FieldGroupTS>

      <HairlineTS className="my-10" />

      <EyebrowTS as="div" className="mb-6">
        Imagens e materiais
      </EyebrowTS>

      <FieldGroupTS
        label="Foto de capa"
        hint="Opcional na submissão. Obrigatória para publicação no catálogo."
      >
        <UploadZoneTS
          title="Arraste a imagem ou clique para selecionar"
          hint="JPG, PNG ou WEBP · Mínimo 1200×800px · Máximo 5MB"
          size="large"
          file={arquivos.capa}
          onChange={(f) => setArquivo('capa', f)}
        />
      </FieldGroupTS>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldGroupTS label="Imagem secundária 01">
          <UploadZoneTS
            title="Adicionar imagem"
            hint="JPG, PNG ou WEBP · Máximo 5MB"
            file={arquivos.secundaria1}
            onChange={(f) => setArquivo('secundaria1', f)}
          />
        </FieldGroupTS>
        <FieldGroupTS label="Imagem secundária 02">
          <UploadZoneTS
            title="Adicionar imagem"
            hint="JPG, PNG ou WEBP · Máximo 5MB"
            file={arquivos.secundaria2}
            onChange={(f) => setArquivo('secundaria2', f)}
          />
        </FieldGroupTS>
      </div>

      <HairlineTS className="my-10" />
      <EyebrowTS as="div" className="mb-6">
        Redes sociais e divulgação (opcional)
      </EyebrowTS>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldGroupTS label="Instagram">
          <FieldInputTS
            type="text"
            placeholder="@perfil"
            value={m.instagram}
            onChange={(e) => setMaterial('instagram', e.target.value)}
          />
        </FieldGroupTS>
        <FieldGroupTS label="Site externo">
          <FieldInputTS
            type="url"
            placeholder="https://"
            value={m.siteExterno}
            onChange={(e) => setMaterial('siteExterno', e.target.value)}
          />
        </FieldGroupTS>
        <FieldGroupTS label="YouTube">
          <FieldInputTS
            type="url"
            placeholder="Link do canal"
            value={m.youtube}
            onChange={(e) => setMaterial('youtube', e.target.value)}
          />
        </FieldGroupTS>
        <FieldGroupTS label="Facebook">
          <FieldInputTS
            type="text"
            placeholder="Página"
            value={m.facebook}
            onChange={(e) => setMaterial('facebook', e.target.value)}
          />
        </FieldGroupTS>
      </div>

      <FieldGroupTS label="Links de vídeos, reportagens ou publicações acadêmicas">
        <FieldTextareaTS
          rows={4}
          showCounter={false}
          placeholder="Cole aqui os links relevantes, um por linha..."
          value={m.linksAdicionais}
          onChange={(e) => setMaterial('linksAdicionais', e.target.value)}
        />
      </FieldGroupTS>

      <HairlineTS className="my-10" />

      <div
        className="p-8"
        style={{
          background: 'rgba(12, 113, 195, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.18)'
        }}
      >
        <EyebrowTS as="div" className="mb-4">
          Antes de enviar
        </EyebrowTS>
        <p className="text-sm text-white/80 leading-relaxed mb-6">
          Após o envio, sua experiência passará por moderação da equipe AGIR
          em até 7 dias. Você receberá um e-mail de confirmação no endereço
          informado no início do cadastro.
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 accent-ts-accent"
            checked={termoAceito}
            onChange={(e) =>
              dispatch({ type: 'SET_TERMO', aceito: e.target.checked })
            }
          />
          <span className="text-xs text-white/85 leading-relaxed">
            Confirmo que li e aceito os termos de participação no Catálogo de
            Tecnologias Sociais 2026, autorizando o uso das informações
            fornecidas para os fins do portal LISA.
          </span>
        </label>
      </div>
    </div>
  );
}
