import { dashboardService } from "../services/dashboardService.js";

export const dashboardController = {
  async summary(req, res, next) {
    try {
      res.json(await dashboardService.summary(req.query.period));
    } catch (error) {
      next(error);
    }
  }
};
