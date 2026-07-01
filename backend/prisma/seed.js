import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const services = [
  ["Corte de cabelo", "Corte alinhado no estilo do cliente.", 6000, 60],
  ["Barba", "Modelagem, toalha quente e acabamento.", 3500, 20],
  ["Sobrancelha", "Design rapido para finalizar o visual.", 2000, 15],
  ["Luzes / Mechas", "Clareamento com acabamento profissional.", 14000, 90],
  ["Alisamento / Escova", "Finalizacao completa para cabelo alinhado.", 12000, 90],
  ["Hidratacao", "Tratamento para brilho e recuperacao.", 5000, 30],
  ["Limpeza de pele", "Cuidado facial rapido e eficiente.", 7000, 40],
  ["Pigmentacao de barba", "Correcao visual e preenchimento da barba.", 5500, 30]
];

async function main() {
  const barber = await prisma.barber.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {},
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      shopName: "Barbearia Prime",
      whatsappNumber: "5511999999999"
    }
  });

  await prisma.admin.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      passwordHash: await bcrypt.hash("admin123", 12),
      barberId: barber.id
    }
  });

  for (const [name, description, priceCents, estimatedMinutes] of services) {
    const existing = await prisma.service.findFirst({ where: { barberId: barber.id, name } });
    if (!existing) {
      await prisma.service.create({ data: { barberId: barber.id, name, description, priceCents, estimatedMinutes } });
    }
  }

  for (const dayOfWeek of [1, 2, 3, 4, 5, 6]) {
    await prisma.availability.upsert({
      where: { barberId_dayOfWeek: { barberId: barber.id, dayOfWeek } },
      update: {},
      create: { barberId: barber.id, dayOfWeek, startTime: "09:00", endTime: "19:00", active: true }
    });
  }
}

main().finally(() => prisma.$disconnect());
