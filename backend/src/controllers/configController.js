import { configService } from "../services/configService.js";
import { auditService } from "../services/auditService.js";

function toPublicShape(config) {
  return {
    shopName: config.shopName,
    whatsappNumber: config.whatsappNumber,
    heroImageUrl: config.heroImageUrl,
    aboutText: config.aboutText,
    addressLine: config.addressLine,
    openingHoursText: config.openingHoursText
  };
}

export const configController = {
  async getPublic(_req, res, next) {
    try {
      res.json(toPublicShape(await configService.get()));
    } catch (error) {
      next(error);
    }
  },
  async get(_req, res, next) {
    try {
      res.json(toPublicShape(await configService.get()));
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      const result = toPublicShape(await configService.update(req.body));
      auditService.record({ action: "CONFIG_UPDATED", entity: "Barber", req });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
