'use client';

import { cn } from '@/lib/utils/cn';
import { HairlineTS } from '../HairlineTS';
import { useCadastroForm } from '@/components/cadastro/FormProvider';

const CATEGORIAS_EDITORIAIS = [
  'Metodologias e ferramentas didáticas inovadoras',
  'Jogos',
  'Valorização e preservação da memória cultural',
  'Geração de renda',
  'Acesso a direitos e cidadania',
  'Inovação e saúde',
  'Formação de recursos humanos e intervenção social',
  'Redes e políticas públicas',
  'Popularização e democratização da ciência e da tecnologia'
] as const;

type CategoriaEditorial = (typeof CATEGORIAS_EDITORIAIS)[number];

const MACROAREAS = [
  {
    codigo: 'MAC1',
    nome: 'Desenvolvimento Social e Direitos',
    inclui:
      'Assistência social, inclusão, cidadania, direitos humanos, combate à desigualdade, empoderamento comunitário',
    cnpq_sugerido: 'Ciências Humanas; Ciências Sociais Aplicadas',
    extensao_sugerida: 'Direitos Humanos e Justiça; Educação; Cultura',
    ods_sugeridos: '1, 4, 5, 10, 16'
  },
  {
    codigo: 'MAC2',
    nome: 'Trabalho, Renda e Economia Solidária',
    inclui:
      'Cooperativismo, economia solidária, empreendimentos populares, geração de renda, qualificação profissional',
    cnpq_sugerido: 'Ciências Sociais Aplicadas; Engenharias',
    extensao_sugerida: 'Trabalho; Tecnologia e Produção',
    ods_sugeridos: '8, 9'
  },
  {
    codigo: 'MAC3',
    nome: 'Saúde, Bem-Estar e Cuidado',
    inclui:
      'Saúde pública, saúde mental, cuidado comunitário, nutrição, acessibilidade à saúde, agentes comunitários',
    cnpq_sugerido: 'Ciências da Saúde; Ciências Biológicas',
    extensao_sugerida: 'Saúde',
    ods_sugeridos: '3'
  },
  {
    codigo: 'MAC4',
    nome: 'Sustentabilidade Ambiental e Território',
    inclui:
      'Agroecologia, gestão ambiental, energia renovável, resíduos sólidos, saneamento, territórios tradicionais',
    cnpq_sugerido:
      'Ciências Agrárias; Ciências Biológicas; Ciências Exatas e da Terra',
    extensao_sugerida: 'Meio Ambiente',
    ods_sugeridos: '6, 7, 11, 12, 13, 14, 15'
  },
  {
    codigo: 'MAC5',
    nome: 'Habitação, Infraestrutura e Cidades',
    inclui:
      'Moradia popular, urbanismo social, infraestrutura comunitária, mobilidade urbana, regularização fundiária',
    cnpq_sugerido: 'Engenharias; Ciências Sociais Aplicadas',
    extensao_sugerida: 'Tecnologia e Produção; Direitos Humanos e Justiça',
    ods_sugeridos: '9, 11'
  },
  {
    codigo: 'MAC6',
    nome: 'Educação, Cultura e Comunicação',
    inclui:
      'Educação popular, inclusão digital, patrimônio cultural, comunicação comunitária, artes, mídia alternativa',
    cnpq_sugerido: 'Ciências Humanas; Linguística, Letras e Artes',
    extensao_sugerida: 'Educação; Cultura; Comunicação',
    ods_sugeridos: '4, 10'
  },
  {
    codigo: 'MAC7',
    nome: 'Segurança Alimentar e Nutricional',
    inclui:
      'Agricultura familiar, hortas comunitárias, banco de alimentos, acesso a alimentos saudáveis, soberania alimentar',
    cnpq_sugerido: 'Ciências Agrárias; Ciências da Saúde',
    extensao_sugerida: 'Meio Ambiente; Saúde; Trabalho',
    ods_sugeridos: '2, 3, 12'
  },
  {
    codigo: 'MAC8',
    nome: 'Governança, Participação e Gestão Social',
    inclui:
      'Participação democrática, controle social, gestão pública participativa, transparência, redes sociais de suporte',
    cnpq_sugerido: 'Ciências Sociais Aplicadas',
    extensao_sugerida: 'Direitos Humanos e Justiça',
    ods_sugeridos: '16, 17'
  }
] as const;

type MacroareaCodigo = (typeof MACROAREAS)[number]['codigo'];

export function MacroareaStepTS() {
  const { state, dispatch } = useCadastroForm();
  const {
    categoriaEditorialNome,
    macroareaPrincipalCodigo,
    macroareasSecundariasCodigos = []
  } = state.classificacoes;

  const setCategoria = (categoria: CategoriaEditorial) => {
    if (categoriaEditorialNome === categoria) {
      dispatch({
        type: 'SET_CLASSIFICATION',
        key: 'categoriaEditorialNome',
        value: ''
      });
    } else {
      dispatch({
        type: 'SET_CLASSIFICATION',
        key: 'categoriaEditorialNome',
        value: categoria
      });
    }
  };

  const setPrincipal = (codigo: MacroareaCodigo) => {
    if (macroareaPrincipalCodigo === codigo) {
      dispatch({ type: 'SET_MACROAREA_PRINCIPAL', codigo: null });
    } else {
      dispatch({ type: 'SET_MACROAREA_PRINCIPAL', codigo });
    }
  };

  const toggleSecundaria = (codigo: MacroareaCodigo) => {
    dispatch({ type: 'TOGGLE_MACROAREA_SECUNDARIA', codigo });
  };

  const principalData = MACROAREAS.find(
    (m) => m.codigo === macroareaPrincipalCodigo
  );

  const secundariasAtMaximo = macroareasSecundariasCodigos.length >= 2;

  return (
    <div className="font-nunito">
      <div className="mb-12">
        <div className="font-nunito text-[11px] font-semibold tracking-[0.15em] text-white/50 mb-4">
          [ Cadastro · Etapa 03 de 08 ]
        </div>
        <p className="text-lg font-light leading-relaxed text-white/80 max-w-[680px]">
          Selecione a{' '}
          <strong className="text-white font-semibold">
            categoria editorial
          </strong>{' '}
          e a{' '}
          <strong className="text-white font-semibold">
            macroarea temática principal
          </strong>{' '}
          da sua experiência. Opcionalmente, adicione até duas macroareas
          secundárias.
        </p>
      </div>

      <div className="mb-10 pb-10 border-b border-white/10">
        <div className="mb-6">
          <h3 className="font-nunito text-sm font-semibold text-white mb-4">
            Categoria Editorial
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {CATEGORIAS_EDITORIAIS.map((categoria) => {
              const isSelected = categoriaEditorialNome === categoria;
              return (
                <button
                  key={categoria}
                  type="button"
                  onClick={() => setCategoria(categoria)}
                  aria-pressed={isSelected}
                  className={cn(
                    'text-left p-4 border transition-all duration-150 text-[12px] leading-relaxed font-nunito',
                    isSelected
                      ? 'border-ts-accent bg-ts-accent/15 text-ts-accent'
                      : 'border-white/15 text-white hover:border-ts-accent'
                  )}
                >
                  {categoria}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mb-10">
        <h3 className="font-nunito text-sm font-semibold text-white mb-6">
          Macroareas
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-10">
        {MACROAREAS.map((mac) => {
          const isPrincipal = macroareaPrincipalCodigo === mac.codigo;
          const isSecundaria = macroareasSecundariasCodigos.includes(mac.codigo);
          const isSelected = isPrincipal || isSecundaria;
          const secundariaDisabled =
            !isSecundaria && (secundariasAtMaximo || isPrincipal);

          return (
            <div
              key={mac.codigo}
              className={cn(
                'relative bg-ts-mid transition-all duration-200',
                isSelected && 'bg-ts-mid/80'
              )}
            >
              <div
                className={cn(
                  'absolute top-0 left-0 w-0.5 h-full transition-all duration-200',
                  isPrincipal && 'bg-ts-accent',
                  isSecundaria && !isPrincipal && 'bg-ts-accent opacity-50',
                  !isSelected && 'bg-transparent'
                )}
                aria-hidden="true"
              />

              <div className="pl-5 pr-5 pt-5 pb-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div />
                  {isPrincipal && (
                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-white bg-ts-accent px-2 py-0.5 flex-shrink-0">
                      Principal
                    </span>
                  )}
                  {isSecundaria && (
                    <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-ts-accent border border-ts-accent px-2 py-0.5 flex-shrink-0">
                      Secundária
                    </span>
                  )}
                </div>

                <h3
                  className={cn(
                    'font-nunito text-base font-semibold leading-snug mb-2 transition-colors',
                    isPrincipal && 'text-ts-accent',
                    isSecundaria && !isPrincipal && 'text-white',
                    !isSelected && 'text-white/85'
                  )}
                >
                  {mac.nome}
                </h3>

                <p className="text-[12px] leading-relaxed text-white/55 mb-4">
                  {mac.inclui}
                </p>

                <div className="flex gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPrincipal(mac.codigo)}
                    aria-pressed={isPrincipal}
                    className={cn(
                      'text-[10px] font-semibold uppercase tracking-[0.12em] px-3 py-1.5 border transition-all duration-150 font-nunito',
                      isPrincipal
                        ? 'border-ts-accent bg-ts-accent text-white'
                        : 'border-white/20 text-white hover:border-ts-accent hover:text-ts-accent'
                    )}
                  >
                    {isPrincipal ? 'Principal ✓' : 'Marcar como principal'}
                  </button>

                  {!isPrincipal && (
                    <button
                      type="button"
                      onClick={() => toggleSecundaria(mac.codigo)}
                      aria-pressed={isSecundaria}
                      disabled={secundariaDisabled}
                      className={cn(
                        'text-[10px] font-semibold uppercase tracking-[0.12em] px-3 py-1.5 border transition-all duration-150 font-nunito',
                        isSecundaria
                          ? 'border-ts-accent text-ts-accent'
                          : 'border-white/10 text-white opacity-60 hover:opacity-100 hover:border-white/20',
                        secundariaDisabled &&
                          !isSecundaria &&
                          'pointer-events-none opacity-20'
                      )}
                    >
                      {isSecundaria ? 'Secundária ✓' : '+ Secundária'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {macroareasSecundariasCodigos.length > 0 && (
        <p className="text-[11px] text-white/50 tracking-[0.08em] mb-6">
          {macroareasSecundariasCodigos.length} de 2 macroareas secundárias
          selecionadas
        </p>
      )}

      {principalData && (
        <>
          <HairlineTS className="mb-6" />
          <div
            className="p-6"
            style={{
              background: 'rgba(12, 113, 195, 0.06)',
              border: '1px solid rgba(12, 113, 195, 0.3)'
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-ts-accent mb-3">
              Correspondências sugeridas para {principalData.nome}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-[12px]">
              <div>
                <span className="text-white/50 block mb-1 font-semibold uppercase tracking-[0.1em] text-[9px]">
                  Área CNPq
                </span>
                <span className="text-white/85 leading-relaxed">
                  {principalData.cnpq_sugerido}
                </span>
              </div>
              <div>
                <span className="text-white/50 block mb-1 font-semibold uppercase tracking-[0.1em] text-[9px]">
                  Área FORPROEX
                </span>
                <span className="text-white/85 leading-relaxed">
                  {principalData.extensao_sugerida}
                </span>
              </div>
              <div>
                <span className="text-white/50 block mb-1 font-semibold uppercase tracking-[0.1em] text-[9px]">
                  ODS relacionados
                </span>
                <span className="text-white/85 leading-relaxed">
                  {principalData.ods_sugeridos}
                </span>
              </div>
            </div>
            <p className="text-[11px] text-white/50 mt-4 italic leading-relaxed">
              Nas próximas etapas você pode confirmar ou escolher outras
              combinações. Estas são apenas sugestões baseadas na macroarea
              selecionada.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
