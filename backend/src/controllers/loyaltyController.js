import { loyaltyService } from "../services/loyaltyService.js";

export const loyaltyController = {
  async summary(req, res, next) {
    try {
      res.json(await loyaltyService.summary(req.auth.sub));
    } catch (error) {
      next(error);
    }
  }
};
