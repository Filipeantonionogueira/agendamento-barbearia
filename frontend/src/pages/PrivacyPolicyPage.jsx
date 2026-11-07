import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Cookie, UserCheck, Lock, FileText, ArrowLeft, Settings } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta.js";
import { useConsent } from "../context/ConsentContext.jsx";
import { Button } from "../components/ui/Button.jsx";

export function PrivacyPolicyPage() {
  usePageMeta({
    title: "Política de Privacidade (LGPD)",
    description: "Saiba como a Lukaobarber7 protege, coleta e trata seus dados pessoais em conformidade com a LGPD (Lei 13.709/2018)."
  });

  const { openPreferences } = useConsent();

  return (
    <div className="min-h-screen bg-paper text-text-primary">
      <header className="border-b border-border bg-paper/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-md border border-border px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft size={16} /> Voltar ao site
          </Link>
          <div className="flex items-center gap-2">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-gold/15 text-gold-600 dark:text-gold-400">
              <ShieldCheck size={18} />
            </span>
            <span className="font-display font-semibold text-text-primary">Lukaobarber7</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 md:py-14">
        <div className="rounded-xl border border-border bg-surface p-6 sm:p-10 shadow-sm">
          <div className="border-b border-border pb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-600 dark:text-gold-400">
              LGPD — Lei Federal nº 13.709/2018
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Política de Privacidade e Proteção de Dados
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Última atualização: 07 de novembro de 2026 • Versão 1.0
            </p>
          </div>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-text-secondary sm:text-base">
            {/* Secao 1 */}
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary sm:text-xl">
                <FileText size={20} className="text-gold" /> 1. Apresentação e Identificação do Controlador
              </h2>
              <p className="mt-3">
                A <strong>Lukaobarber7</strong> está comprometida com a transparência, privacidade e proteção dos dados
                pessoais de seus clientes e usuários. Esta Política de Privacidade descreve de forma clara e acessível
                como coletamos, armazenamos, tratamos e protegemos suas informações ao utilizar nosso site e sistema de
                agendamento online, em estrita observância à <strong>Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018)</strong>.
              </p>
              <div className="mt-4 rounded-lg border border-border bg-surface-subtle p-4 text-xs sm:text-sm">
                <strong className="block text-text-primary">Dados do Controlador e Encarregado pelo Tratamento:</strong>
                <ul className="mt-2 space-y-1">
                  <li><strong>Nome Comercial:</strong> Lukaobarber7</li>
                  <li><strong>Razão Social / Titular:</strong> [A ser preenchido pelo proprietário da barbearia]</li>
                  <li><strong>CNPJ / CPF:</strong> [A ser informado pelo proprietário]</li>
                  <li><strong>Endereço:</strong> [Endereço oficial do estabelecimento]</li>
                  <li><strong>Canal de Privacidade / DPO:</strong> [contato@lukaobarber7.com.br ou via WhatsApp da Barbearia]</li>
                </ul>
              </div>
            </section>

            {/* Secao 2 */}
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary sm:text-xl">
                <UserCheck size={20} className="text-gold" /> 2. Dados Pessoais Coletados e Finalidades
              </h2>
              <p className="mt-3">
                Coletamos apenas as informações estritamente necessárias para operacionalizar os agendamentos e prestar
                nossos serviços de barbearia com excelência:
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-subtle font-semibold text-text-primary">
                      <th className="p-3">Categoria de Dados</th>
                      <th className="p-3">Dados Coletados</th>
                      <th className="p-3">Finalidade do Tratamento</th>
                      <th className="p-3">Base Legal (LGPD)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-3 font-medium text-text-primary">Identificação e Contato</td>
                      <td className="p-3">Nome, e-mail e telefone/WhatsApp</td>
                      <td className="p-3">Identificar o cliente, confirmar horário e enviar comunicações sobre o agendamento.</td>
                      <td className="p-3">Execução de Contrato (Art. 7º, V)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-text-primary">Agendamento de Serviços</td>
                      <td className="p-3">Serviço escolhido, profissional, data, horário e observações de preferência</td>
                      <td className="p-3">Reservar o horário com o barbeiro e preparar o atendimento.</td>
                      <td className="p-3">Execução de Contrato (Art. 7º, V)</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-text-primary">Autenticação e Acesso</td>
                      <td className="p-3">E-mail, hash de senha criptografada (bcrypt), ou identificador Google OAuth</td>
                      <td className="p-3">Garantir acesso seguro à área do cliente para histórico e cancelamentos.</td>
                      <td className="p-3">Execução de Contrato (Art. 7º, V) e Segurança</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-medium text-text-primary">Registros de Acesso</td>
                      <td className="p-3">Endereço IP, data/hora e identificador anônimo de sessão</td>
                      <td className="p-3">Segurança cibernética, mitigação de abusos (rate limiting) e métricas agregadas anônimas.</td>
                      <td className="p-3">Obrigação Legal (Art. 7º, II) e Consentimento</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Secao 3 */}
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary sm:text-xl">
                <Cookie size={20} className="text-gold" /> 3. Inventário de Cookies e Tecnologias de Rastreamento
              </h2>
              <p className="mt-3">
                Nosso site não utiliza cookies invasivos de publicidade ou rastreamento cruzado de terceiros. Abaixo
                está o inventário detalhado de todas as tecnologias de armazenamento local utilizadas:
              </p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-subtle font-semibold text-text-primary">
                      <th className="p-3">Nome do Cookie / Storage</th>
                      <th className="p-3">Tipo / Categoria</th>
                      <th className="p-3">Duração</th>
                      <th className="p-3">Finalidade Explicada</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="p-3 font-mono font-medium text-text-primary">accessToken</td>
                      <td className="p-3"><span className="rounded bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand">Necessário</span></td>
                      <td className="p-3">15 minutos</td>
                      <td className="p-3">Cookie seguro (HTTPOnly) para manter a sessão autenticada do usuário.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-text-primary">refreshToken</td>
                      <td className="p-3"><span className="rounded bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand">Necessário</span></td>
                      <td className="p-3">7 dias</td>
                      <td className="p-3">Cookie seguro (HTTPOnly) para renovar a sessão sem exigir login repetido.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-text-primary">lgpd_cookie_consent_v1</td>
                      <td className="p-3"><span className="rounded bg-brand/10 px-2 py-0.5 text-xs font-bold text-brand">Necessário</span></td>
                      <td className="p-3">Persistente</td>
                      <td className="p-3">Armazena a decisão de consentimento do usuário sobre o uso de cookies.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-text-primary">bp_theme</td>
                      <td className="p-3"><span className="rounded bg-gold/15 px-2 py-0.5 text-xs font-bold text-gold-600 dark:text-gold-400">Preferências</span></td>
                      <td className="p-3">Persistente</td>
                      <td className="p-3">Lembra se você escolheu o tema Claro ou Escuro na interface.</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-text-primary">bp_session</td>
                      <td className="p-3"><span className="rounded bg-blue-500/15 px-2 py-0.5 text-xs font-bold text-blue-600 dark:text-blue-400">Analítico</span></td>
                      <td className="p-3">Sessão</td>
                      <td className="p-3">Identificador aleatório e anônimo para contabilizar visitas totais no dashboard administrativo (bloqueado sem consentimento).</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="mt-5 rounded-lg border border-border bg-surface-subtle p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <strong className="block text-text-primary">Gerenciar suas preferências de cookies:</strong>
                  <span className="text-xs text-text-muted">Você pode alterar ou revogar seu consentimento a qualquer momento.</span>
                </div>
                <Button variant="secondary" size="sm" onClick={openPreferences}>
                  <Settings size={15} /> Alterar Preferências de Cookies
                </Button>
              </div>
            </section>

            {/* Secao 4 */}
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary sm:text-xl">
                <Lock size={20} className="text-gold" /> 4. Segurança e Compartilhamento de Informações
              </h2>
              <p className="mt-3">
                A <strong>Lukaobarber7 não comercializa, não aluga e não repassa dados pessoais a terceiros para fins de marketing ou publicidade</strong>.
                O compartilhamento de dados ocorre unicamente nas seguintes hipóteses estritamente necessárias:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li><strong>Provedores de Infraestrutura e Banco de Dados:</strong> servidores seguros em nuvem para armazenamento criptografado dos dados operacionais.</li>
                <li><strong>Provedores de Mensagens e E-mail:</strong> serviços para entrega de tokens de recuperação de senha e link direto ao WhatsApp da barbearia.</li>
                <li><strong>Google Identity Services:</strong> quando o cliente opta livremente pelo botão &quot;Continuar com Google&quot;.</li>
                <li><strong>Determinação Legal ou Judicial:</strong> mediante requisição fundamentada de autoridades competentes.</li>
              </ul>
            </section>

            {/* Secao 5 */}
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary sm:text-xl">
                <ShieldCheck size={20} className="text-gold" /> 5. Direitos dos Titulares de Dados (Art. 18 da LGPD)
              </h2>
              <p className="mt-3">
                Você é o único titular de seus dados e tem pleno controle sobre eles. Em conformidade com o Artigo 18 da LGPD,
                você pode a qualquer momento:
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-4">
                  <strong className="block text-text-primary">Acesso e Portabilidade</strong>
                  <p className="mt-1 text-xs text-text-secondary">
                    Você pode baixar cópia de todos os seus dados cadastrais e agendamentos em formato estruturado (JSON)
                    diretamente na página <strong>Minha Conta &gt; Perfil</strong>.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <strong className="block text-text-primary">Direito à Eliminação / Esquecimento</strong>
                  <p className="mt-1 text-xs text-text-secondary">
                    Você pode solicitar a exclusão definitiva e anonimização de sua conta clicando em &quot;Excluir minha conta&quot;
                    no seu perfil.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <strong className="block text-text-primary">Correção de Dados</strong>
                  <p className="mt-1 text-xs text-text-secondary">
                    Atualize nome, telefone e foto diretamente na área logada do sistema a qualquer instante.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <strong className="block text-text-primary">Revogação do Consentimento</strong>
                  <p className="mt-1 text-xs text-text-secondary">
                    Altere ou retire o consentimento para cookies e tecnologias não essenciais sempre que desejar.
                  </p>
                </div>
              </div>
            </section>

            {/* Secao 6 */}
            <section className="border-t border-border pt-6">
              <h2 className="text-base font-semibold text-text-primary">6. Contato com o Encarregado de Proteção de Dados (DPO)</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Caso tenha dúvidas sobre como seus dados são tratados ou queira exercer quaisquer dos direitos garantidos
                pela LGPD, entre em contato através do e-mail{" "}
                <span className="font-semibold text-text-primary">[contato@lukaobarber7.com.br]</span> ou fale diretamente
                com a equipe da barbearia pelo WhatsApp oficial disponibilizado na página inicial.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
