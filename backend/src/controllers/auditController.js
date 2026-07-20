import { auditService } from "../services/auditService.js";

export const auditController = {
  async list(req, res, next) {
    try {
      res.json(await auditService.list(req.query));
    } catch (error) {
      next(error);
    }
  }
};
