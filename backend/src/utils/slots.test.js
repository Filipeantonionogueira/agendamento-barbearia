import { describe, it, expect } from "vitest";
import { computeAvailableSlots } from "./slots.js";

const base = {
  dateString: "2026-08-10",
  openTime: "09:00",
  closeTime: "12:00",
  totalMinutes: 60,
  slotInterval: 60,
  // "Agora" fixo no dia anterior: mantem os testes deterministicos ao longo do tempo.
  now: new Date("2026-08-09T12:00:00.000")
};

describe("computeAvailableSlots", () => {
  it("gera horarios dentro da janela de funcionamento", () => {
    expect(computeAvailableSlots(base)).toEqual(["09:00", "10:00", "11:00"]);
  });

  it("nao gera horario cujo termino ultrapassa o fechamento", () => {
    // Servico de 90min numa janela 09:00-12:00 so cabe as 09:00 e 10:00 (termina 11:30).
    expect(computeAvailableSlots({ ...base, totalMinutes: 90, slotInterval: 60 })).toEqual(["09:00", "10:00"]);
  });

  it("remove horarios que colidem com agendamento existente", () => {
    const appointments = [
      { startAt: new Date("2026-08-10T10:00:00.000"), endAt: new Date("2026-08-10T11:00:00.000") }
    ];
    expect(computeAvailableSlots({ ...base, appointments })).toEqual(["09:00", "11:00"]);
  });

  it("considera sobreposicao parcial como conflito", () => {
    // Agendamento 10:30-11:00 invade o slot das 10:00 (10:00-11:00).
    const appointments = [
      { startAt: new Date("2026-08-10T10:30:00.000"), endAt: new Date("2026-08-10T11:00:00.000") }
    ];
    expect(computeAvailableSlots({ ...base, appointments })).not.toContain("10:00");
  });

  it("bloqueio sem horario remove o dia inteiro", () => {
    const blocks = [{ startTime: null, endTime: null }];
    expect(computeAvailableSlots({ ...base, blocks })).toEqual([]);
  });

  it("bloqueio parcial remove apenas os horarios afetados", () => {
    const blocks = [{ startTime: "10:00", endTime: "11:00" }];
    expect(computeAvailableSlots({ ...base, blocks })).toEqual(["09:00", "11:00"]);
  });

  it("usa intervalo padrao de 45min quando o valor e invalido", () => {
    const slots = computeAvailableSlots({ ...base, slotInterval: 0, totalMinutes: 30 });
    expect(slots[0]).toBe("09:00");
    expect(slots[1]).toBe("09:45");
  });

  it("retorna vazio quando a duracao nao cabe na janela", () => {
    expect(computeAvailableSlots({ ...base, totalMinutes: 240 })).toEqual([]);
  });
});

describe("nao permite agendar no passado", () => {
  it("esconde horarios que ja passaram no dia de hoje", () => {
    // Sao 10:30 do proprio dia: 09:00 e 10:00 ja passaram.
    const slots = computeAvailableSlots({ ...base, now: new Date("2026-08-10T10:30:00.000") });
    expect(slots).toEqual(["11:00"]);
  });

  it("esconde o horario que comeca exatamente agora", () => {
    const slots = computeAvailableSlots({ ...base, now: new Date("2026-08-10T10:00:00.000") });
    expect(slots).not.toContain("10:00");
    expect(slots).toEqual(["11:00"]);
  });

  it("retorna vazio para uma data que ja passou", () => {
    const slots = computeAvailableSlots({ ...base, now: new Date("2026-08-11T08:00:00.000") });
    expect(slots).toEqual([]);
  });

  it("mantem todos os horarios para datas futuras", () => {
    const slots = computeAvailableSlots({ ...base, now: new Date("2026-08-01T00:00:00.000") });
    expect(slots).toEqual(["09:00", "10:00", "11:00"]);
  });

  it("respeita a antecedencia minima configurada", () => {
    // 08:30 + 45min de antecedencia => 09:00 fica indisponivel (comeca em 30min).
    const slots = computeAvailableSlots({
      ...base,
      now: new Date("2026-08-10T08:30:00.000"),
      minimumNoticeMinutes: 45
    });
    expect(slots).toEqual(["10:00", "11:00"]);
  });
});
