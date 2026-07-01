import { appointmentService } from "../services/appointmentService.js";

export const appointmentController = {
  async list(_req, res, next) {
    try {
      res.json(await appointmentService.list());
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    try {
      res.status(201).json(await appointmentService.create(req.body));
    } catch (error) {
      next(error);
    }
  },
  async updateStatus(req, res, next) {
    try {
      res.json(await appointmentService.updateStatus(req.params.id, req.body.status));
    } catch (error) {
      next(error);
    }
  }
};
