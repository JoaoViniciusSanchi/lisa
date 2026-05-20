'use client';

import {
  FieldGroup,
  FieldInput,
  FieldTextarea
} from '../FormFields';
import { Hairline } from '@/components/ui/Hairline';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { UploadZone } from '../UploadZone';
import { useCadastroForm } from '../FormProvider';
import type { ArquivoSlot } from '../state';

export function MateriaisStep() {
  const { state, dispatch } = useCadastroForm();
  const m = state.materiais;
  const arquivos = state.arquivos;
  const termoAceito = state.termoAceito;

  const set = (field: string, value: string) =>
    dispatch({ type: 'SET_FIELD', section: 'materiais', field, value });

  const setArquivo = (slot: ArquivoSlot, file: File | null) =>
    dispatch({ type: 'SET_ARQUIVO', slot, file });

  return (
    <div>
      <div className="mb-12">
        <div className="font-display text-[11px] font-semibold tracking-[0.15em] opacity-40 mb-4">
          [ Cadastro · Etapa 08 de 08 · Finalização ]
        </div>
        <p className="text-lg font-light leading-relaxed opacity-70 max-w-[680px]">
          Anexe imagens e informe os canais de divulgação da experiência. A
          foto de capa e duas imagens secundárias serão obrigatórias para
          publicação no catálogo.
        </p>
      </div>

      <FieldGroup
        label="Foto de capa"
        hint="Opcional na submissão. Obrigatória para publicação no catálogo."
      >
        <UploadZone
          title="Arraste a imagem ou clique para selecionar"
          hint="JPG, PNG ou WEBP · Mínimo 1200×800px · Máximo 5MB"
          size="large"
          file={arquivos.capa}
          onChange={(f) => setArquivo('capa', f)}
        />
      </FieldGroup>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldGroup label="Imagem secundária 01">
          <UploadZone
            title="Adicionar imagem"
            hint="JPG, PNG ou WEBP · Máximo 5MB"
            file={arquivos.secundaria1}
            onChange={(f) => setArquivo('secundaria1', f)}
          />
        </FieldGroup>
        <FieldGroup label="Imagem secundária 02">
          <UploadZone
            title="Adicionar imagem"
            hint="JPG, PNG ou WEBP · Máximo 5MB"
            file={arquivos.secundaria2}
            onChange={(f) => setArquivo('secundaria2', f)}
          />
        </FieldGroup>
      </div>

      <Hairline className="my-10" />
      <Eyebrow as="div" className="mb-6">
        Redes sociais e divulgação (opcional)
      </Eyebrow>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FieldGroup label="Instagram">
          <FieldInput
            type="text"
            placeholder="@perfil"
            value={m.instagram}
            onChange={(e) => set('instagram', e.target.value)}
          />
        </FieldGroup>
        <FieldGroup label="Site externo">
          <FieldInput
            type="url"
            placeholder="https://"
            value={m.siteExterno}
            onChange={(e) => set('siteExterno', e.target.value)}
          />
        </FieldGroup>
        <FieldGroup label="YouTube">
          <FieldInput
            type="url"
            placeholder="Link do canal"
            value={m.youtube}
            onChange={(e) => set('youtube', e.target.value)}
          />
        </FieldGroup>
        <FieldGroup label="Facebook">
          <FieldInput
            type="text"
            placeholder="Página"
            value={m.facebook}
            onChange={(e) => set('facebook', e.target.value)}
          />
        </FieldGroup>
      </div>

      <FieldGroup label="Links de vídeos, reportagens ou publicações acadêmicas">
        <FieldTextarea
          rows={4}
          showCounter={false}
          placeholder="Cole aqui os links relevantes, um por linha..."
          value={m.linksAdicionais}
          onChange={(e) => set('linksAdicionais', e.target.value)}
        />
      </FieldGroup>

      <Hairline className="my-10" />

      <div
        className="p-8 glass"
        style={{
          background: 'rgba(46, 163, 155, 0.05)',
          border: '1px solid var(--line-strong)'
        }}
      >
        <Eyebrow as="div" className="mb-4">
          Antes de enviar
        </Eyebrow>
        <p className="text-sm opacity-75 leading-relaxed mb-6">
          Após o envio, sua experiência passará por moderação da equipe AGIR
          em até 7 dias. Você receberá um e-mail de confirmação no endereço
          informado no início do cadastro.
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1"
            checked={termoAceito}
            onChange={(e) =>
              dispatch({ type: 'SET_TERMO', aceito: e.target.checked })
            }
          />
          <span className="text-xs opacity-80 leading-relaxed">
            Confirmo que li e aceito os termos de participação no Catálogo de
            Tecnologias Sociais 2026, autorizando o uso das informações
            fornecidas para os fins do portal LISA.
          </span>
        </label>
      </div>
    </div>
  );
}
