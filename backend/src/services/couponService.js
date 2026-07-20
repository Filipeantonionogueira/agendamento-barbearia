import { z } from "zod";
import { couponRepository } from "../repositories/couponRepository.js";
import { barberRepository } from "../repositories/barberRepository.js";
import { serviceRepository } from "../repositories/serviceRepository.js";
import { AppError } from "../utils/AppError.js";

const upsertSchema = z.object({
  code: z.string().trim().min(3).max(30),
  description: z.string().trim().max(200).optional().nullable(),
  type: z.enum(["PERCENT", "FIXED"]),
  value: z.number().int().positive(),
  minPriceCents: z.number().int().min(0).optional(),
  maxUses: z.number().int().positive().optional().nullable(),
  active: z.boolean().optional(),
  expiresAt: z.string().datetime().optional().nullable()
});

function computeDiscount(coupon, totalCents) {
  if (coupon.type === "PERCENT") return Math.min(totalCents, Math.round((totalCents * coupon.value) / 100));
  return Math.min(totalCents, coupon.value);
}

export const couponService = {
  // Valida um cupom para um total e devolve o desconto. Reutilizado no preview e no agendamento.
  async validateForTotal(code, totalCents) {
    const barberId = barberRepository.defaultId;
    const coupon = await couponRepository.findByCode(code, barberId);
    if (!coupon || !coupon.active) throw new AppError("Cupom invalido.", 404);
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) throw new AppError("Cupom expirado.", 409);
    if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) throw new AppError("Cupom esgotado.", 409);
    if (totalCents < coupon.minPriceCents) {
      throw new AppError(`Valor minimo para este cupom nao atingido.`, 409);
    }
    return { coupon, discountCents: computeDiscount(coupon, totalCents) };
  },

  async preview({ code, serviceIds }) {
    const ids = z.array(z.string().uuid()).min(1).parse(serviceIds);
    const services = await serviceRepository.findManyByIds(ids, barberRepository.defaultId);
    const totalCents = services.reduce((sum, service) => sum + service.priceCents, 0);
    const { coupon, discountCents } = await this.validateForTotal(code, totalCents);
    return {
      code: coupon.code,
      description: coupon.description,
      discountCents,
      finalCents: totalCents - discountCents
    };
  },

  // --- Admin CRUD ---
  list() {
    return couponRepository.list(barberRepository.defaultId);
  },
  async create(input) {
    const data = upsertSchema.parse(input);
    return couponRepository.create({
      barberId: barberRepository.defaultId,
      code: data.code.toUpperCase(),
      description: data.description || null,
      type: data.type,
      value: data.value,
      minPriceCents: data.minPriceCents || 0,
      maxUses: data.maxUses ?? null,
      active: data.active ?? true,
      expiresAt: data.expiresAt ? new Date(data.expiresAt) : null
    });
  },
  async update(id, input) {
    const existing = await couponRepository.findById(id, barberRepository.defaultId);
    if (!existing) throw new AppError("Cupom nao encontrado.", 404);
    const data = upsertSchema.partial().parse(input);
    const patch = { ...data };
    if (data.code) patch.code = data.code.toUpperCase();
    if (data.expiresAt !== undefined) patch.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    return couponRepository.update(id, patch);
  },
  async remove(id) {
    const existing = await couponRepository.findById(id, barberRepository.defaultId);
    if (!existing) throw new AppError("Cupom nao encontrado.", 404);
    return couponRepository.remove(id);
  }
};
