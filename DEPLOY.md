# Guia de deploy — Barbearia Prime

Arquitetura de produção usando os planos gratuitos:

| Camada | Serviço | O que roda lá |
|---|---|---|
| Frontend | **Vercel** | Site React (arquivos estáticos + CDN) |
| Backend | **Railway** | API Node.js/Express |
| Banco | **Supabase** | PostgreSQL 16 gerenciado |
| Imagens | **Cloudinary** | Fotos da galeria, equipe e landing page |

```txt
Navegador → Vercel (site) → Railway (API) → Supabase (banco)
                                ↓
                          Cloudinary (imagens)
```

> **Ordem recomendada:** Supabase → Cloudinary → Railway → Vercel.
> O frontend precisa da URL da API, e a API precisa do banco.

---

## 0. Antes de começar

1. Código no GitHub (este repositório).
2. Conta no [GitHub](https://github.com), [Supabase](https://supabase.com), [Railway](https://railway.app), [Vercel](https://vercel.com) e [Cloudinary](https://cloudinary.com) — todas com login pelo GitHub.
3. Gere **dois segredos** e guarde num bloco de notas (serão usados no Railway):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Rode duas vezes: o primeiro valor é o `JWT_ACCESS_SECRET`, o segundo o `JWT_REFRESH_SECRET`.
A API **se recusa a subir** em produção com segredos ausentes, fracos ou com menos de 32 caracteres.

---

## 1. Banco de dados — Supabase

1. Acesse [supabase.com](https://supabase.com) → **Start your project** → entre com o GitHub.
2. **New project**:
   - **Name:** `barbearia`
   - **Database Password:** gere uma senha forte e **guarde** (ela vai na string de conexão).
   - **Region:** `South America (São Paulo)` — menor latência para clientes no Brasil.
   - **Plan:** Free.
3. Aguarde ~2 minutos até o projeto ficar verde.
4. Vá em **Connect** (botão no topo) → aba **ORMs** → **Prisma**. Copie as duas strings:

| Variável | Porta | Para que serve |
|---|---|---|
| `DATABASE_URL` | **6543** (pooler, com `?pgbouncer=true`) | Conexões da API em runtime |
| `DIRECT_URL` | **5432** (conexão direta) | Apenas as migrações do Prisma |

5. Troque `[YOUR-PASSWORD]` pela senha do passo 2 nas duas strings.

> **Por que duas URLs?** O plano gratuito limita conexões simultâneas. A API usa o *pooler*
> (compartilha conexões), mas o Prisma precisa de conexão direta para aplicar migrações.
> O projeto já está configurado para isso — basta preencher as duas variáveis.

**Cuidado com o plano gratuito:** projetos sem acesso por ~7 dias são pausados. Basta
entrar no painel e clicar em *Restore*. Para uso real, o plano Pro evita isso.

---

## 2. Imagens — Cloudinary

1. Acesse [cloudinary.com](https://cloudinary.com) → **Sign up for free**.
2. No **Dashboard**, copie os três valores do bloco *Product Environment Credentials*:
   - `Cloud Name`
   - `API Key`
   - `API Secret` (clique no olho para revelar)
3. Guarde os três — vão para o Railway no próximo passo.

O plano gratuito oferece 25 créditos/mês (aproximadamente 25 GB de tráfego), muito acima do
necessário para uma barbearia. As imagens já são entregues otimizadas (`quality: auto`,
`format: auto`) e por CDN.

> **Sem Cloudinary o sistema sobe assim mesmo**, mas grava as imagens no disco do container —
> que é **apagado a cada deploy**. Em produção, configure sempre.

---

## 3. API — Railway

1. Acesse [railway.app](https://railway.app) → **Login with GitHub**.
2. **New Project** → **Deploy from GitHub repo** → autorize e escolha `agendamento-barbearia`.
3. Abra o serviço criado → aba **Settings**:
   - **Root Directory:** `backend` ← **essencial**, senão o build falha.
   - **Branch:** `main`.
   - Confirme que o *Start Command* é `npm run start:prod` (vem do `railway.json`).
4. Aba **Variables** → **Raw Editor** → cole e ajuste:

```env
NODE_ENV=production
PORT=3333
TRUST_PROXY=true
TIMEZONE=America/Sao_Paulo

DATABASE_URL=postgresql://postgres.PROJETO:SENHA@aws-0-sa-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.PROJETO:SENHA@aws-0-sa-east-1.pooler.supabase.com:5432/postgres

JWT_ACCESS_SECRET=cole-aqui-o-primeiro-segredo-gerado
JWT_REFRESH_SECRET=cole-aqui-o-segundo-segredo-gerado

FRONTEND_ORIGIN=https://SEU-PROJETO.vercel.app

CLOUDINARY_CLOUD_NAME=seu-cloud-name
CLOUDINARY_API_KEY=sua-api-key
CLOUDINARY_API_SECRET=sua-api-secret
CLOUDINARY_FOLDER=barbearia

EMAIL_TRANSPORT=log
EMAIL_FROM=Barbearia Prime <no-reply@seudominio.com.br>
SLOT_INTERVAL_MINUTES=45
MINIMUM_BOOKING_NOTICE_MINUTES=15
```

> O `FRONTEND_ORIGIN` você só saberá depois do passo 4. Deixe um valor provisório
> e **volte para corrigir** — sem isso o navegador bloqueia o login (CORS).

5. Aba **Settings** → **Networking** → **Generate Domain**. Copie a URL gerada
   (ex.: `https://barbearia-production.up.railway.app`).
6. Aguarde o deploy. Ao subir, o comando `prisma migrate deploy` cria as tabelas automaticamente.
7. Teste no navegador: `https://SUA-API.up.railway.app/api/health/ready` deve responder
   `{"status":"ok"...}`. Se responder **503**, o banco não conectou — revise `DATABASE_URL`.

### Criar o primeiro administrador

O banco sobe vazio. Rode o seed uma única vez, do seu computador:

```bash
cd backend
DATABASE_URL="sua-url-do-supabase-porta-6543" DIRECT_URL="sua-url-porta-5432" npx prisma db seed
```

No Windows (PowerShell):

```bash
cd backend; $env:DATABASE_URL="..."; $env:DIRECT_URL="..."; npx prisma db seed
```

Isso cria o acesso `admin@barbearia.local` / `admin123`.
**Troque a senha no primeiro login**, em Painel → Config.

---

## 4. Site — Vercel

1. Acesse [vercel.com](https://vercel.com) → **Continue with GitHub**.
2. **Add New… → Project** → **Import** o repositório `agendamento-barbearia`.
3. Configure:
   - **Framework Preset:** Vite
   - **Root Directory:** `frontend` ← **essencial**
   - Build Command, Output e Install já vêm do `vercel.json`.
4. **Environment Variables** → adicione:

| Name | Value |
|---|---|
| `VITE_API_URL` | `https://SUA-API.up.railway.app/api` |

> Precisa terminar em **`/api`** e **não** pode ter barra no final.

5. **Deploy**. Ao terminar, copie a URL (ex.: `https://barbearia-prime.vercel.app`).
6. **Volte ao Railway** → Variables → ajuste `FRONTEND_ORIGIN` para exatamente essa URL
   (sem barra no final) e aguarde o redeploy automático.

---

## 5. Conferência final

Abra o site publicado e verifique:

- [ ] A página carrega com serviços e profissionais (se aparecer vazio, é CORS/`VITE_API_URL`).
- [ ] O agendamento avança pelas 4 etapas e mostra horários.
- [ ] `/admin/login` aceita `admin@barbearia.local` / `admin123`.
- [ ] Dentro do painel, o upload de uma imagem na Galeria funciona e a URL começa com
      `https://res.cloudinary.com/`.
- [ ] Alterar algo em **Landing page** e salvar reflete no site.
- [ ] Modo escuro/claro alterna e permanece após recarregar.

**Se o login não persistir:** o cookie é `SameSite=None; Secure`, ou seja, exige HTTPS nos dois
lados (Vercel e Railway já fornecem) e `FRONTEND_ORIGIN` exatamente igual ao domínio do site.

---

## 6. Atualizações futuras

O deploy é automático a partir do GitHub:

```bash
git add .
git commit -m "Descricao da mudanca"
git push
```

- **Vercel** reconstrói o site em ~1 minuto.
- **Railway** reconstrói a API e aplica migrações novas automaticamente.

Cuidados:
- Alterou `prisma/schema.prisma`? Gere a migração localmente (`npx prisma migrate dev --name descricao`)
  e faça commit da pasta criada em `prisma/migrations/`. O Railway aplica sozinho no deploy.
- Mudou `VITE_API_URL`? É necessário **redeploy** do frontend: a variável é embutida no build.
- Toda alteração passa pelo CI (testes + build + auditoria). Se o CI falhar, corrija antes de publicar.

### Domínio próprio

- **Vercel:** Project → Settings → Domains → adicione `seudominio.com.br` e aponte o DNS conforme instruído.
- Depois atualize `FRONTEND_ORIGIN` no Railway para o novo domínio (pode manter os dois, separados por vírgula).

---

## 7. Quando o projeto crescer

Sinais de que é hora de sair do gratuito:

| Sintoma | Serviço | Solução |
|---|---|---|
| Banco pausado por inatividade | Supabase | Pro — US$ 25/mês |
| Lentidão com muitos agendamentos | Supabase | Pro (mais CPU/conexões) |
| API "dormindo" ou crédito mensal esgotado | Railway | Hobby — US$ 5/mês |
| Site com muito tráfego / precisa de time | Vercel | Pro — US$ 20/mês |
| Estouro de banda de imagens | Cloudinary | Plus — a partir de US$ 89/mês |

A migração é só troca de plano no painel: **nenhuma alteração de código é necessária**.

Próximos passos naturais de escala:
1. **Backups**: Supabase Pro tem backup diário automático (o gratuito, não).
2. **E-mail real**: troque `EMAIL_TRANSPORT` por um provedor (Resend/SendGrid) — o ponto de
   extensão já existe em `backend/src/services/emailService.js`.
3. **Múltiplas barbearias**: o banco já tem o modelo `Barber` isolando os dados por unidade.
4. **Monitoramento**: os logs saem em JSON com `requestId`; conecte a um agregador quando precisar.

---

## 8. Problemas comuns

| Erro | Causa provável | Correção |
|---|---|---|
| Site abre mas sem dados | `VITE_API_URL` errado ou sem `/api` | Corrija na Vercel e faça redeploy |
| `Origem nao permitida` | `FRONTEND_ORIGIN` diferente do domínio real | Ajuste no Railway (sem barra final) |
| Login não persiste | Cookie cross-site bloqueado | Confirme HTTPS e `FRONTEND_ORIGIN` correto |
| Build do Railway falha | *Root Directory* não é `backend` | Ajuste em Settings |
| `/api/health/ready` retorna 503 | Banco inacessível | Revise `DATABASE_URL` (porta 6543 + `pgbouncer=true`) |
| Imagem some após deploy | Cloudinary não configurado | Preencha as 3 variáveis `CLOUDINARY_*` |
| `Can't reach database server` nas migrações | `DIRECT_URL` ausente/errado | Use a string da porta 5432 |
| API não sobe, log fala de segredo | `JWT_*_SECRET` fraco ou ausente | Gere com 48 bytes e redeploy |

---

## 9. Rodando localmente (continua igual)

Nada do que foi feito para produção quebra o ambiente local:

```bash
cd backend && cp .env.example .env && npm install && npm run db:start
```

Em outro terminal:

```bash
cd backend && node scripts/apply-migration.js && npx prisma db seed && npm run dev
```

E o frontend:

```bash
cd frontend && cp .env.example .env && npm install && npm run dev
```

No Windows há o atalho `start-dev.bat`. Sem as variáveis do Cloudinary, os uploads caem no
disco local (`backend/uploads/`) — comportamento esperado em desenvolvimento.
