import type { Metadata } from 'next';
import { Inter, Inter_Tight } from 'next/font/google';

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
    <html lang="pt" className={`${inter.variable} ${interTight.variable}`} suppressHydrationWarning>
      <head />
      <body>{children}</body>
    </html>
  );
}
