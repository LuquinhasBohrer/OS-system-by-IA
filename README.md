# OS-system-by-IA

Sistema web de Gestão de Ordens de Serviço para assistência técnica, com arquitetura SaaS multiempresa.

## Estrutura do projeto
- `apps/backend`: API NestJS + Prisma + JWT + BullMQ.
- `apps/frontend`: Next.js App Router + Tailwind + React Hook Form + Zod.
- `docs/ARCHITECTURE.md`: visão arquitetural e roadmap.
- `docker-compose.yml`: sobe PostgreSQL e Redis prontos para uso local.

## Fluxos já disponíveis
- Área de configurações para logo da empresa, termos de entrada/garantia e templates de e-mail/WhatsApp.
- Ao criar OS, o sistema gera PDF automaticamente e envia e-mail com anexo + link de acompanhamento.
- Ao criar OS, o sistema envia mensagem automática via WhatsApp com link de acompanhamento e PDF.
- Cadastro de empresa com usuário administrador.
- Login por e-mail e senha.
- Dashboard com KPIs e listagem de OS recentes.
- Botão e tela para criação de nova OS.
- Criação de OS com cliente existente ou cadastro rápido.
- Fluxo de orçamento público por token (visualizar/aprovar/recusar).

## Rodar local (passo a passo)

### 1) Pré-requisitos
- Node.js 20+
- Docker Desktop
- Git

### 2) Clonar e instalar
```bash
git clone <URL_DO_REPOSITORIO>
cd OS-system-by-IA
npm install
```

### 3) Subir banco e redis
```bash
docker compose up -d
```

### 4) Configurar variáveis do backend
```bash
cp apps/backend/.env.example apps/backend/.env
```

### 5) Criar estrutura do banco (Prisma)
```bash
npm run prisma:generate -w apps/backend
npm run prisma:migrate -w apps/backend
```

### 6) Rodar backend + frontend
```bash
npm run dev
```

## URLs
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/docs`

## Login e cadastro inicial
1. Acesse `http://localhost:3000/cadastro-empresa`
2. Cadastre empresa + usuário admin
3. Entre em `http://localhost:3000/login`
4. Abra dashboard e clique em **+ Nova OS**

## Backend (variáveis essenciais)
```env
DATABASE_URL=
JWT_SECRET=
REDIS_HOST=localhost
REDIS_PORT=6379
WHATSAPP_PROVIDER=z-api
FRONTEND_URL=http://localhost:3000
BACKEND_PUBLIC_URL=http://localhost:3001
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=
WHATSAPP_API_URL=
WHATSAPP_API_TOKEN=
```
