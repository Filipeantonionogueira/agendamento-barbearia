import { serviceService } from "../services/serviceService.js";

export const serviceController = {
  async listPublic(_req, res, next) {
    try {
      res.json(await serviceService.listPublic());
    } catch (error) {
      next(error);
    }
  },
  async listAdmin(_req, res, next) {
    try {
      res.json(await serviceService.listAdmin());
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    try {
      res.status(201).json(await serviceService.create(req.body));
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      res.json(await serviceService.update(req.params.id, req.body));
    } catch (error) {
      next(error);
    }
  },
  async remove(req, res, next) {
    try {
      res.json(await serviceService.deactivate(req.params.id));
    } catch (error) {
      next(error);
    }
  }
};
