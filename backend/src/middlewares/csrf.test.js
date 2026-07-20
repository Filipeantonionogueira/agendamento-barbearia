import { describe, it, expect, vi } from "vitest";
import { csrfGuard } from "./csrf.js";

// Origens permitidas vem do env (default de desenvolvimento: localhost:5173 / 127.0.0.1:5173).
function run({ method = "POST", origin, referer }) {
  const req = { method, headers: {} };
  if (origin) req.headers.origin = origin;
  if (referer) req.headers.referer = referer;
  const next = vi.fn();
  let thrown = null;
  try {
    csrfGuard(req, {}, next);
  } catch (error) {
    thrown = error;
  }
  return { next, thrown };
}

describe("csrfGuard", () => {
  it("libera metodos de leitura mesmo com origem estranha", () => {
    const { next, thrown } = run({ method: "GET", origin: "https://evil.com" });
    expect(thrown).toBeNull();
    expect(next).toHaveBeenCalled();
  });

  it("bloqueia mutacao vinda de origem nao permitida", () => {
    const { next, thrown } = run({ origin: "https://evil.com" });
    expect(next).not.toHaveBeenCalled();
    expect(thrown?.statusCode).toBe(403);
  });

  it("permite mutacao da origem confiavel", () => {
    const { next, thrown } = run({ origin: "http://localhost:5173" });
    expect(thrown).toBeNull();
    expect(next).toHaveBeenCalled();
  });

  it("cai para o Referer quando nao ha Origin", () => {
    expect(run({ referer: "https://evil.com/pagina" }).thrown?.statusCode).toBe(403);
    expect(run({ referer: "http://localhost:5173/agendar" }).thrown).toBeNull();
  });

  it("permite requisicao sem Origin nem Referer (cliente nao-browser)", () => {
    const { next, thrown } = run({});
    expect(thrown).toBeNull();
    expect(next).toHaveBeenCalled();
  });

  it("bloqueia Origin malformado", () => {
    expect(run({ origin: "nao-e-url" }).thrown?.statusCode).toBe(403);
  });

  it("bloqueia todos os verbos de mutacao vindos de origem hostil", () => {
    for (const method of ["POST", "PUT", "PATCH", "DELETE"]) {
      expect(run({ method, origin: "https://evil.com" }).thrown?.statusCode).toBe(403);
    }
  });
});
