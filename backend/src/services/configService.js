import { z } from "zod";
import { barberRepository } from "../repositories/barberRepository.js";
import { authService } from "./authService.js";

const schema = z.object({
  shopName: z.string().trim().min(2).max(80).optional(),
  whatsappNumber: z.string().trim().min(10).max(20).optional(),
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
    if (data.username || data.password) await authService.updateCredentials(data);
    if (Object.keys(barberData).length) return barberRepository.updateDefault(barberData);
    return barberRepository.findDefault();
  }
};
