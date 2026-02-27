# OS-system-by-IA

Sistema web de Gestão de Ordens de Serviço para assistência técnica, com arquitetura SaaS multiempresa.

## Estrutura
- `apps/backend`: API NestJS + Prisma + JWT + BullMQ.
- `apps/frontend`: Next.js App Router + Tailwind + React Hook Form + Zod.
- `docs/ARCHITECTURE.md`: visão arquitetural e roadmap.

## Como rodar
```bash
npm install
npm run dev
```

## Backend (variáveis essenciais)
```env
DATABASE_URL=
JWT_SECRET=
REDIS_HOST=localhost
REDIS_PORT=6379
WHATSAPP_PROVIDER=z-api
```

## Entregas desta versão
- Multiempresa por tenant e autenticação JWT com perfis de acesso.
- Criação de OS com numeração sequencial por empresa e cadastro rápido de cliente.
- Fluxo de orçamento com:
  - criação de itens,
  - token público,
  - visualização sem login,
  - aprovação e recusa,
  - atualização automática do status da OS,
  - baixa de estoque para itens vinculados a produto.
- Segurança adicional com `helmet` e `rate limit` via `@nestjs/throttler`.
