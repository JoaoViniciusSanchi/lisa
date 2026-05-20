/**
 * Mock data para a home — Fase 2 visual pixel-perfect.
 * TODO Fase 4: substituir por queries reais ao Supabase
 *   - timelineEvents → pode virar tabela `marco_historico` ou ficar em
 *     configuracao_sistema
 *   - catalogHighlights → SELECT FROM view_catalogo_publico LIMIT 6
 *   - statTotals → SELECT FROM view_estatisticas_dashboard
 */

export interface TimelineEvent {
  year: string;
  eyebrow: string;
  description: string;
  highlight?: boolean;
}

export const timelineEvents: TimelineEvent[] = [
  {
    year: '1960',
    eyebrow: 'Fundação da UFF',
    description:
      'Criação da universidade — originalmente UFERJ — pela Lei nº 3.848, unificando faculdades em Niterói.'
  },
  {
    year: '2009',
    eyebrow: 'Nasce a AGIR',
    description:
      'Criação da Agência de Inovação, centralizando gestão de patentes, Incubadora de Empresas e o Escritório de Transferência de Conhecimento.'
  },
  {
    year: '2010',
    eyebrow: 'Marco teórico',
    description:
      'Publicação da obra de Aelson Silva de Almeida fundamentando a relação entre extensão universitária e tecnologias sociais.'
  },
  {
    year: '2015',
    eyebrow: 'Setor de Tecnologia Social',
    description:
      'Criação oficial do Setor de Tecnologia Social dentro da estrutura da AGIR, consolidando a frente de atuação.'
  },
  {
    year: '2017',
    eyebrow: 'Primeiro Catálogo',
    description:
      'Lançamento da primeira edição do Catálogo de Tecnologias Sociais da UFF, registrando 32 experiências iniciais.'
  },
  {
    year: '2022',
    eyebrow: 'Expansão',
    description:
      'Catálogo expandido para 95 tecnologias sociais, com ênfase em soluções para os desafios da pandemia.'
  },
  {
    year: '2025',
    eyebrow: 'Internacionalização',
    description:
      'Internacionalização das tecnologias sociais com o lançamento do primeiro catálogo bilíngue em Português e Inglês.'
  },
  {
    year: '2026',
    eyebrow: 'Portal LISA',
    description:
      'Lançamento do Laboratório de Inovação Social Aberto, focado em co-criação de conhecimento e inovação aberta.',
    highlight: true
  }
];

export interface CatalogHighlight {
  index: string;
  category: string;
  title: string;
  description: string;
  faculty: string;
  location: string;
  odsCodes: number[];
}

export const catalogHighlights: CatalogHighlight[] = [
  {
    index: '01 / 127',
    category: 'Inovação e Saúde',
    title: 'Cozinha CuidAR: oficinas culinárias para saúde renal',
    description:
      'Educação alimentar prática para pacientes com Doença Renal Crônica, integrando saberes científicos e populares.',
    faculty: 'Faculdade de Nutrição',
    location: 'Niterói, RJ',
    odsCodes: [3, 4]
  },
  {
    index: '02 / 127',
    category: 'Memória Cultural',
    title: 'Quilombolas Digitais: arquivo vivo de tradições orais',
    description:
      'Plataforma colaborativa para preservação de narrativas, cantos e saberes de comunidades quilombolas fluminenses.',
    faculty: 'Inst. de História',
    location: 'Campos, RJ',
    odsCodes: [11, 15]
  },
  {
    index: '03 / 127',
    category: 'Geração de Renda',
    title: 'Costura Cooperativa: economia solidária no têxtil',
    description:
      'Apoio à organização de cooperativas de costureiras com formação em gestão e acesso a mercados éticos.',
    faculty: 'Adm. e Serviço Social',
    location: 'São Gonçalo, RJ',
    odsCodes: [8, 10]
  },
  {
    index: '04 / 127',
    category: 'Meio Ambiente',
    title: 'Cisternas Rurais: captação de água para escolas',
    description:
      'Projeto técnico-social para implementação de sistemas de captação pluvial em escolas de zonas rurais.',
    faculty: 'Eng. Agrícola',
    location: 'Volta Redonda, RJ',
    odsCodes: [6, 13]
  },
  {
    index: '05 / 127',
    category: 'Educação',
    title: 'Meninas na Ciência: laboratório vivo',
    description:
      'Programa de mentoria e oficinas STEM para meninas de escolas públicas do entorno da universidade.',
    faculty: 'Inst. de Física',
    location: 'Niterói, RJ',
    odsCodes: [4, 5]
  },
  {
    index: '06 / 127',
    category: 'Acesso à Justiça',
    title: 'Núcleo de Mediação Comunitária',
    description:
      'Resolução pacífica de conflitos em comunidades com formação de mediadores locais e atendimento gratuito.',
    faculty: 'Faculdade de Direito',
    location: 'Niterói, RJ',
    odsCodes: [16, 17]
  }
];

export const statTotals = {
  experiencias: 127,
  grandesAreasCnpq: 9,
  ods: 17,
  campi: 5
};
