import { z } from "zod";
import { barberRepository } from "../repositories/barberRepository.js";
import { authService } from "./authService.js";

const schema = z.object({
  shopName: z.string().trim().min(2).max(80).optional(),
  whatsappNumber: z.string().trim().min(10).max(20).optional(),
  // Aceita URL absoluta (Cloudinary) ou caminho relativo (/uploads em dev).
  heroImageUrl: z.string().trim().max(600).optional().nullable(),
  aboutText: z.string().trim().max(1000).optional().nullable(),
  addressLine: z.string().trim().max(200).optional().nullable(),
  openingHoursText: z.string().trim().max(200).optional().nullable(),
  username: z.string().trim().min(2).optional(),
  password: z.string().min(6).optional()
});

export const configService = {
  get() {
    return barberRepository.findDefault();
  },
  async update(input) {
    const data = schema.parse(input);
    const barberData = {};
    if (data.shopName) barberData.shopName = data.shopName;
    if (data.whatsappNumber) barberData.whatsappNumber = data.whatsappNumber;
    if (data.heroImageUrl !== undefined) barberData.heroImageUrl = data.heroImageUrl;
    if (data.aboutText !== undefined) barberData.aboutText = data.aboutText;
    if (data.addressLine !== undefined) barberData.addressLine = data.addressLine;
    if (data.openingHoursText !== undefined) barberData.openingHoursText = data.openingHoursText;
    if (data.username || data.password) await authService.updateCredentials(data);
    if (Object.keys(barberData).length) return barberRepository.updateDefault(barberData);
    return barberRepository.findDefault();
  }
};
