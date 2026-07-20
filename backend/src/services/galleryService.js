import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { barberRepository } from "../repositories/barberRepository.js";
import { AppError } from "../utils/AppError.js";

const upsertSchema = z.object({
  url: z.string().trim().min(1).max(500),
  title: z.string().trim().max(120).optional().nullable(),
  category: z.string().trim().min(1).max(40).default("GERAL"),
  displayOrder: z.number().int().min(0).optional(),
  active: z.boolean().optional()
});

export const galleryService = {
  // Publico: apenas itens ativos, na ordem definida pelo dono.
  listPublic() {
    return prisma.galleryItem.findMany({
      where: { barberId: barberRepository.defaultId, active: true },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }]
    });
  },

  listAll() {
    return prisma.galleryItem.findMany({
      where: { barberId: barberRepository.defaultId },
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }]
    });
  },

  create(input) {
    const data = upsertSchema.parse(input);
    return prisma.galleryItem.create({
      data: {
        barberId: barberRepository.defaultId,
        url: data.url,
        title: data.title || null,
        category: data.category.toUpperCase(),
        displayOrder: data.displayOrder ?? 0,
        active: data.active ?? true
      }
    });
  },

  async update(id, input) {
    const existing = await prisma.galleryItem.findFirst({ where: { id, barberId: barberRepository.defaultId } });
    if (!existing) throw new AppError("Item da galeria nao encontrado.", 404);
    const data = upsertSchema.partial().parse(input);
    if (data.category) data.category = data.category.toUpperCase();
    return prisma.galleryItem.update({ where: { id }, data });
  },

  async remove(id) {
    const existing = await prisma.galleryItem.findFirst({ where: { id, barberId: barberRepository.defaultId } });
    if (!existing) throw new AppError("Item da galeria nao encontrado.", 404);
    await prisma.galleryItem.delete({ where: { id } });
    return { ok: true };
  }
};
