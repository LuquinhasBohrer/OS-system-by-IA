# Arquitetura SaaS - Gestão de OS

## Visão geral
Esta base entrega um **MVP enterprise-ready** para evoluir para produto comercial:
- Monorepo com `apps/backend` (NestJS) e `apps/frontend` (Next.js App Router).
- Isolamento multiempresa por `companyId` (tenant) em todas entidades de domínio.
- Banco PostgreSQL via Prisma com integridade referencial e enums de status.
- Trilha para automações assíncronas com Redis + BullMQ.

## Módulos backend implementados
- **Auth/JWT + bcrypt**: cadastro/login e payload com `companyId` + `role`.
- **RBAC**: decorators e `RolesGuard` para Admin/Técnico/Atendente.
- **Clientes**: busca por nome/CPF/telefone e suporte a cadastro rápido.
- **OS**: criação com numeração sequencial por empresa (`@@unique[companyId, sequence]`), multi-equipamentos e histórico inicial.
- **Orçamentos**: criação de itens, token público, hash de integridade, aprovação/recusa online e mudança automática do status da OS.
- **Estoque**: baixa automática de peças vinculadas ao orçamento quando aprovado.
- **Notificações/WhatsApp/PDF**: portas para integração Z-API/Evolution, e-mail e PDFs automáticos.
- **Dashboard**: endpoint inicial de KPIs.

## Segurança e compliance
- Validação de input com `class-validator` (e espaço para Zod em fluxos específicos).
- JWT bearer, whitelist de payload no `ValidationPipe`.
- Modelo de `logs` para auditoria de ações e trilhas legais de aprovação.
- Preparado para rate limit, sanitização e backup automatizado no deploy.

## Infra sugerida
- Backend: Railway/Render
- Frontend: Vercel
- DB: Supabase/Neon
- Upload: Cloudinary
- Filas: Redis gerenciado

## Roadmap imediato (próximas sprints)
1. Completar CRUDs e guards por recurso (enforcement de `companyId`).
2. Workflow completo de orçamento público (aprovar/recusar com IP + expiração).
3. Geração real de PDF com Puppeteer + QR Code e assinatura digital.
4. Integração Stripe para limites por plano e cobrança recorrente.
5. Tela operacional completa (Kanban timeline OS, estoque e relatórios).
