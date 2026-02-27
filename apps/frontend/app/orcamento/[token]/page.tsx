'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface BudgetItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

interface BudgetPayload {
  id: string;
  total: string;
  status: string;
  items: BudgetItem[];
  serviceOrder: {
    sequence: number;
    client: { name: string };
    company: { name: string };
  };
}

export default function BudgetApprovalPage({ params }: { params: { token: string } }) {
  const [budget, setBudget] = useState<BudgetPayload | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/budgets/public/${params.token}`)
      .then((response) => setBudget(response.data))
      .catch(() => setError('Não foi possível carregar o orçamento.'))
      .finally(() => setLoading(false));
  }, [params.token]);

  async function approve() {
    await api.post(`/budgets/public/${params.token}/approve`);
    setBudget((current) => (current ? { ...current, status: 'APPROVED' } : current));
  }

  async function reject() {
    await api.post(`/budgets/public/${params.token}/reject`, { reason: 'Recusado pelo cliente no portal' });
    setBudget((current) => (current ? { ...current, status: 'REJECTED' } : current));
  }

  if (loading) return <main className="p-6">Carregando orçamento...</main>;
  if (error || !budget) return <main className="p-6 text-red-400">{error || 'Orçamento não encontrado.'}</main>;

  return (
    <main className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-bold">{budget.serviceOrder.company.name}</h1>
      <p className="text-slate-300">Cliente: {budget.serviceOrder.client.name}</p>
      <p className="text-slate-300">OS #{String(budget.serviceOrder.sequence).padStart(4, '0')}</p>

      <div className="mt-4 rounded border border-slate-800 bg-slate-900 p-4">
        <h2 className="mb-3 font-semibold">Itens</h2>
        {budget.items.map((item) => (
          <div key={item.id} className="flex justify-between border-b border-slate-800 py-2 text-sm">
            <span>
              {item.description} x {item.quantity}
            </span>
            <span>R$ {Number(item.totalPrice).toFixed(2)}</span>
          </div>
        ))}
        <p className="mt-3 text-lg font-bold">Total: R$ {Number(budget.total).toFixed(2)}</p>
        <p className="text-xs text-slate-400">Status atual: {budget.status}</p>
      </div>

      <div className="mt-4 flex gap-3">
        <button onClick={approve} className="rounded bg-emerald-500 px-4 py-2 font-semibold">
          Aprovar orçamento
        </button>
        <button onClick={reject} className="rounded bg-red-500 px-4 py-2 font-semibold">
          Recusar orçamento
        </button>
      </div>
    </main>
  );
}
