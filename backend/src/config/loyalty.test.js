import { describe, it, expect } from "vitest";
import { pointsForAppointment, resolveTier, LOYALTY_TIERS } from "./loyalty.js";

describe("pointsForAppointment", () => {
  it("converte 1 ponto por real gasto", () => {
    expect(pointsForAppointment(6000)).toBe(60); // R$60 -> 60 pontos
    expect(pointsForAppointment(12000)).toBe(120);
  });

  it("garante pelo menos 1 ponto em valores baixos", () => {
    expect(pointsForAppointment(0)).toBe(1);
    expect(pointsForAppointment(20)).toBe(1);
  });
});

describe("resolveTier", () => {
  it("comeca no Bronze", () => {
    const tier = resolveTier(0);
    expect(tier.current.key).toBe("BRONZE");
    expect(tier.next.key).toBe("PRATA");
  });

  it("promove ao atingir o limite do nivel", () => {
    expect(resolveTier(150).current.key).toBe("PRATA");
    expect(resolveTier(400).current.key).toBe("OURO");
    expect(resolveTier(900).current.key).toBe("BLACK");
  });

  it("calcula pontos restantes para o proximo nivel", () => {
    const tier = resolveTier(120);
    expect(tier.current.key).toBe("BRONZE");
    expect(tier.pointsToNext).toBe(30); // 150 - 120
  });

  it("no nivel maximo nao ha proximo nivel e progresso e 100%", () => {
    const tier = resolveTier(5000);
    expect(tier.current.key).toBe("BLACK");
    expect(tier.next).toBeNull();
    expect(tier.progress).toBe(100);
  });

  it("progresso fica entre 0 e 100", () => {
    for (const points of [0, 75, 149, 150, 399, 899, 10000]) {
      const { progress } = resolveTier(points);
      expect(progress).toBeGreaterThanOrEqual(0);
      expect(progress).toBeLessThanOrEqual(100);
    }
  });

  it("os niveis estao em ordem crescente de pontos", () => {
    const mins = LOYALTY_TIERS.map((t) => t.minPoints);
    expect([...mins].sort((a, b) => a - b)).toEqual(mins);
  });
});
