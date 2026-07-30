import { env } from "../config/env.js";
import { logger } from "../utils/logger.js";

// Layout base responsivo reutilizado por todos os e-mails.
function layout({ title, body }) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title></head>
<body style="margin:0;background:#f8f6f1;font-family:Arial,Helvetica,sans-serif;color:#151515">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:24px 0">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 16px 48px rgba(21,21,21,.08)">
        <tr><td style="background:#151515;padding:20px 28px;color:#c79a3b;font-size:18px;font-weight:bold">Barbearia Prime</td></tr>
        <tr><td style="padding:28px">${body}</td></tr>
        <tr><td style="padding:18px 28px;background:#faf9f6;color:#6b7280;font-size:12px">Este e-mail foi enviado automaticamente. Em caso de duvida, fale com a barbearia.</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function button(href, label) {
  return `<a href="${href}" style="display:inline-block;background:#151515;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:12px;font-weight:bold">${label}</a>`;
}

export const emailTemplates = {
  welcome({ name }) {
    return {
      subject: "Bem-vindo a Barbearia Prime",
      html: layout({
        title: "Bem-vindo",
        body: `<h1 style="font-size:20px;margin:0 0 12px">Ola, ${name}!</h1>
          <p style="line-height:1.6;color:#374151">Sua conta foi criada com sucesso. Agora voce pode agendar mais rapido, acompanhar seu historico e avaliar seus atendimentos.</p>`
      })
    };
  },
  passwordReset({ name, resetUrl }) {
    return {
      subject: "Recuperacao de senha",
      html: layout({
        title: "Recuperar senha",
        body: `<h1 style="font-size:20px;margin:0 0 12px">Ola, ${name}</h1>
          <p style="line-height:1.6;color:#374151">Recebemos um pedido para redefinir sua senha. Clique no botao abaixo para criar uma nova. O link expira em ${env.passwordResetExpiresMinutes} minutos.</p>
          <p style="margin:22px 0">${button(resetUrl, "Redefinir senha")}</p>
          <p style="line-height:1.6;color:#6b7280;font-size:13px">Se voce nao pediu isso, ignore este e-mail.</p>`
      })
    };
  },
  appointmentConfirmed({ name, serviceNames, professionalName, when }) {
    return {
      subject: "Agendamento confirmado",
      html: layout({
        title: "Agendamento confirmado",
        body: `<h1 style="font-size:20px;margin:0 0 12px">Tudo certo, ${name}!</h1>
          <p style="line-height:1.6;color:#374151">Seu agendamento foi registrado com sucesso:</p>
          <ul style="line-height:1.8;color:#374151">
            <li><strong>Servicos:</strong> ${serviceNames}</li>
            <li><strong>Profissional:</strong> ${professionalName}</li>
            <li><strong>Quando:</strong> ${when}</li>
          </ul>
          <p style="line-height:1.6;color:#6b7280;font-size:13px">Se precisar remarcar ou cancelar, acesse sua conta.</p>`
      })
    };
  },
  appointmentCanceled({ name, serviceNames, when, reason }) {
    return {
      subject: "Agendamento cancelado",
      html: layout({
        title: "Agendamento cancelado",
        body: `<h1 style="font-size:20px;margin:0 0 12px">Ola, ${name}</h1>
          <p style="line-height:1.6;color:#374151">Seu agendamento de <strong>${serviceNames}</strong> em ${when} foi cancelado.${reason ? ` Motivo: ${reason}.` : ""}</p>
          <p style="line-height:1.6;color:#374151">Esperamos ver voce em breve. Voce pode agendar um novo horario quando quiser.</p>`
      })
    };
  },
  reviewRequest({ name, serviceNames }) {
    return {
      subject: "Como foi seu atendimento?",
      html: layout({
        title: "Avalie seu atendimento",
        body: `<h1 style="font-size:20px;margin:0 0 12px">Ola, ${name}</h1>
          <p style="line-height:1.6;color:#374151">Que tal contar como foi seu atendimento de <strong>${serviceNames}</strong>? Sua opiniao ajuda muito.</p>`
      })
    };
  }
};

// Transporte abstrato. Em dev (EMAIL_TRANSPORT=log) apenas registra; troque por provedor real depois.
async function deliver({ to, subject, html }) {
  if (env.emailTransport === "log") {
    logger.info("email_stub", { to, subject, from: env.emailFrom, bytes: html.length });
    return { delivered: false, transport: "log" };
  }
  // Ponto de extensao: integrar Resend/SendGrid/SMTP aqui quando houver credenciais.
  logger.warn("email_transport_unconfigured", { transport: env.emailTransport, to, subject });
  return { delivered: false, transport: env.emailTransport };
}

export const emailService = {
  async send(to, template) {
    return deliver({ to, subject: template.subject, html: template.html });
  }
};
