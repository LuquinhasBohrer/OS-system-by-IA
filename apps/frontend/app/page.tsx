import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold">OS SaaS para Assistências Técnicas</h1>
      <p className="text-slate-300">Plataforma multiempresa com automações de WhatsApp e aprovação online.</p>
      <div className="flex gap-3">
        <Link className="rounded bg-emerald-500 px-4 py-2 font-medium" href="/login">Entrar</Link>
        <Link className="rounded border border-slate-600 px-4 py-2" href="/dashboard">Ver dashboard</Link>
      </div>
    </main>
  );
}
