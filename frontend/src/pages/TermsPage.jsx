import React from "react";
import { Link } from "react-router-dom";
import { FileText, CalendarCheck, Clock, AlertCircle, ArrowLeft, Scissors } from "lucide-react";
import { usePageMeta } from "../hooks/usePageMeta.js";

export function TermsPage() {
  usePageMeta({
    title: "Termos de Uso",
    description: "Conheça os Termos de Uso e as regras de agendamento, atendimento e cancelamento da Lukaobarber7."
  });

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
            <span className="grid h-8 w-8 place-items-center rounded-md bg-gold text-ink">
              <Scissors size={18} />
            </span>
            <span className="font-display font-semibold text-text-primary">Lukaobarber7</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-10 md:py-14">
        <div className="rounded-xl border border-border bg-surface p-6 sm:p-10 shadow-sm">
          <div className="border-b border-border pb-6">
            <span className="inline-flex items-center gap-2 rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-gold-600 dark:text-gold-400">
              Regras do Serviço
            </span>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-text-primary sm:text-3xl">
              Termos de Uso e Condições de Agendamento
            </h1>
            <p className="mt-2 text-sm text-text-secondary">
              Última atualização: 07 de novembro de 2026 • Versão 1.0
            </p>
          </div>

          <div className="mt-8 space-y-8 text-sm leading-relaxed text-text-secondary sm:text-base">
            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary sm:text-xl">
                <FileText size={20} className="text-gold" /> 1. Objeto e Aceitação
              </h2>
              <p className="mt-3">
                Ao acessar e utilizar o site e sistema de agendamento online da <strong>Lukaobarber7</strong>, você
                concorda integralmente com os presentes Termos de Uso e com a nossa{" "}
                <Link to="/privacidade" className="font-semibold text-gold-600 underline hover:text-gold dark:text-gold-400">
                  Política de Privacidade
                </Link>
                . Caso não concorde com qualquer disposição aqui estabelecida, solicitamos que não utilize os serviços.
              </p>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary sm:text-xl">
                <CalendarCheck size={20} className="text-gold" /> 2. Funcionamento do Agendamento Online
              </h2>
              <p className="mt-3">
                O agendamento online permite escolher o serviço desejado, o profissional de preferência, a data e o
                horário disponível:
              </p>
              <ul className="mt-2 list-disc pl-5 space-y-2">
                <li>
                  <strong>Status Inicial (Pendente):</strong> A solicitação enviada pelo cliente inicia com o status{" "}
                  <strong>Pendente</strong>, garantindo a reserva provisória do horário.
                </li>
                <li>
                  <strong>Confirmação (Agendado):</strong> O agendamento é validado e aprovado pelo profissional
                  responsável ou administrador da barbearia, momento em que passa ao status <strong>Agendado</strong>.
                </li>
                <li>
                  <strong>Canal de WhatsApp:</strong> O sistema gera um link de WhatsApp opcional para contato direto e
                  agilização de dúvidas; entretanto, a confirmação operacional é gerenciada internamente pelo sistema da barbearia.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary sm:text-xl">
                <Clock size={20} className="text-gold" /> 3. Pontualidade, Cancelamentos e Remarcações
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-4">
                  <strong className="block text-text-primary">Tolerância de Atraso</strong>
                  <p className="mt-1 text-xs text-text-secondary">
                    Para respeitar os horários dos demais clientes, toleramos um atraso máximo de{" "}
                    <strong>10 minutos</strong>. Atrasos superiores poderão acarretar o cancelamento da reserva ou
                    adaptação do serviço ao tempo restante.
                  </p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <strong className="block text-text-primary">Cancelamento sem Custo</strong>
                  <p className="mt-1 text-xs text-text-secondary">
                    O cliente cadastrado pode cancelar gratuitamente seu agendamento através do painel da conta ou
                    avisando a barbearia pelo WhatsApp com no mínimo <strong>2 horas de antecedência</strong>.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary sm:text-xl">
                <AlertCircle size={20} className="text-gold" /> 4. Pagamentos e Valores
              </h2>
              <p className="mt-3">
                Os valores apresentados na plataforma são transparentes e correspondem aos preços vigentes na data do
                agendamento.
              </p>
              <div className="mt-3 rounded-lg border border-border bg-surface-subtle p-4 text-xs sm:text-sm">
                <strong>Forma de Pagamento:</strong> O pagamento é realizado <strong>presencialmente na barbearia</strong>,
                no momento do atendimento, aceitando dinheiro, cartões de débito/crédito e PIX. Não solicitamos dados de
                cartão de crédito através do site.
              </div>
            </section>

            <section>
              <h2 className="flex items-center gap-2 text-lg font-semibold text-text-primary sm:text-xl">
                <Scissors size={20} className="text-gold" /> 5. Responsabilidades do Usuário
              </h2>
              <p className="mt-3">O usuário compromete-se a:</p>
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Fornecer informações cadastrais corretas e verídicas (especialmente nome e telefone para contato).</li>
                <li>Manter a confidencialidade de sua senha de acesso.</li>
                <li>Não utilizar o sistema de agendamento de má-fé para bloquear horários deliberadamente.</li>
              </ul>
            </section>

            <section className="border-t border-border pt-6">
              <h2 className="text-base font-semibold text-text-primary">6. Foro e Legislação Aplicável</h2>
              <p className="mt-2 text-sm text-text-secondary">
                Estes Termos são regidos pelas leis da República Federativa do Brasil, em especial o Código de Defesa do
                Consumidor e o Marco Civil da Internet. Fica eleito o foro da comarca da barbearia para dirimir eventuais
                controvérsias oriundas do presente instrumento.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
