'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

interface SettingsPayload {
  logoUrl?: string;
  serviceTerms: string;
  warrantyTerms: string;
  emailFromAddress?: string;
  serviceOrderEmailTemplate?: string;
  serviceOrderWhatsappTemplate?: string;
}

export default function ConfiguracoesPage() {
  const [form, setForm] = useState<SettingsPayload>({
    logoUrl: '',
    serviceTerms: '',
    warrantyTerms: '',
    emailFromAddress: '',
    serviceOrderEmailTemplate: '',
    serviceOrderWhatsappTemplate: '',
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.get('/settings').then((response) => setForm(response.data)).catch(() => undefined);
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await api.patch('/settings', form);
    setMessage('Configurações salvas com sucesso!');
  }

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-bold">Configurações da empresa</h1>
      <p className="mt-1 text-sm text-slate-300">Personalize logo, termos e mensagens de envio.</p>

      <form onSubmit={save} className="mt-6 space-y-3 rounded border border-slate-800 bg-slate-900 p-4">
        <input value={form.logoUrl || ''} onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))} className="w-full rounded border border-slate-700 bg-slate-950 p-2" placeholder="URL da logo (usada no PDF)" />
        <input value={form.emailFromAddress || ''} onChange={(e) => setForm((f) => ({ ...f, emailFromAddress: e.target.value }))} className="w-full rounded border border-slate-700 bg-slate-950 p-2" placeholder="E-mail remetente" />
        <textarea value={form.serviceTerms || ''} onChange={(e) => setForm((f) => ({ ...f, serviceTerms: e.target.value }))} className="min-h-[90px] w-full rounded border border-slate-700 bg-slate-950 p-2" placeholder="Termos de entrada de serviço" />
        <textarea value={form.warrantyTerms || ''} onChange={(e) => setForm((f) => ({ ...f, warrantyTerms: e.target.value }))} className="min-h-[90px] w-full rounded border border-slate-700 bg-slate-950 p-2" placeholder="Termos de garantia" />
        <textarea value={form.serviceOrderEmailTemplate || ''} onChange={(e) => setForm((f) => ({ ...f, serviceOrderEmailTemplate: e.target.value }))} className="min-h-[90px] w-full rounded border border-slate-700 bg-slate-950 p-2" placeholder="Template e-mail (use {{nome}}, {{numero}}, {{link}})" />
        <textarea value={form.serviceOrderWhatsappTemplate || ''} onChange={(e) => setForm((f) => ({ ...f, serviceOrderWhatsappTemplate: e.target.value }))} className="min-h-[90px] w-full rounded border border-slate-700 bg-slate-950 p-2" placeholder="Template WhatsApp (use {{nome}}, {{numero}}, {{link}})" />

        <button className="rounded bg-emerald-500 px-4 py-2 font-semibold text-slate-950">Salvar configurações</button>
      </form>

      {message && <p className="mt-3 text-emerald-400">{message}</p>}
    </main>
  );
}
