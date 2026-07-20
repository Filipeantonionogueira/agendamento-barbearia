import { describe, it, expect } from "vitest";
import { minutesFromTime, timeFromMinutes, dateOnly, combineDateTime, addMinutes, rangesOverlap } from "./time.js";

describe("conversao de horario", () => {
  it("converte HH:MM em minutos", () => {
    expect(minutesFromTime("00:00")).toBe(0);
    expect(minutesFromTime("09:30")).toBe(570);
    expect(minutesFromTime("23:59")).toBe(1439);
  });

  it("converte minutos em HH:MM com zero a esquerda", () => {
    expect(timeFromMinutes(0)).toBe("00:00");
    expect(timeFromMinutes(570)).toBe("09:30");
    expect(timeFromMinutes(1439)).toBe("23:59");
  });

  it("ida e volta preserva o valor", () => {
    for (const time of ["07:05", "12:00", "18:45"]) {
      expect(timeFromMinutes(minutesFromTime(time))).toBe(time);
    }
  });
});

describe("dateOnly", () => {
  it("retorna data a meia-noite local", () => {
    const date = dateOnly("2026-08-10");
    expect(date.getHours()).toBe(0);
    expect(date.getDate()).toBe(10);
  });

  it("retorna null para data invalida", () => {
    expect(dateOnly("data-invalida")).toBeNull();
  });
});

describe("combineDateTime e addMinutes", () => {
  it("combina data e hora", () => {
    const date = combineDateTime("2026-08-10", "14:30");
    expect(date.getHours()).toBe(14);
    expect(date.getMinutes()).toBe(30);
  });

  it("soma minutos corretamente", () => {
    const start = combineDateTime("2026-08-10", "23:30");
    const end = addMinutes(start, 60);
    expect(end.getHours()).toBe(0);
    expect(end.getDate()).toBe(11); // virou o dia
  });
});

describe("rangesOverlap", () => {
  it("detecta sobreposicao parcial", () => {
    expect(rangesOverlap(10, 20, 15, 25)).toBe(true);
    expect(rangesOverlap(15, 25, 10, 20)).toBe(true);
  });

  it("detecta contencao total", () => {
    expect(rangesOverlap(10, 30, 15, 20)).toBe(true);
  });

  it("intervalos adjacentes nao se sobrepoem", () => {
    // Fim de um exatamente no inicio do outro: horario livre para o proximo cliente.
    expect(rangesOverlap(10, 20, 20, 30)).toBe(false);
    expect(rangesOverlap(20, 30, 10, 20)).toBe(false);
  });

  it("intervalos distantes nao se sobrepoem", () => {
    expect(rangesOverlap(10, 15, 20, 25)).toBe(false);
  });
});
