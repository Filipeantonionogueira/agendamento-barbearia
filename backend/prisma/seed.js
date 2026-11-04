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
    update: {
      shopName: "Lukaobarber7"
    },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      shopName: "Lukaobarber7",
      whatsappNumber: "5511999999999",
      aboutText: "Na Lukaobarber7, combinamos tecnicas classicas de barbearia com as tendencias mais modernas do visual masculino. Ambiente climatizado, toalha quente, navalha afiada e profissionais dedicados a elevar sua autoestima.",
      heroImageUrl: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&w=1200&q=80"
    }
  });

  // Mantido por compatibilidade historica; a autenticacao agora usa User.
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

  let professional = await prisma.professional.findFirst({ where: { barberId: barber.id }, orderBy: { createdAt: "asc" } });
  if (!professional) {
    professional = await prisma.professional.create({
      data: { barberId: barber.id, name: barber.shopName, active: true, displayOrder: 0 }
    });
  }

  // Usuario Owner (login: admin@local / admin123) com papeis acumulativos, atuando como barbeiro.
  const ownerUser = await prisma.user.upsert({
    where: { email: "admin@barbearia.local" },
    update: {},
    create: {
      barberId: barber.id,
      email: "admin@barbearia.local",
      passwordHash: await bcrypt.hash("admin123", 12),
      name: "Administrador",
      authProvider: "local"
    }
  });
  for (const role of ["OWNER", "ADMIN", "BARBER"]) {
    await prisma.userRole.upsert({
      where: { userId_role: { userId: ownerUser.id, role } },
      update: {},
      create: { userId: ownerUser.id, role }
    });
  }
  if (!professional.userId) {
    await prisma.professional.update({ where: { id: professional.id }, data: { userId: ownerUser.id } });
  }

  for (const dayOfWeek of [1, 2, 3, 4, 5, 6]) {
    await prisma.availability.upsert({
      where: { professionalId_dayOfWeek: { professionalId: professional.id, dayOfWeek } },
      update: {},
      create: { professionalId: professional.id, dayOfWeek, startTime: "09:00", endTime: "19:00", active: true }
    });
  }
}

main().finally(() => prisma.$disconnect());
