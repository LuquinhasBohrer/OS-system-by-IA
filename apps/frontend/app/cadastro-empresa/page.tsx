'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/lib/api';

const schema = z.object({
  companyName: z.string().min(2),
  adminName: z.string().min(2),
  adminEmail: z.string().email(),
  adminPassword: z.string().min(6),
});

type FormData = z.infer<typeof schema>;

export default function RegisterCompanyPage() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: FormData) {
    setError('');
    setMessage('');
    try {
      await api.post('/auth/register-company', data);
      setMessage('Empresa cadastrada com sucesso! Agora faça login.');
    } catch (err) {
      setError('Não foi possível cadastrar. Verifique os dados e tente novamente.');
    }
  }

  return (
    <main className="mx-auto mt-10 max-w-lg rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h1 className="mb-2 text-2xl font-bold">Cadastro da Empresa</h1>
      <p className="mb-6 text-sm text-slate-300">Crie a empresa e o usuário administrador do sistema.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input {...register('companyName')} className="w-full rounded border border-slate-700 bg-slate-950 p-2" placeholder="Nome da empresa" />
        <input {...register('adminName')} className="w-full rounded border border-slate-700 bg-slate-950 p-2" placeholder="Nome do administrador" />
        <input {...register('adminEmail')} className="w-full rounded border border-slate-700 bg-slate-950 p-2" placeholder="E-mail do administrador" />
        <input type="password" {...register('adminPassword')} className="w-full rounded border border-slate-700 bg-slate-950 p-2" placeholder="Senha" />
        <button disabled={isSubmitting} className="w-full rounded bg-emerald-500 p-2 font-semibold text-slate-950">
          {isSubmitting ? 'Cadastrando...' : 'Cadastrar empresa'}
        </button>
      </form>

      {message && <p className="mt-4 text-emerald-400">{message}</p>}
      {error && <p className="mt-4 text-red-400">{error}</p>}

      <div className="mt-6 text-sm">
        Já tem conta? <Link className="text-emerald-400 underline" href="/login">Entrar</Link>
      </div>
    </main>
  );
}
