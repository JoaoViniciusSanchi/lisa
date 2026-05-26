import { notFound } from 'next/navigation';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { FormProvider } from '@/components/cadastro/FormProvider';
import { CadastroController } from '@/components/cadastro/CadastroController';
import type { CadastroState } from '@/components/cadastro/state';

interface Props {
  params: { token: string };
}

export default async function AtualizarPage({ params }: Props) {
  const { token } = params;
  const supabase = createServiceRoleClient();

  // 1. Validar o convite
  const { data: convite } = await supabase
    .from('convite_atualizacao')
    .select('*, experiencia(id, titulo, status), pessoa(id, nome_completo, email)')
    .eq('token', token)
    .maybeSingle();

  if (
    !convite ||
    convite.respondido_em ||
    new Date(convite.expira_em) < new Date()
  ) {
    notFound();
  }

  const experienciaId = convite.experiencia_id as string;

  // 2. Carregar dados completos da experiência
  const [
    { data: exp },
    { data: traducaoPt },
    { data: traducaoEn },
    { data: conteudo },
    { data: pessoas }
  ] = await Promise.all([
    supabase
      .from('experiencia')
      .select(`
        *,
        experiencia_ods(ods_id, is_principal),
        experiencia_finalidade_social(principal, finalidade_social(codigo)),
        experiencia_forproex(principal, area_tematica_forproex(codigo)),
        experiencia_cnpq(is_principal, subarea_cnpq(codigo, grande_area_cnpq(nome))),
        experiencia_macroarea(is_principal, macroarea_ts(codigo))
      `)
      .eq('id', experienciaId)
      .single(),
    supabase
      .from('experiencia_traducao')
      .select('titulo, historico, metodologia, resultados_impactos, desafios_perspectivas')
      .eq('experiencia_id', experienciaId)
      .eq('idioma', 'pt')
      .maybeSingle(),
    supabase
      .from('experiencia_traducao')
      .select('titulo, historico, metodologia, resultados_impactos, desafios_perspectivas')
      .eq('experiencia_id', experienciaId)
      .eq('idioma', 'en')
      .maybeSingle(),
    supabase
      .from('experiencia_conteudo')
      .select('instagram, facebook, youtube, site_externo')
      .eq('experiencia_id', experienciaId)
      .maybeSingle(),
    supabase
      .from('experiencia_pessoa')
      .select('papel, ordem, pessoa(id, nome_completo, email, vinculo, departamento, lattes_url, telefone)')
      .eq('experiencia_id', experienciaId)
      .order('ordem')
  ]);

  if (!exp) notFound();

  // 3. Montar initialData para o FormProvider
  const coord = pessoas?.find((p) => p.papel === 'coordenador')?.pessoa as Record<string, string> | undefined;
  const vice = pessoas?.find((p) => p.papel === 'vice_coordenador')?.pessoa as Record<string, string> | undefined;

  const initialData: Partial<CadastroState> = {
    modo: 'edicao',
    conviteToken: token,
    identificacao: {
      coordNome: coord?.nome_completo ?? '',
      coordEmail: coord?.email ?? '',
      coordTelefone: coord?.telefone ?? '',
      coordLattes: coord?.lattes_url ?? '',
      coordVinculo: coord?.vinculo ?? '',
      coordDepartamento: coord?.departamento ?? '',
      viceNome: vice?.nome_completo ?? '',
      viceEmail: vice?.email ?? ''
    },
    experiencia: {
      titulo: traducaoPt?.titulo ?? exp.titulo ?? '',
      historico: traducaoPt?.historico ?? '',
      metodologia: traducaoPt?.metodologia ?? '',
      dataInicio: exp.data_inicio ? (exp.data_inicio as string).slice(0, 7) : '',
      statusExperiencia: exp.is_perene ? 'perene' : 'em_andamento',
      campus: exp.campus_uff ?? '',
      municipio: exp.municipio ?? '',
      uf: exp.uf ?? ''
    },
    resultados: {
      resultadosImpactos: traducaoPt?.resultados_impactos ?? '',
      desafiosPerspectivas: traducaoPt?.desafios_perspectivas ?? '',
      publicoBeneficiado: '',
      numPessoasAtendidas: '',
      fontesFinanciamento: '',
      parcerias: ''
    },
    materiais: {
      instagram: conteudo?.instagram ?? '',
      siteExterno: conteudo?.site_externo ?? '',
      youtube: conteudo?.youtube ?? '',
      facebook: conteudo?.facebook ?? '',
      linksAdicionais: ''
    },
    // Campos EN para o TextoIngleStep
    experienciaEN: {
      titulo: traducaoEn?.titulo ?? '',
      historico: traducaoEn?.historico ?? '',
      metodologia: traducaoEn?.metodologia ?? '',
      resultadosImpactos: traducaoEn?.resultados_impactos ?? '',
      desafiosPerspectivas: traducaoEn?.desafios_perspectivas ?? ''
    }
  };

  return (
    <div className="min-h-screen bg-bg-base text-warm-white">
      <FormProvider initialData={initialData} modo="edicao">
        <CadastroController />
      </FormProvider>
    </div>
  );
}
