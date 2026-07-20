import { couponService } from "../services/couponService.js";
import { auditService } from "../services/auditService.js";

export const couponController = {
  async preview(req, res, next) {
    try {
      res.json(await couponService.preview(req.body));
    } catch (error) {
      next(error);
    }
  },
  async list(_req, res, next) {
    try {
      res.json(await couponService.list());
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    try {
      const coupon = await couponService.create(req.body);
      auditService.record({ action: "COUPON_CREATED", entity: "Coupon", entityId: coupon.id, metadata: { code: coupon.code }, req });
      res.status(201).json(coupon);
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      res.json(await couponService.update(req.params.id, req.body));
    } catch (error) {
      next(error);
    }
  },
  async remove(req, res, next) {
    try {
      const result = await couponService.remove(req.params.id);
      auditService.record({ action: "COUPON_DELETED", entity: "Coupon", entityId: req.params.id, req });
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
