import type { Metadata } from 'next';
import { Inter, Inter_Tight, Nunito } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  weight: ['200', '300', '400', '500', '600', '700', '800', '900']
});

const interTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-inter-tight',
  display: 'swap',
  weight: ['200', '300', '400', '500', '700', '900']
});

// Fonte do formulário /cadastrar-ts (identidade visual AGIR/Tecnologia Social)
const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800', '900']
});

export const metadata: Metadata = {
  title: 'Portal LISA',
  description: 'Laboratório de Inovação Social Aberto',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt" className={`${inter.variable} ${interTight.variable} ${nunito.variable}`} suppressHydrationWarning>
      <head />
      <body>{children}</body>
    </html>
  );
}
