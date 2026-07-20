import { appointmentService } from "../services/appointmentService.js";
import { auditService } from "../services/auditService.js";

export const appointmentController = {
  async list(_req, res, next) {
    try {
      res.json(await appointmentService.list());
    } catch (error) {
      next(error);
    }
  },
  async listMine(req, res, next) {
    try {
      res.json(await appointmentService.listMine(req.auth.sub));
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    try {
      res.status(201).json(await appointmentService.create(req.body, req.auth || null));
    } catch (error) {
      next(error);
    }
  },
  async cancelMine(req, res, next) {
    try {
      res.json(await appointmentService.cancelMine(req.auth.sub, req.params.id, req.body));
    } catch (error) {
      next(error);
    }
  },
  async reschedule(req, res, next) {
    try {
      res.json(await appointmentService.rescheduleByStaff(req.params.id, req.body));
    } catch (error) {
      next(error);
    }
  },
  async updateStatus(req, res, next) {
    try {
      const result = await appointmentService.updateStatus(req.params.id, req.body.status);
      auditService.record({ action: "APPOINTMENT_STATUS_CHANGED", entity: "Appointment", entityId: req.params.id, metadata: { status: req.body.status }, req });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
