'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { api } from '@/lib/api';
import { saveSession } from '@/lib/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { isSubmitting } } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  async function onSubmit(data: z.infer<typeof schema>) {
    setError('');
    try {
      const response = await api.post('/auth/login', data);
      saveSession(response.data.accessToken, response.data.user);
      router.push('/dashboard');
    } catch {
      setError('E-mail ou senha inválidos.');
    }
  }

  return (
    <main className="mx-auto mt-24 max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-2 text-2xl font-semibold">Login</h2>
      <p className="mb-6 text-sm text-slate-300">Acesse com e-mail e senha cadastrados.</p>
      <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
        <input {...register('email')} className="w-full rounded border border-slate-700 bg-slate-950 p-2" placeholder="E-mail" />
        <input type="password" {...register('password')} className="w-full rounded border border-slate-700 bg-slate-950 p-2" placeholder="Senha" />
        <button disabled={isSubmitting} className="w-full rounded bg-emerald-500 p-2 font-semibold text-slate-950">
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-400">{error}</p>}

      <p className="mt-6 text-sm text-slate-300">
        Primeira vez no sistema?{' '}
        <Link className="text-emerald-400 underline" href="/cadastro-empresa">
          Cadastrar empresa
        </Link>
      </p>
    </main>
  );
}
