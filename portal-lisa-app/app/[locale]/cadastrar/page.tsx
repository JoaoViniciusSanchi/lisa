import { generateLocaleStaticParams } from '@/lib/i18n/static-params';
import { FormProvider } from '@/components/cadastro/FormProvider';
import { CadastroController } from '@/components/cadastro/CadastroController';

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

export const metadata = {
  title: 'Cadastrar Experiência · LISA',
  description:
    'Cadastre sua experiência de tecnologia social no Portal LISA. Triagem de aderência + cadastro completo em 8 etapas.'
};

export default function CadastrarPage() {
  return (
    <FormProvider>
      <CadastroController />
    </FormProvider>
  );
}
