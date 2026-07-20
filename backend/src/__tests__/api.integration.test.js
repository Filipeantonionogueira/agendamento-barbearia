import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../app.js";
import { prisma } from "../config/prisma.js";

/**
 * Testes de integracao: exercitam rota -> middleware -> service -> banco real.
 * Cada teste cria seus proprios dados e limpa tudo no final.
 */

const ORIGIN = "http://localhost:5173";
const OWNER = { email: "admin@barbearia.local", password: "admin123" };
const TEST_EMAIL = `integracao_${Date.now()}@teste-integracao.local`;

let serviceId;
let professionalId;
let futureDate;

/** Extrai os cookies de sessao da resposta de login. */
function cookiesFrom(response) {
  return response.headers["set-cookie"] || [];
}

beforeAll(async () => {
  const services = await prisma.service.findMany({ where: { active: true }, take: 1 });
  const professionals = await prisma.professional.findMany({ where: { active: true }, take: 1 });
  serviceId = services[0]?.id;
  professionalId = professionals[0]?.id;

  const date = new Date();
  date.setDate(date.getDate() + 21); // bem no futuro, evita colidir com dados existentes
  futureDate = date.toISOString().slice(0, 10);
});

afterAll(async () => {
  // Remove tudo que os testes criaram.
  const users = await prisma.user.findMany({ where: { email: { contains: "@teste-integracao.local" } }, include: { client: true } });
  for (const user of users) {
    if (user.client) {
      const appointments = await prisma.appointment.findMany({ where: { clientId: user.client.id } });
      for (const appointment of appointments) {
        await prisma.appointmentService.deleteMany({ where: { appointmentId: appointment.id } });
        await prisma.appointment.delete({ where: { id: appointment.id } });
      }
      await prisma.client.delete({ where: { id: user.client.id } });
    }
    await prisma.notification.deleteMany({ where: { userId: user.id } });
    await prisma.loyaltyTransaction.deleteMany({ where: { userId: user.id } });
    await prisma.userRole.deleteMany({ where: { userId: user.id } });
    await prisma.refreshToken.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
  }
  const leftovers = await prisma.client.findMany({ where: { name: { startsWith: "Integracao" }, userId: null } });
  for (const client of leftovers) {
    const appointments = await prisma.appointment.findMany({ where: { clientId: client.id } });
    for (const appointment of appointments) {
      await prisma.appointmentService.deleteMany({ where: { appointmentId: appointment.id } });
      await prisma.appointment.delete({ where: { id: appointment.id } });
    }
    await prisma.client.delete({ where: { id: client.id } });
  }
  await prisma.$disconnect();
});

describe("health", () => {
  it("liveness responde ok", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body.status).toBe("ok");
  });

  it("readiness confirma que o banco esta acessivel", async () => {
    const response = await request(app).get("/api/health/ready");
    expect(response.status).toBe(200);
    expect(response.body.checks.database.status).toBe("up");
  });
});

describe("seguranca das rotas", () => {
  it("bloqueia rota administrativa sem autenticacao", async () => {
    const response = await request(app).get("/api/agendamentos").set("Origin", ORIGIN);
    expect(response.status).toBe(401);
  });

  it("bloqueia mutacao vinda de origem nao permitida", async () => {
    const response = await request(app).post("/api/auth/login").set("Origin", "https://evil.com").send({});
    expect(response.status).toBe(403);
  });

  it("cliente autenticado nao acessa area administrativa", async () => {
    const registro = await request(app)
      .post("/api/auth/register")
      .set("Origin", ORIGIN)
      .send({ name: "Integracao Cliente", email: TEST_EMAIL, password: "senha123" });
    expect(registro.status).toBe(201);

    const response = await request(app).get("/api/agendamentos").set("Origin", ORIGIN).set("Cookie", cookiesFrom(registro));
    expect(response.status).toBe(403); // autenticado, mas sem papel de staff
  });
});

describe("fluxo de agendamento", () => {
  it("nao permite agendar em horario que ja passou", async () => {
    const response = await request(app)
      .post("/api/agendamentos")
      .set("Origin", ORIGIN)
      .send({
        clientName: "Integracao Passado",
        date: "2020-01-01",
        time: "10:00",
        serviceIds: [serviceId],
        professionalId
      });
    expect(response.status).toBe(409);
  });

  it("cria agendamento e recusa o mesmo horario em seguida", async () => {
    const disponibilidade = await request(app)
      .get(`/api/disponibilidade?date=${futureDate}&serviceIds=${serviceId}&professionalId=${professionalId}`)
      .set("Origin", ORIGIN);
    expect(disponibilidade.status).toBe(200);
    const slot = disponibilidade.body.slots[0];
    expect(slot).toBeTruthy();

    const criado = await request(app)
      .post("/api/agendamentos")
      .set("Origin", ORIGIN)
      .send({ clientName: "Integracao Cliente", date: futureDate, time: slot, serviceIds: [serviceId], professionalId });
    expect(criado.status).toBe(201);

    // Mesmo horario, mesmo profissional: deve dar conflito.
    const duplicado = await request(app)
      .post("/api/agendamentos")
      .set("Origin", ORIGIN)
      .send({ clientName: "Integracao Outro", date: futureDate, time: slot, serviceIds: [serviceId], professionalId });
    expect(duplicado.status).toBe(409);

    // O horario deixa de aparecer como livre.
    const depois = await request(app)
      .get(`/api/disponibilidade?date=${futureDate}&serviceIds=${serviceId}&professionalId=${professionalId}`)
      .set("Origin", ORIGIN);
    expect(depois.body.slots).not.toContain(slot);
  });

  it("rejeita dados invalidos", async () => {
    const response = await request(app)
      .post("/api/agendamentos")
      .set("Origin", ORIGIN)
      .send({ clientName: "x", date: "data-errada", time: "99:99", serviceIds: [], professionalId: "nao-e-uuid" });
    expect(response.status).toBe(400);
  });
});

describe("autenticacao", () => {
  it("recusa senha incorreta", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .set("Origin", ORIGIN)
      .send({ email: OWNER.email, password: "senha-errada" });
    expect(response.status).toBe(401);
  });

  it("owner faz login e acessa a agenda", async () => {
    const login = await request(app).post("/api/auth/login").set("Origin", ORIGIN).send(OWNER);
    expect(login.status).toBe(200);
    expect(login.body.user.roles).toContain("OWNER");

    const agenda = await request(app).get("/api/agendamentos").set("Origin", ORIGIN).set("Cookie", cookiesFrom(login));
    expect(agenda.status).toBe(200);
    expect(Array.isArray(agenda.body)).toBe(true);
  });

  it("nao revela se um e-mail existe na recuperacao de senha", async () => {
    const existente = await request(app).post("/api/auth/forgot-password").set("Origin", ORIGIN).send({ email: OWNER.email });
    const inexistente = await request(app)
      .post("/api/auth/forgot-password")
      .set("Origin", ORIGIN)
      .send({ email: "nao-existe@teste-integracao.local" });
    expect(existente.status).toBe(inexistente.status);
    expect(existente.body).toEqual(inexistente.body);
  });
});

describe("catalogo publico", () => {
  it("lista servicos ativos", async () => {
    const response = await request(app).get("/api/servicos").set("Origin", ORIGIN);
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("lista profissionais ativos", async () => {
    const response = await request(app).get("/api/profissionais").set("Origin", ORIGIN);
    expect(response.status).toBe(200);
    expect(response.body.length).toBeGreaterThan(0);
  });
});
