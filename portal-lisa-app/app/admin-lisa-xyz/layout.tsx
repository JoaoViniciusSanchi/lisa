import '../globals.css';

export const metadata = {
  robots: 'noindex, nofollow'
};

// Auth check fica no layout (protected) para que /login seja acessível.
// Fontes e CSS variables vêm do root layout (app/layout.tsx).
export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg-base text-warm-white antialiased min-h-screen">
      {children}
    </div>
  );
}
