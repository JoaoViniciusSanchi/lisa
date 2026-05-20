import { useTranslations } from 'next-intl';
import { generateLocaleStaticParams } from '@/lib/i18n/static-params';
import { Header } from '@/components/ui/Header';
import { LogoMark } from '@/components/ui/LogoMark';
import { Eyebrow } from '@/components/ui/Eyebrow';
import { SectionNum } from '@/components/ui/SectionNum';
import { Hairline } from '@/components/ui/Hairline';
import { Button } from '@/components/ui/Button';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { LangSwitch } from '@/components/ui/LangSwitch';
import { ArrowRight, ArrowLeft, Check } from '@/components/ui/icons';

/**
 * Galeria de componentes — Fase 1 do design system.
 * Acessível via /pt/dev/components ou /en/dev/components.
 */
export function generateStaticParams() {
  return generateLocaleStaticParams();
}

export default function ComponentsGallery() {
  const t = useTranslations('dev.components');

  return (
    <>
      <Header />
      <main className="min-h-screen pt-32 pb-32 px-8">
      <div className="max-w-[1200px] mx-auto">
        {/* Cabeçalho da galeria */}
        <div className="flex items-center gap-4 mb-6">
          <Hairline className="!w-16" strong />
          <Eyebrow>{t('eyebrow')}</Eyebrow>
        </div>
        <h1 className="font-display font-extralight text-6xl tracking-tight mb-6">
          {t('title')}
        </h1>
        <p className="text-lg opacity-70 font-light max-w-2xl mb-20">
          {t('subtitle')}
        </p>

        <Hairline />

        {/* === LogoMark === */}
        <Section number={1} title="LogoMark">
          <div className="flex items-center gap-12">
            <Variant label="default">
              <LogoMark />
            </Variant>
            <Variant label="small">
              <LogoMark size="small" />
            </Variant>
          </div>
        </Section>

        {/* === Eyebrow === */}
        <Section number={2} title="Eyebrow">
          <div className="space-y-4">
            <Eyebrow>Edital de Chamamento 2026</Eyebrow>
            <Eyebrow as="p">Coordenação · AGIR / PROPPI</Eyebrow>
            <Eyebrow as="div">Última atualização: 12 de abril, 2026</Eyebrow>
          </div>
        </Section>

        {/* === SectionNum === */}
        <Section number={3} title="SectionNum">
          <div className="flex flex-wrap items-center gap-8">
            <SectionNum n={1} />
            <SectionNum n={2} />
            <SectionNum n={5} />
            <SectionNum n={12} />
            <SectionNum n="01 / 127" />
          </div>
        </Section>

        {/* === Hairline === */}
        <Section number={4} title="Hairline">
          <div className="space-y-6">
            <div>
              <p className="text-xs opacity-50 mb-2 uppercase tracking-widest">
                horizontal · default
              </p>
              <Hairline />
            </div>
            <div>
              <p className="text-xs opacity-50 mb-2 uppercase tracking-widest">
                horizontal · strong
              </p>
              <Hairline strong />
            </div>
            <div className="flex items-center gap-4 h-16">
              <p className="text-xs opacity-50 uppercase tracking-widest">
                vertical
              </p>
              <Hairline orientation="vertical" />
              <p className="text-sm opacity-70">conteúdo à direita</p>
            </div>
          </div>
        </Section>

        {/* === Button === */}
        <Section number={5} title="Button">
          <div className="space-y-6">
            <div>
              <p className="text-xs opacity-50 mb-3 uppercase tracking-widest">
                primary · default size
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button>Conectar uma demanda</Button>
                <Button>
                  Cadastrar experiência
                  <ArrowRight />
                </Button>
              </div>
            </div>

            <div>
              <p className="text-xs opacity-50 mb-3 uppercase tracking-widest">
                secondary · default size
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button variant="secondary">Explorar o catálogo</Button>
                <Button variant="secondary">
                  <ArrowLeft />
                  Voltar
                </Button>
              </div>
            </div>

            <div>
              <p className="text-xs opacity-50 mb-3 uppercase tracking-widest">
                small size
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button size="small">
                  Conectar
                  <ArrowRight />
                </Button>
                <Button variant="secondary" size="small">
                  Ver mais
                </Button>
              </div>
            </div>

            <div>
              <p className="text-xs opacity-50 mb-3 uppercase tracking-widest">
                disabled
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Button disabled>Desabilitado</Button>
                <Button variant="secondary" disabled>
                  Desabilitado
                </Button>
              </div>
            </div>
          </div>
        </Section>

        {/* === GlassPanel === */}
        <Section number={6} title="GlassPanel">
          <div className="grid md:grid-cols-2 gap-8">
            <GlassPanel className="p-8">
              <Eyebrow className="mb-3">Default</Eyebrow>
              <h3 className="font-display text-2xl font-light mb-2">
                Chamamento 2026
              </h3>
              <p className="text-sm opacity-60 mb-4">
                Submissões abertas até 30 de junho
              </p>
              <Hairline className="mb-4" />
              <p className="text-xs opacity-50">
                Painel padrão — 12% petrol overlay, blur 20px
              </p>
            </GlassPanel>

            <GlassPanel variant="strong" className="p-8">
              <Eyebrow className="mb-3">Strong</Eyebrow>
              <h3 className="font-display text-2xl font-light mb-2">
                Profa. Dra. Elaine Sigette
              </h3>
              <p className="text-sm opacity-60 mb-4">
                AGIR / PROPPI / UFF
              </p>
              <Hairline strong className="mb-4" />
              <p className="text-xs opacity-50">
                Painel forte — 18% petrol overlay, blur 28px, borda mais visível
              </p>
            </GlassPanel>
          </div>
        </Section>

        {/* === LangSwitch === */}
        <Section number={7} title="LangSwitch">
          <div className="flex items-center gap-12">
            <Variant label="standalone">
              <LangSwitch />
            </Variant>
            <Variant label="contextualizado">
              <div className="flex items-center gap-6 px-4 py-3 bg-bg-elevated">
                <span className="text-xs opacity-50">Header simulado</span>
                <Hairline orientation="vertical" />
                <LangSwitch />
              </div>
            </Variant>
          </div>
        </Section>

        {/* === Tipografia === */}
        <Section number={8} title="Tipografia">
          <div className="space-y-8">
            <div>
              <p className="text-xs opacity-50 mb-3 uppercase tracking-widest">
                display extralight (font-display, weight 200)
              </p>
              <h2 className="font-display font-extralight text-6xl tracking-tight">
                Conhecimento que nasce da prática.
              </h2>
            </div>
            <div>
              <p className="text-xs opacity-50 mb-3 uppercase tracking-widest">
                display medium + italic accent
              </p>
              <h3 className="font-display text-4xl">
                A universidade <span className="italic font-thin text-accent-glow">a serviço</span> da transformação.
              </h3>
            </div>
            <div>
              <p className="text-xs opacity-50 mb-3 uppercase tracking-widest">
                body 200 / 400 / 600
              </p>
              <p className="text-lg font-extralight mb-2">
                Texto extralight — ideal para introduções longas e respiráveis.
              </p>
              <p className="text-base font-normal mb-2 opacity-80">
                Texto regular — corpo de leitura padrão do portal.
              </p>
              <p className="text-sm font-semibold uppercase tracking-widest">
                Texto semibold uppercase — labels e categorias.
              </p>
            </div>
          </div>
        </Section>

        {/* === Paleta === */}
        <Section number={9} title="Paleta">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Swatch name="bg-base" varName="--bg-base" hex="#0E0E10" />
            <Swatch name="bg-elevated" varName="--bg-elevated" hex="#16161A" />
            <Swatch name="bg-card" varName="--bg-card" hex="#1A1A1F" />
            <Swatch name="warm-white" varName="--warm-white" hex="#F4EFE6" />
            <Swatch name="accent" varName="--accent" hex="#2EA39B" />
            <Swatch name="accent-glow" varName="--accent-glow" hex="#3FBDB4" />
            <Swatch name="petrol-light" varName="--petrol-light" hex="#1F5160" />
            <Swatch name="danger" varName="--danger" hex="#E55542" />
            <Swatch name="fuzzy-red" varName="--fuzzy-red" hex="#E55542" />
            <Swatch name="fuzzy-yellow" varName="--fuzzy-yellow" hex="#E5B842" />
            <Swatch name="fuzzy-green" varName="--fuzzy-green" hex="#3FBDB4" />
          </div>
        </Section>

        {/* === Icons === */}
        <Section number={10} title="Icons">
          <div className="flex items-center gap-8 text-warm-white">
            <Variant label="ArrowRight">
              <ArrowRight width={24} height={24} />
            </Variant>
            <Variant label="ArrowLeft">
              <ArrowLeft width={24} height={24} />
            </Variant>
            <Variant label="Check">
              <Check width={24} height={24} />
            </Variant>
          </div>
        </Section>

        <Hairline />
        <p className="mt-12 text-xs opacity-40 uppercase tracking-widest">
          Fim · Fase 1 · Próxima: home (Fase 2)
        </p>
      </div>
    </main>
    </>
  );
}

// ---- Helpers locais para a galeria ----

function Section({
  number,
  title,
  children
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="py-16 border-b border-line">
      <div className="flex items-center gap-6 mb-12">
        <SectionNum n={number} />
        <h2 className="font-display text-3xl font-light tracking-tight">
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

function Variant({
  label,
  children
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-start gap-3">
      <span className="text-[10px] uppercase tracking-widest opacity-50">
        {label}
      </span>
      {children}
    </div>
  );
}

function Swatch({
  name,
  varName,
  hex
}: {
  name: string;
  varName: string;
  hex: string;
}) {
  return (
    <div className="border border-line">
      <div
        className="h-20"
        style={{ background: `var(${varName})` }}
        aria-label={`color swatch ${name}`}
      />
      <div className="p-3 bg-bg-elevated">
        <div className="text-xs font-semibold mb-1">{name}</div>
        <div className="text-[10px] opacity-50 font-mono">{hex}</div>
      </div>
    </div>
  );
}
