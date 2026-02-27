'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { clearSession, getUser } from '@/lib/auth';

interface Kpis {
  openServiceOrders: number;
  closedThisMonth: number;
  monthlyRevenue: number;
  avgTicket: number;
}

interface ServiceOrder {
  id: string;
  sequence: number;
  status: string;
  client: { name: string };
  createdAt: string;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<Kpis | null>(null);
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = getUser();
    if (!user) {
      setError('Sessão não encontrada. Faça login novamente.');
      return;
    }

    Promise.all([api.get('/dashboard/kpis'), api.get('/service-orders')])
      .then(([kpiResponse, orderResponse]) => {
        setKpis(kpiResponse.data);
        setOrders(orderResponse.data);
      })
      .catch(() => setError('Não foi possível carregar o dashboard.'));
  }, []);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
          <p className="text-sm text-slate-300">Painel operacional do sistema de OS.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/configuracoes" className="rounded border border-slate-700 px-4 py-2">Configurações</Link>
          <Link href="/os/nova" className="rounded bg-emerald-500 px-4 py-2 font-semibold text-slate-950">+ Nova OS</Link>
          <button
            onClick={() => {
              clearSession();
              window.location.href = '/login';
            }}
            className="rounded border border-slate-700 px-4 py-2"
          >
            Sair
          </button>
        </div>
      </header>

      {error && <p className="mb-4 rounded border border-red-600/30 bg-red-900/20 p-3 text-red-300">{error}</p>}

      <section className="grid gap-3 md:grid-cols-4">
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-sm text-slate-300">OS abertas</p><h3 className="text-2xl font-semibold">{kpis?.openServiceOrders ?? '-'}</h3></article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-sm text-slate-300">OS finalizadas no mês</p><h3 className="text-2xl font-semibold">{kpis?.closedThisMonth ?? '-'}</h3></article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-sm text-slate-300">Faturamento mensal</p><h3 className="text-2xl font-semibold">R$ {Number(kpis?.monthlyRevenue || 0).toFixed(2)}</h3></article>
        <article className="rounded-xl border border-slate-800 bg-slate-900 p-4"><p className="text-sm text-slate-300">Ticket médio</p><h3 className="text-2xl font-semibold">R$ {Number(kpis?.avgTicket || 0).toFixed(2)}</h3></article>
      </section>

      <section className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 text-xl font-semibold">Ordens de serviço recentes</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-slate-300">
              <tr>
                <th className="py-2">Número</th>
                <th>Cliente</th>
                <th>Status</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td className="py-3 text-slate-400" colSpan={4}>Nenhuma OS cadastrada ainda.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-800">
                    <td className="py-2">#{String(order.sequence).padStart(4, '0')}</td>
                    <td>{order.client?.name || '-'}</td>
                    <td>{order.status}</td>
                    <td>{new Date(order.createdAt).toLocaleDateString('pt-BR')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
