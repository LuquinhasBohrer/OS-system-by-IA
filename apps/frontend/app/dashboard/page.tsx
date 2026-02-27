const cards = [
  { label: 'OS abertas', value: '0' },
  { label: 'OS finalizadas no mês', value: '0' },
  { label: 'Faturamento mensal', value: 'R$ 0,00' },
  { label: 'Ticket médio', value: 'R$ 0,00' },
];

export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="mb-4 text-3xl font-bold">Dashboard Administrativo</h1>
      <section className="grid gap-3 md:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm text-slate-300">{card.label}</p>
            <h3 className="text-2xl font-semibold">{card.value}</h3>
          </article>
        ))}
      </section>
    </main>
  );
}
