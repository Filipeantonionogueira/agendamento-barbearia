# Barbearia Prime — Plataforma de Agendamento

Plataforma SaaS de gestão para barbearia: site institucional, agendamento online, área do cliente
(fidelidade, histórico, avaliações) e painel administrativo.

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18, Vite 5, React Router 6, Tailwind CSS |
| Backend | Node.js 20, Express 4, Prisma ORM |
| Banco | PostgreSQL 16 |
| Auth | JWT em cookie httpOnly + refresh token, bcrypt (custo 12), RBAC multi-role |
| Testes | Vitest |
| CI | GitHub Actions |

## Arquitetura

```txt
frontend/
  src/
    pages/          telas por rota (lazy-loaded)
    components/
      ui/           design system (Button, Input, Modal, Badge, Toast...)
      booking/      passos do fluxo de agendamento
      client/       área logada do cliente
      admin/        abas do painel administrativo
      landing/      seções do site institucional
      layout/       Shell, AdminShell
    context/        AuthProvider (sessão)
    hooks/          useFavorites, usePageMeta
    lib/            api.js (fetch), format.js
  public/           robots.txt, sitemap.xml

backend/
  src/
    routes/         definição de rotas + middlewares
    controllers/    HTTP (request/response)
    services/       regras de negócio + validação (zod)
    repositories/   acesso a dados (Prisma)
    middlewares/    auth, csrf, rateLimit, requestContext, errorHandler
    utils/          time, slots (puros), logger, AppError
    config/         env, prisma, loyalty
  prisma/           schema + migrations
```

**Fluxo de uma requisição:** `route → middleware (auth/rate-limit/csrf) → controller → service (zod + regra) → repository (Prisma) → PostgreSQL`

### Decisões arquiteturais

- **Camadas separadas** (controller/service/repository): regra de negócio isolada de HTTP e de persistência.
- **Multi-role acumulativo**: um `User` pode ser OWNER + BARBER + CLIENT; permissões são a união dos papéis.
- **Lógica pura extraída** (`utils/slots.js`): cálculo de horários testável sem banco.
- **Soft delete/anonimização** para LGPD: histórico de negócio preservado sem dados pessoais.
- **Code splitting por rota**: painel admin não pesa no carregamento do visitante.

## Pré-requisitos

- Node.js 20+
- PostgreSQL (ou use o PostgreSQL embarcado incluído)

## Instalação (desenvolvimento)

```bash
# Backend
cd backend
cp .env.example .env      # gere os segredos (veja abaixo)
npm install
npm run db:start          # sobe o PostgreSQL embarcado
node scripts/apply-migration.js
npx prisma db seed
npm run dev

# Frontend (outro terminal)
cd frontend
cp .env.example .env
npm install
npm run dev
```

No Windows há o atalho `start-dev.bat` (abre banco, backend e frontend). Se o banco falhar na
primeira inicialização: feche as janelas, rode `reset-db.bat` e depois `start-dev.bat`.

### Gerando segredos

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

⚠️ **Em produção o servidor não sobe** com `JWT_ACCESS_SECRET`/`JWT_REFRESH_SECRET` ausentes,
fracos ou com menos de 32 caracteres (fail secure).

## Variáveis de ambiente (backend)

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | sim (prod) | String de conexão do PostgreSQL |
| `JWT_ACCESS_SECRET` | sim (prod) | Segredo do access token (≥32 chars) |
| `JWT_REFRESH_SECRET` | sim (prod) | Segredo do refresh token (≥32 chars) |
| `JWT_ACCESS_EXPIRES_IN` | não | Padrão `15m` |
| `JWT_REFRESH_EXPIRES_IN` | não | Padrão `7d` |
| `FRONTEND_ORIGIN` | sim (prod) | Origens permitidas (CORS/CSRF), separadas por vírgula |
| `NODE_ENV` | sim (prod) | `production` ativa HSTS e as validações de segredo |
| `PORT` | não | Padrão `3333` |
| `TRUST_PROXY` | prod atrás de proxy | `true` para IP real no rate-limit/auditoria |
| `SLOT_INTERVAL_MINUTES` | não | Intervalo entre horários (padrão 45) |
| `PASSWORD_RESET_EXPIRES_MINUTES` | não | Validade do token de reset (padrão 30) |
| `EMAIL_TRANSPORT` | não | `log` (dev) — trocar por provedor real |
| `EMAIL_FROM` | não | Remetente dos e-mails |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | não | Preparado para OAuth futuro |

Frontend: `VITE_API_URL` (ex.: `http://localhost:3333/api`).

## Scripts

**Backend:** `dev`, `start`, `test`, `test:watch`, `db:start`, `seed`, `prisma:generate`, `prisma:migrate`
**Frontend:** `dev`, `build`, `preview`

## Testes

```bash
cd backend && npm test
```

Cobrem a lógica crítica de negócio: cálculo de horários disponíveis (conflitos, bloqueios, janela de
funcionamento), níveis e pontos de fidelidade, utilitários de tempo e a guarda CSRF.

## Segurança

- **Autenticação**: JWT em cookie `httpOnly` + `SameSite=lax` + `Secure` (produção); refresh token com hash.
- **Autorização**: RBAC no backend em todas as rotas; nunca apenas no frontend.
- **Headers**: CSP (`frame-ancestors 'none'`), HSTS (produção), `nosniff`, `Referrer-Policy`, `Permissions-Policy`.
- **CSRF**: verificação de origem em mutações + CORS com allowlist.
- **Rate limiting**: global, login/cadastro (10/15min), reset de senha (5/h), avaliações (15/h), agendamento (8/10min).
- **Injeção**: 100% Prisma parametrizado; validação `zod` em toda entrada.
- **LGPD**: exportação de dados e exclusão com anonimização (`/api/conta/meus-dados`, `DELETE /api/conta`).
- **Auditoria**: trilha de ações administrativas com autor, IP e horário.

## Observabilidade

- Logs estruturados (JSON) com `requestId`, rota, status e duração.
- Header `X-Request-Id` propagado (aceita o do cliente ou gera um).
- Health checks:
  - `GET /api/health` — liveness (processo de pé)
  - `GET /api/health/ready` — readiness (banco + memória); retorna **503** se o banco estiver fora

## Deploy

```bash
# 1. Build do frontend
cd frontend && npm run build          # gera dist/

# 2. Migrações do banco
cd ../backend && npx prisma migrate deploy

# 3. Subir a API
NODE_ENV=production npm start
```

**Checklist de produção:**
1. Segredos fortes definidos (o app recusa subir sem eles).
2. `FRONTEND_ORIGIN` com o domínio real (sem curinga).
3. HTTPS no proxy reverso + `TRUST_PROXY=true`.
4. PostgreSQL fora de acesso público, com backup automático.
5. Servir `frontend/dist` via CDN/Nginx com cache de assets versionados.
6. Validação pós-deploy: `curl https://SEU_DOMINIO/api/health/ready` deve retornar `200`.

**Rollback:** os artefatos de build são versionados por hash; para reverter, republique o `dist`
anterior e faça `git revert` da aplicação. Migrações são aditivas — evite `DROP` em produção.

### Observação sobre migrações locais

O projeto inclui as migrations em `backend/prisma/migrations/`. Onde o Prisma Migrate funciona
normalmente, use `npx prisma migrate deploy`. Neste ambiente Windows o schema engine falhava com o
PostgreSQL embarcado; por isso existe `node scripts/apply-migration.js`, que aplica o mesmo SQL
diretamente e registra em `_prisma_migrations`.

## CI

`.github/workflows/ci.yml` executa em cada push/PR: instalação, `prisma validate`, testes,
`npm audit` (nível high), build do frontend e verificação de que `.env` e dados do PostgreSQL não
foram versionados. Qualquer falha bloqueia a publicação.

## Acesso inicial

Criado pelo seed: `admin@barbearia.local` / `admin123` — **altere no primeiro acesso**.
