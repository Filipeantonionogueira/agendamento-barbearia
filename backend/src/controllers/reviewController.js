import { reviewService } from "../services/reviewService.js";
import { auditService } from "../services/auditService.js";

export const reviewController = {
  async listPublic(req, res, next) {
    try {
      res.json(await reviewService.listPublic(req.query));
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    try {
      res.status(201).json(await reviewService.create(req.auth.sub, { ...req.body, rating: Number(req.body.rating) }));
    } catch (error) {
      next(error);
    }
  },
  async pending(req, res, next) {
    try {
      res.json(await reviewService.pending(req.auth.sub));
    } catch (error) {
      next(error);
    }
  },
  async listAdmin(_req, res, next) {
    try {
      res.json(await reviewService.listAllForAdmin());
    } catch (error) {
      next(error);
    }
  },
  async reply(req, res, next) {
    try {
      const result = await reviewService.reply(req.params.id, req.body);
      auditService.record({ action: "REVIEW_REPLIED", entity: "Review", entityId: req.params.id, req });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
