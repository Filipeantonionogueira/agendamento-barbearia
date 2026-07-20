import { waitlistService } from "../services/waitlistService.js";

export const waitlistController = {
  async join(req, res, next) {
    try {
      res.status(201).json(await waitlistService.join(req.auth.sub, req.body));
    } catch (error) {
      next(error);
    }
  },
  async listMine(req, res, next) {
    try {
      res.json(await waitlistService.listMine(req.auth.sub));
    } catch (error) {
      next(error);
    }
  },
  async cancel(req, res, next) {
    try {
      res.json(await waitlistService.cancel(req.auth.sub, req.params.id));
    } catch (error) {
      next(error);
    }
  }
};
