import { FormProvider } from '@/components/cadastro/FormProvider';
import { CadastroControllerTS } from '@/components/cadastro-ts/CadastroControllerTS';

// Sempre dinâmico — mantém paridade com /cadastrar
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Cadastrar Experiência · Tecnologia Social · AGIR UFF',
  description:
    'Cadastre sua experiência no Catálogo 2026 de Tecnologia Social da AGIR UFF.'
};

/**
 * Formulário de cadastro com identidade visual Tecnologia Social / AGIR.
 * Lógica idêntica a /cadastrar, mas tipoOrigem fixo em 'interna_edital'
 * (este formulário só faz sentido em contexto de catálogo TS).
 */
export default function CadastrarTSPage() {
  return (
    <div className="font-nunito bg-ts-deep min-h-screen text-white">
      <FormProvider tipoOrigem="interna_edital">
        <CadastroControllerTS />
      </FormProvider>
    </div>
  );
}
