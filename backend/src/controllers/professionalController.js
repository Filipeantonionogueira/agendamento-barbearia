import { professionalService } from "../services/professionalService.js";

export const professionalController = {
  async listPublic(_req, res, next) {
    try {
      res.json(await professionalService.listPublic());
    } catch (error) {
      next(error);
    }
  },
  async listAdmin(_req, res, next) {
    try {
      res.json(await professionalService.listAdmin());
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    try {
      res.status(201).json(await professionalService.create(req.body));
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      res.json(await professionalService.update(req.params.id, req.body));
    } catch (error) {
      next(error);
    }
  }
};
