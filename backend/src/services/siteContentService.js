import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { barberRepository } from "../repositories/barberRepository.js";

/**
 * CMS da landing page.
 *
 * Todo o conteudo editavel vive num unico JSON versionado (`SiteContent.data`).
 * Assim o administrador pode reordenar secoes, trocar textos e adicionar itens
 * de FAQ/Instagram sem exigir migracao de banco a cada campo novo.
 */

// Secoes que a landing sabe renderizar. A ordem/visibilidade e definida pelo admin.
export const SECTION_KEYS = ["agendamento", "sobre", "servicos", "profissionais", "galeria", "depoimentos", "instagram", "faq", "localizacao"];

const linkSchema = z.object({
  label: z.string().trim().max(60).default(""),
  url: z.string().trim().max(400).default("")
});

const statSchema = z.object({
  value: z.string().trim().max(12).default(""),
  label: z.string().trim().max(40).default("")
});

const faqSchema = z.object({
  question: z.string().trim().max(180).default(""),
  answer: z.string().trim().max(1200).default("")
});

const instagramSchema = z.object({
  imageUrl: z.string().trim().max(600).default(""),
  link: z.string().trim().max(600).default(""),
  caption: z.string().trim().max(160).default("")
});

const sectionSchema = z.object({
  key: z.enum(SECTION_KEYS),
  enabled: z.boolean().default(true),
  title: z.string().trim().max(120).default(""),
  subtitle: z.string().trim().max(240).default("")
});

const contentSchema = z.object({
  brand: z
    .object({
      logoUrl: z.string().trim().max(600).default(""),
      tagline: z.string().trim().max(120).default("")
    })
    .default({}),
  hero: z
    .object({
      eyebrow: z.string().trim().max(60).default(""),
      title: z.string().trim().max(160).default(""),
      subtitle: z.string().trim().max(320).default(""),
      backgroundUrl: z.string().trim().max(600).default(""),
      videoUrl: z.string().trim().max(600).default(""),
      overlayOpacity: z.number().min(0).max(100).default(70),
      primaryCta: linkSchema.default({}),
      secondaryCta: linkSchema.default({}),
      stats: z.array(statSchema).max(4).default([])
    })
    .default({}),
  instagram: z
    .object({
      handle: z.string().trim().max(60).default(""),
      profileUrl: z.string().trim().max(400).default(""),
      posts: z.array(instagramSchema).max(12).default([])
    })
    .default({}),
  faq: z.array(faqSchema).max(20).default([]),
  socials: z
    .object({
      instagram: z.string().trim().max(400).default(""),
      facebook: z.string().trim().max(400).default(""),
      tiktok: z.string().trim().max(400).default(""),
      youtube: z.string().trim().max(400).default("")
    })
    .default({}),
  contact: z
    .object({
      email: z.string().trim().max(160).default(""),
      phone: z.string().trim().max(40).default(""),
      mapEmbedUrl: z.string().trim().max(800).default("")
    })
    .default({}),
  footer: z
    .object({
      note: z.string().trim().max(300).default(""),
      legal: z.string().trim().max(200).default("")
    })
    .default({}),
  sections: z.array(sectionSchema).max(SECTION_KEYS.length).default([])
});

// Conteudo inicial: textos neutros, sem lista de comodidades (varia por barbearia).
export const DEFAULT_CONTENT = contentSchema.parse({
  brand: { logoUrl: "", tagline: "Lukaobarber7" },
  hero: {
    eyebrow: "Lukaobarber7",
    title: "Corte impecavel, hora marcada.",
    subtitle: "Escolha o servico, o profissional e o melhor horario. Confirmacao na hora.",
    backgroundUrl: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1920&q=80",
    videoUrl: "",
    overlayOpacity: 72,
    primaryCta: { label: "Agendar agora", url: "#agendamento" },
    secondaryCta: { label: "Ver servicos", url: "#servicos" },
    stats: [
      { value: "4.9", label: "Nota media" },
      { value: "2min", label: "Para agendar" },
      { value: "100%", label: "Online" }
    ]
  },
  faq: [
    { question: "Preciso criar conta para agendar?", answer: "Nao. Voce pode agendar informando apenas nome e telefone. Com conta, seus dados ficam salvos e voce acompanha o historico." },
    { question: "Posso cancelar ou remarcar?", answer: "Sim. Pela sua conta voce cancela a qualquer momento antes do horario. Para remarcar, fale com a barbearia." },
    { question: "Como funciona o pagamento?", answer: "O pagamento e feito presencialmente na barbearia, no dia do atendimento." }
  ],
  sections: [
    { key: "agendamento", enabled: true, title: "Agende seu horario", subtitle: "Quatro passos rapidos." },
    { key: "sobre", enabled: true, title: "Sobre nos", subtitle: "" },
    { key: "servicos", enabled: true, title: "O que fazemos", subtitle: "Servicos e tempo medio de cada atendimento." },
    { key: "profissionais", enabled: true, title: "Quem vai te atender", subtitle: "Conheca a equipe." },
    { key: "galeria", enabled: true, title: "Nosso trabalho", subtitle: "Cortes e acabamentos feitos aqui." },
    { key: "depoimentos", enabled: true, title: "O que dizem os clientes", subtitle: "Avaliacoes reais de quem ja passou por aqui." },
    { key: "instagram", enabled: true, title: "No Instagram", subtitle: "Acompanhe os trabalhos do dia a dia." },
    { key: "faq", enabled: true, title: "Perguntas frequentes", subtitle: "" },
    { key: "localizacao", enabled: true, title: "Onde estamos", subtitle: "" }
  ]
});

/** Garante que toda secao conhecida apareca, respeitando a ordem salva pelo admin. */
function normalizeSections(sections) {
  const saved = sections.filter((section) => SECTION_KEYS.includes(section.key));
  const missing = DEFAULT_CONTENT.sections.filter((section) => !saved.some((item) => item.key === section.key));
  return [...saved, ...missing];
}

function merge(base, override) {
  if (Array.isArray(override)) return override;
  if (override && typeof override === "object") {
    const result = { ...base };
    for (const [key, value] of Object.entries(override)) {
      result[key] = merge(base?.[key], value);
    }
    return result;
  }
  return override === undefined ? base : override;
}

export const siteContentService = {
  async get() {
    const barberId = barberRepository.defaultId;
    const row = await prisma.siteContent.findUnique({ where: { barberId } });
    if (!row) return DEFAULT_CONTENT;
    let stored = {};
    try {
      stored = JSON.parse(row.data);
    } catch {
      stored = {};
    }
    const parsed = contentSchema.parse(merge(DEFAULT_CONTENT, stored));
    return { ...parsed, sections: normalizeSections(parsed.sections) };
  },

  async update(input) {
    const barberId = barberRepository.defaultId;
    const current = await this.get();
    const next = contentSchema.parse(merge(current, input || {}));
    next.sections = normalizeSections(next.sections);
    const data = JSON.stringify(next);
    await prisma.siteContent.upsert({
      where: { barberId },
      update: { data },
      create: { barberId, data }
    });
    return next;
  }
};
