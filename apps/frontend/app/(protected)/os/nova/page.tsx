'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getUser } from '@/lib/auth';

interface Client {
  id: string;
  name: string;
  phone: string;
}

export default function NovaOsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [mode, setMode] = useState<'existing' | 'new'>('existing');
  const [newClientName, setNewClientName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [equipmentType, setEquipmentType] = useState('Celular');
  const [brand, setBrand] = useState('Samsung');
  const [model, setModel] = useState('');
  const [issue, setIssue] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/clients').then((response) => setClients(response.data)).catch(() => undefined);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage('');
    setError('');

    const user = getUser();
    if (!user) {
      setError('Faça login novamente.');
      return;
    }

    try {
      await api.post('/service-orders', {
        technicianId: user.id,
        clientId: mode === 'existing' ? selectedClient : undefined,
        newClient: mode === 'new' ? { name: newClientName, phone: newClientPhone } : undefined,
        equipments: [
          {
            equipmentType,
            brand,
            model,
            reportedIssue: issue,
          },
        ],
      });

      setMessage('OS criada com sucesso!');
      setIssue('');
      setModel('');
    } catch {
      setError('Erro ao criar OS. Verifique os dados.');
    }
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Nova Ordem de Serviço</h1>
      <p className="mt-2 text-slate-300">Crie OS com cliente existente ou cadastro rápido.</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4 rounded border border-slate-800 bg-slate-900 p-4">
        <div className="flex gap-3">
          <button type="button" onClick={() => setMode('existing')} className={`rounded px-3 py-2 ${mode === 'existing' ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700'}`}>Cliente existente</button>
          <button type="button" onClick={() => setMode('new')} className={`rounded px-3 py-2 ${mode === 'new' ? 'bg-emerald-500 text-slate-950' : 'border border-slate-700'}`}>Cadastro rápido</button>
        </div>

        {mode === 'existing' ? (
          <select value={selectedClient} onChange={(e) => setSelectedClient(e.target.value)} className="w-full rounded border border-slate-700 bg-slate-950 p-2">
            <option value="">Selecione o cliente</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>{client.name} - {client.phone}</option>
            ))}
          </select>
        ) : (
          <div className="grid gap-3 md:grid-cols-2">
            <input value={newClientName} onChange={(e) => setNewClientName(e.target.value)} className="rounded border border-slate-700 bg-slate-950 p-2" placeholder="Nome do cliente" />
            <input value={newClientPhone} onChange={(e) => setNewClientPhone(e.target.value)} className="rounded border border-slate-700 bg-slate-950 p-2" placeholder="Telefone" />
          </div>
        )}

        <div className="grid gap-3 md:grid-cols-2">
          <input value={equipmentType} onChange={(e) => setEquipmentType(e.target.value)} className="rounded border border-slate-700 bg-slate-950 p-2" placeholder="Tipo de equipamento" />
          <input value={brand} onChange={(e) => setBrand(e.target.value)} className="rounded border border-slate-700 bg-slate-950 p-2" placeholder="Marca" />
          <input value={model} onChange={(e) => setModel(e.target.value)} className="rounded border border-slate-700 bg-slate-950 p-2" placeholder="Modelo" />
          <input value={issue} onChange={(e) => setIssue(e.target.value)} className="rounded border border-slate-700 bg-slate-950 p-2" placeholder="Defeito relatado" />
        </div>

        <button className="rounded bg-emerald-500 px-4 py-2 font-semibold text-slate-950">Salvar OS</button>
      </form>

      {message && <p className="mt-4 text-emerald-400">{message}</p>}
      {error && <p className="mt-4 text-red-400">{error}</p>}
    </main>
  );
}
