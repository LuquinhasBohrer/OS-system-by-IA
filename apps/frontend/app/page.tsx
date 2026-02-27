import Link from 'next/link';

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-4xl font-bold">OS SaaS para Assistências Técnicas</h1>
      <p className="text-slate-300">Plataforma multiempresa com cadastro de empresa, login e dashboard operacional.</p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link className="rounded bg-emerald-500 px-4 py-2 font-medium text-slate-950" href="/cadastro-empresa">Cadastrar empresa</Link>
        <Link className="rounded border border-slate-600 px-4 py-2" href="/login">Entrar</Link>
        <Link className="rounded border border-slate-600 px-4 py-2" href="/dashboard">Dashboard</Link>
      </div>
    </main>
  );
}
