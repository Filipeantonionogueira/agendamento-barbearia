import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { authService } from "./authService.js";
import { userRepository } from "../repositories/userRepository.js";
import { barberRepository } from "../repositories/barberRepository.js";
import { prisma } from "../config/prisma.js";
import { env } from "../config/env.js";

describe("authService.googleLogin", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("throws validation error when credential is missing", async () => {
    await expect(authService.googleLogin({})).rejects.toThrow("Credencial do Google obrigatoria.");
  });

  it("throws 401 when Google tokeninfo returns non-ok", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400
    });

    await expect(authService.googleLogin({ credential: "invalid_token" })).rejects.toThrow(
      "Nao foi possivel validar as credenciais com o Google."
    );
  });

  it("throws 401 when email is not verified", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sub: "google-123",
        email: "unverified@example.com",
        email_verified: false
      })
    });

    await expect(authService.googleLogin({ credential: "dummy_token" })).rejects.toThrow(
      "O e-mail da conta Google nao esta verificado."
    );
  });

  it("throws 401 when aud does not match env.googleClientId", async () => {
    const originalAud = env.googleClientId;
    env.googleClientId = "expected-client-id";

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sub: "google-123",
        email: "test@example.com",
        email_verified: true,
        aud: "wrong-client-id"
      })
    });

    try {
      await expect(authService.googleLogin({ credential: "dummy_token" })).rejects.toThrow(
        "Token emitido para um cliente Google diferente do configurado."
      );
    } finally {
      env.googleClientId = originalAud;
    }
  });

  it("links account if user exists with matching email", async () => {
    const dummyUser = {
      id: "usr-1",
      email: "existing@example.com",
      name: "Existing User",
      active: true,
      roles: [{ role: "CLIENT" }],
      photoUrl: null
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        sub: "google-999",
        email: "existing@example.com",
        email_verified: "true",
        name: "Google Name",
        picture: "https://avatar.url"
      })
    });

    vi.spyOn(userRepository, "findByGoogleId").mockResolvedValue(null);
    vi.spyOn(userRepository, "findByEmail").mockResolvedValue(dummyUser);
    vi.spyOn(userRepository, "update").mockResolvedValue({
      ...dummyUser,
      googleId: "google-999",
      photoUrl: "https://avatar.url"
    });
    vi.spyOn(prisma.refreshToken, "create").mockResolvedValue({});

    const result = await authService.googleLogin({ credential: "valid_token" });
    expect(result).toHaveProperty("accessToken");
    expect(result).toHaveProperty("refreshToken");
    expect(result.user.email).toBe("existing@example.com");
  });
});
