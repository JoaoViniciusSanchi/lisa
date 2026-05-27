import { useTranslations } from 'next-intl';
import { generateLocaleStaticParams } from '@/lib/i18n/static-params';
import { Header } from '@/components/ui/Header';
import { Hero } from '@/components/home/Hero';

// Estado do edital é dinâmico — sempre buscado do banco em tempo real
export const dynamic = 'force-dynamic';
import { Apresentacao } from '@/components/home/Apresentacao';
import { Estatisticas } from '@/components/home/Estatisticas';
import { Timeline } from '@/components/home/Timeline';
import { CatalogoDestaque } from '@/components/home/CatalogoDestaque';
import { Sobre } from '@/components/home/Sobre';
import { Footer } from '@/components/ui/Footer';
import { timelineEvents } from '@/lib/mock/home-content';

export function generateStaticParams() {
  return generateLocaleStaticParams();
}

export default function Home() {
  const t = useTranslations('home.timeline');

  return (
    <>
      <Header />
      <Hero />
      <Apresentacao />
      <Estatisticas />
      <Timeline
        events={timelineEvents}
        sectionLabel={t('label')}
        sectionTitlePart1={t('titlePart1')}
        sectionTitleAccent={t('titleAccent')}
        sectionDescription={t('description')}
      />
      <CatalogoDestaque />
      <Sobre />
      <Footer />
    </>
  );
}
