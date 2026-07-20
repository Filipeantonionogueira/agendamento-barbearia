import { availabilityService } from "../services/availabilityService.js";

export const availabilityController = {
  async list(req, res, next) {
    try {
      if (req.query.date && req.query.serviceIds) {
        const slots = await availabilityService.getAvailableSlots(
          req.query.date,
          String(req.query.serviceIds).split(","),
          req.query.professionalId
        );
        return res.json({ slots });
      }
      res.json(await availabilityService.list(req.query.professionalId));
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      res.json(await availabilityService.update(req.body.professionalId, req.body.items));
    } catch (error) {
      next(error);
    }
  }
};
