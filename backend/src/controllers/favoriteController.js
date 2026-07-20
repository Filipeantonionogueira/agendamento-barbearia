import { favoriteService } from "../services/favoriteService.js";

export const favoriteController = {
  async list(req, res, next) {
    try {
      res.json(await favoriteService.list(req.auth.sub));
    } catch (error) {
      next(error);
    }
  },
  async add(req, res, next) {
    try {
      res.status(201).json(await favoriteService.add(req.auth.sub, req.body));
    } catch (error) {
      next(error);
    }
  },
  async remove(req, res, next) {
    try {
      res.json(await favoriteService.remove(req.auth.sub, req.body));
    } catch (error) {
      next(error);
    }
  }
};
