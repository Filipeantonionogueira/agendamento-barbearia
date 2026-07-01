import { configService } from "../services/configService.js";

export const configController = {
  async get(_req, res, next) {
    try {
      const config = await configService.get();
      res.json({ shopName: config.shopName, whatsappNumber: config.whatsappNumber });
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      const config = await configService.update(req.body);
      res.json({ shopName: config.shopName, whatsappNumber: config.whatsappNumber });
    } catch (error) {
      next(error);
    }
  }
};
