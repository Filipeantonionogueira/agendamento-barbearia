import { blockService } from "../services/blockService.js";

export const blockController = {
  async list(_req, res, next) {
    try {
      res.json(await blockService.list());
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    try {
      res.status(201).json(await blockService.create(req.body));
    } catch (error) {
      next(error);
    }
  },
  async remove(req, res, next) {
    try {
      res.json(await blockService.remove(req.params.id));
    } catch (error) {
      next(error);
    }
  }
};
