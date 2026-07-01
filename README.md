# Sistema de Agendamento para Barbearia

Sistema web completo para agendamento de barbearia, com tela publica para clientes e painel administrativo protegido para o barbeiro.

## Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Node.js, Express, Prisma ORM
- Banco: PostgreSQL
- Autenticacao: JWT em cookie httpOnly, refresh token e bcrypt

## Estrutura

```txt
frontend/
  src/
    pages/
    components/
    services/
backend/
  src/
    routes/
    controllers/
    services/
    repositories/
    middlewares/
    utils/
  prisma/
```

## Pre-requisitos

- Node.js 20+
- PostgreSQL
- npm

## Configuracao do backend

```bash
cd backend
cp .env.example .env
npm install
npm run db:start
node scripts/apply-migration.js
npx prisma db seed
npm run dev
```

No Windows, tambem existe o atalho:

```bat
start-dev.bat
```

Ele abre banco, backend e frontend em janelas separadas.

Se o banco local der erro na primeira inicializacao, feche as janelas abertas e rode:

```bat
reset-db.bat
start-dev.bat
```

Se preferir Docker:

```bash
docker compose up -d
cd backend
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Variaveis do `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/barbearia?schema=public"
JWT_ACCESS_SECRET="troque-este-segredo"
JWT_REFRESH_SECRET="troque-este-segredo-refresh"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
FRONTEND_ORIGIN="http://localhost:5173"
NODE_ENV="development"
PORT=3333
```

Login inicial criado pelo seed:

- Usuario: `admin`
- Senha: `admin123`

Altere a senha no primeiro acesso.

## Configuracao do frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Variaveis do `.env`:

```env
VITE_API_URL="http://localhost:3333/api"
```

## Rotas principais

Publicas:

- `GET /api/servicos`
- `POST /api/agendamentos`
- `GET /api/disponibilidade`
- `POST /api/auth/login`
- `POST /api/auth/refresh`

Protegidas:

- `POST /api/servicos`
- `PUT /api/servicos/:id`
- `DELETE /api/servicos/:id`
- `GET /api/agendamentos`
- `PUT /api/agendamentos/:id/status`
- `PUT /api/disponibilidade`
- `GET /api/bloqueios`
- `POST /api/bloqueios`
- `DELETE /api/bloqueios/:id`
- `GET /api/dashboard`
- `GET /api/configuracoes`
- `PUT /api/configuracoes`

## Producao

```bash
cd frontend
npm run build

cd ../backend
npm run start
```

Em producao, configure HTTPS no proxy/reverso, use segredos fortes no `.env`, limite CORS ao dominio real e mantenha o PostgreSQL fora de acesso publico.

## Observacao sobre migracoes locais

O projeto inclui a migration SQL em `backend/prisma/migrations/20260618205200_init/migration.sql`.
Em ambientes onde o Prisma Migrate funcionar normalmente, use `npx prisma migrate dev`.
Neste Windows, o schema engine do Prisma falhou sem detalhe ao falar com o PostgreSQL embutido; por isso foi criado o script `node scripts/apply-migration.js`, que aplica a mesma migration SQL diretamente no PostgreSQL real e registra `_prisma_migrations`.
