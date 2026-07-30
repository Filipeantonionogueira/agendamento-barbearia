# Barbearia Prime — Tudo que o sistema faz

Documento de apresentação: lista completa das funcionalidades da plataforma.

> **Sem descontos no sistema.** Os preços são cadastrados pelo administrador e qualquer
> negociação é feita presencialmente, na barbearia. Não existe cupom, cashback, pontuação
> ou desconto automático em nenhuma tela.

---

## 1. Visão geral

A plataforma tem **3 frentes em um só sistema**:

| Frente | Para quem | Endereço |
|---|---|---|
| Landing page + agendamento online | Visitante / cliente | `/` |
| Área do cliente (conta logada) | Cliente cadastrado | `/conta` |
| Painel administrativo | Dono, admin e barbeiros | `/admin` |

Tudo roda em tempo real sobre o mesmo banco de dados: o que o cliente agenda aparece na hora na
agenda do painel, e o que o dono edita no painel aparece na hora no site.

**Visual:** design premium no nível de produtos SaaS modernos — tipografia editorial, espaçamento
generoso, micro-animações discretas (Framer Motion), scroll reveal e **modo claro/escuro** com
troca instantânea e memória da preferência.

---

## 2. Landing page (100% editável pelo dono)

Todas as seções abaixo têm título, subtítulo, ordem e visibilidade controlados pelo painel:

- **Navbar dinâmica** — transparente sobre o topo, vira sólida com desfoque ao rolar; menu completo no celular.
- **Hero de impacto** — imagem **ou vídeo** de fundo, escurecimento ajustável por controle deslizante,
  botão principal e secundário, e **estatísticas com contagem animada**.
- **Sobre** — texto da barbearia com imagem opcional.
- **Serviços** — cartões com preço, descrição e duração; clicar já leva ao agendamento com o serviço escolhido.
- **Equipe** — foto, **especialidade**, biografia, **nota média das avaliações** e botão "Agendar com [nome]".
- **Galeria / portfólio** — mosaico com filtro por categoria, **lightbox com zoom** (3 níveis), navegação por teclado e setas.
- **Depoimentos** — nota média, distribuição por estrelas animada, foto do cliente, comentário e **resposta da barbearia**.
- **Instagram** — vitrine dos trabalhos publicados, com link para cada post e para o perfil.
- **FAQ** — perguntas frequentes em acordeão, totalmente editáveis.
- **Localização** — endereço, horário, WhatsApp, telefone, e-mail e **mapa incorporado**.
- **Rodapé** — logo, texto próprio, navegação, contatos e **redes sociais**.

SEO já configurado: sitemap, robots.txt, Open Graph (link bonito no WhatsApp), dados estruturados
para o Google e contador de visitas anônimo (respeitando a LGPD).

---

## 3. Agendamento online (o coração do sistema)

Fluxo em **4 etapas com barra de progresso**, transição animada e resumo sempre visível ao lado:

1. **Serviços** — pode selecionar vários; preço e duração somam automaticamente.
2. **Profissional** — foto, especialidade e nota.
3. **Data e horário** — trilho com os próximos 14 dias + calendário; o sistema mostra **apenas horários realmente livres**, calculando:
   - a jornada daquele profissional naquele dia da semana;
   - a duração total dos serviços escolhidos;
   - agendamentos já existentes;
   - bloqueios (férias, folga, almoço);
   - antecedência mínima para agendar.
4. **Dados** — nome, WhatsApp e observações.

Recursos adicionais:

- **Agendamento sem cadastro** — quem não quer criar conta consegue agendar.
- **Cliente logado** — dados preenchidos automaticamente.
- **Lista de espera** — se não houver horário no dia desejado, o cliente entra na fila e é
  **avisado automaticamente** quando alguém cancela.
- **Proteção contra reserva dupla** — a checagem final acontece dentro de uma transação no banco.
- **Confirmação pelo WhatsApp** — ao concluir, abre a mensagem pronta para a barbearia.
- **Limite anti-abuso** — no máximo 8 agendamentos a cada 10 minutos por origem.

---

## 4. Área do cliente

- **Cadastro e login** com e-mail e senha (criptografia forte).
- **Recuperação de senha** por e-mail, com link que expira.
- **Painel** com o próximo atendimento e os últimos serviços.
- **Histórico completo** com valores e serviços.
- **Cancelamento pelo próprio cliente**, com motivo — libera o horário e avisa a lista de espera.
- **Avaliações** — nota de 1 a 5 estrelas e comentário após o atendimento; alimentam os depoimentos do site.
- **Favoritos** — serviços e profissionais preferidos, para agendar mais rápido.
- **Central de notificações** com contador de não lidas (agendamento, cancelamento, avaliação, sistema).
- **Perfil** — nome, telefone, foto e senha.
- **LGPD** — o cliente pode **baixar todos os seus dados** e **excluir a conta** (o histórico de
  negócio é preservado de forma anonimizada).

---

## 5. Painel administrativo (11 abas)

### 5.1 Agenda
Visualização por **dia, semana e mês**; mudança de status direto na lista
(Pendente → Confirmado → Concluído → Cancelado) e **reagendamento** com troca de data, horário
e profissional, sempre validando disponibilidade.

### 5.2 Disponibilidade
Jornada de cada profissional por dia da semana e **bloqueios** (dia inteiro ou faixa de horário, com motivo).

### 5.3 Serviços
Cadastrar, editar, ativar/desativar e excluir: nome, descrição, preço e duração
(a duração alimenta o cálculo de horários).

### 5.4 Profissionais
Nome, **especialidade**, biografia, **foto com upload**, ordem de exibição e ativo/inativo.

### 5.5 Clientes
Lista com busca por nome ou e-mail, **exportação em CSV** e bloqueio/desbloqueio de cliente.

### 5.6 Avaliações
Todas as avaliações recebidas, com **resposta pública da barbearia** e controle de publicação.

### 5.7 Galeria
Upload de imagens com título, categoria, ordem e ativo/inativo.

### 5.8 Landing page (CMS)
O dono edita **praticamente todo o site sem tocar em código**, com reflexo imediato:
logo, hero (textos, imagem, vídeo, escurecimento, botões, estatísticas), títulos e subtítulos de
todas as seções, **ordem e visibilidade das seções**, publicações do Instagram, perguntas do FAQ,
redes sociais, contatos, mapa e rodapé.

### 5.9 Dashboard (relatórios)
Filtro por **dia, semana ou mês**: faturamento, ticket médio, total de atendimentos
(concluídos, confirmados, pendentes, cancelados), clientes novos, **ranking dos serviços mais
vendidos**, nota média, faturamento por dia e **tráfego do site**.

### 5.10 Auditoria
Trilha de todas as ações administrativas: quem fez, o quê, quando e de qual IP.

### 5.11 Configurações
Nome da barbearia, WhatsApp, imagem de destaque, texto "sobre", endereço, horário de funcionamento
e credenciais de acesso.

---

## 6. Controle de acesso

Sistema de **múltiplos papéis acumulativos** — a mesma pessoa pode ser Dono + Barbeiro + Cliente:

| Papel | Acesso |
|---|---|
| **OWNER** (dono) | Tudo |
| **ADMIN** | Painel administrativo completo |
| **BARBER** (barbeiro) | Agenda e avaliações |
| **CLIENT** (cliente) | Área do cliente |

Toda permissão é validada **no servidor**, em todas as rotas — não dá para burlar pelo navegador.

---

## 7. Segurança

- Login por **cookie httpOnly** (o token não fica acessível a scripts) + refresh token com hash.
- Senhas com **bcrypt custo 12**.
- **Proteção CSRF** (verificação de origem em toda alteração) e **CORS** com lista de origens permitidas.
- **Cabeçalhos de segurança**: CSP, HSTS, anti-clickjacking, anti-sniffing.
- **Limites de tentativa**: login/cadastro 10 a cada 15 min, recuperação de senha 5/h, avaliações 15/h, agendamentos 8 a cada 10 min.
- **Zero risco de injeção de SQL**: consultas parametrizadas e toda entrada validada.
- **Uploads** restritos a imagens (JPG/PNG/WEBP, até 5 MB), com nome sempre gerado pelo servidor.
- **Fail secure**: em produção o servidor se recusa a subir com segredos fracos ou ausentes.
- **LGPD**: exportação de dados, exclusão com anonimização e analytics sem dado pessoal.

---

## 8. Infraestrutura

- **Stack**: React 18 + Vite + Tailwind + Framer Motion (frontend); Node.js 20 + Express + Prisma (backend); PostgreSQL 16.
- **Hospedagem** (planos gratuitos, prontos para crescer): Vercel (site), Railway (API),
  Supabase (banco) e Cloudinary (imagens com CDN). Passo a passo em `DEPLOY.md`.
- **Deploy automático pelo GitHub**: cada push publica site e API, aplicando migrações sozinho.
- **Testes automatizados** cobrindo a lógica crítica: horários livres, conflitos, bloqueios,
  proteção CSRF e as principais rotas da API — **44 testes, todos passando**.
- **CI no GitHub Actions**: cada alteração roda testes, build e auditoria de segurança;
  se algo falhar, a publicação é bloqueada.
- **Monitoramento**: logs estruturados com ID de requisição e health checks.
- **Performance**: carregamento por rota (o painel não pesa para o visitante), imagens otimizadas
  por CDN e índices de banco nas consultas pesadas.
- **Pronto para escalar**: o banco já é multi-barbearia, permitindo virar SaaS para outras unidades.

---

## 9. Resumo em números

- **19 áreas de API** no servidor.
- **11 abas** no painel administrativo.
- **11 seções** na landing page, todas editáveis e reordenáveis.
- **4 etapas** no agendamento, com validação em 6 camadas de regra.
- **19 tabelas** no banco de dados.
- **44 testes automatizados** rodando a cada alteração.
