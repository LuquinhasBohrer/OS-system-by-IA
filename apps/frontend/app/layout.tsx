import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'OS SaaS',
  description: 'Gestão de Ordem de Serviço para assistência técnica',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen bg-slate-950 text-slate-100">{children}</body>
    </html>
  );
}
