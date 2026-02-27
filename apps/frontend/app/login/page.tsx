'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export default function LoginPage() {
  const { register, handleSubmit } = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
  });

  return (
    <main className="mx-auto mt-24 max-w-md rounded-xl border border-slate-800 bg-slate-900 p-6">
      <h2 className="mb-6 text-2xl font-semibold">Login</h2>
      <form className="space-y-3" onSubmit={handleSubmit(console.log)}>
        <input {...register('email')} className="w-full rounded border border-slate-700 bg-slate-950 p-2" placeholder="E-mail" />
        <input type="password" {...register('password')} className="w-full rounded border border-slate-700 bg-slate-950 p-2" placeholder="Senha" />
        <button className="w-full rounded bg-emerald-500 p-2 font-semibold">Entrar</button>
      </form>
    </main>
  );
}
