// Niveis de fidelidade e regras de pontuacao.
// Pontos sao acumulados por atendimento concluido: 1 ponto a cada R$1 gasto.
export const POINTS_PER_BRL = 1;

export const LOYALTY_TIERS = [
  { key: "BRONZE", label: "Bronze", minPoints: 0, benefit: "Acesso ao programa de fidelidade." },
  { key: "PRATA", label: "Prata", minPoints: 150, benefit: "5% de desconto em servicos avulsos." },
  { key: "OURO", label: "Ouro", minPoints: 400, benefit: "10% de desconto e prioridade na agenda." },
  { key: "BLACK", label: "Black", minPoints: 900, benefit: "15% de desconto, brinde mensal e horarios exclusivos." }
];

export function pointsForAppointment(totalPriceCents) {
  return Math.max(1, Math.round((totalPriceCents / 100) * POINTS_PER_BRL));
}

export function resolveTier(lifetimePoints) {
  let current = LOYALTY_TIERS[0];
  for (const tier of LOYALTY_TIERS) {
    if (lifetimePoints >= tier.minPoints) current = tier;
  }
  const next = LOYALTY_TIERS.find((tier) => tier.minPoints > lifetimePoints) || null;
  const floor = current.minPoints;
  const ceil = next ? next.minPoints : current.minPoints;
  const progress = next ? Math.min(100, Math.round(((lifetimePoints - floor) / (ceil - floor)) * 100)) : 100;
  return {
    current,
    next,
    pointsToNext: next ? next.minPoints - lifetimePoints : 0,
    progress
  };
}
