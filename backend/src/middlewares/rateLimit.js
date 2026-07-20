import rateLimit from "express-rate-limit";

const commonOptions = {
  standardHeaders: true,
  legacyHeaders: false
};

// Limite geral da API. Generoso porque varios clientes podem compartilhar o mesmo IP
// (wi-fi da barbearia, NAT de operadora movel). Leituras nao contam: o que importa
// conter sao as escritas, ja limitadas pelos limitadores especificos abaixo.
export const publicLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 600,
  skip: (req) => req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS",
  message: { message: "Muitas requisicoes. Tente novamente em alguns minutos." }
});

// Leituras: teto alto apenas para conter scraping/abuso automatizado.
export const readLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  message: { message: "Muitas requisicoes. Tente novamente em alguns minutos." }
});

// Agendamentos: evita spam de reservas.
export const bookingLimiter = rateLimit({
  ...commonOptions,
  windowMs: 10 * 60 * 1000,
  limit: 8,
  message: { message: "Limite de agendamentos atingido. Aguarde alguns minutos." }
});

// Autenticacao: protege login/cadastro/reset contra brute-force e enumeracao.
export const authLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000,
  limit: 10,
  // Nao conta requisicoes bem-sucedidas: so penaliza tentativas repetidas.
  skipSuccessfulRequests: true,
  message: { message: "Muitas tentativas de autenticacao. Tente novamente mais tarde." }
});

// Recuperacao de senha: bem restrito para evitar abuso do envio de e-mail.
export const passwordResetLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000,
  limit: 5,
  message: { message: "Muitas solicitacoes de recuperacao. Tente novamente em uma hora." }
});

// Avaliacoes: evita flood de reviews.
export const reviewLimiter = rateLimit({
  ...commonOptions,
  windowMs: 60 * 60 * 1000,
  limit: 15,
  message: { message: "Muitas avaliacoes em pouco tempo. Aguarde um momento." }
});
