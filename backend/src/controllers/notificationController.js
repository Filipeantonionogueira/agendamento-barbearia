import { notificationService } from "../services/notificationService.js";

export const notificationController = {
  async list(req, res, next) {
    try {
      res.json(await notificationService.list(req.auth.sub, { archived: req.query.archived === "true" }));
    } catch (error) {
      next(error);
    }
  },
  async unreadCount(req, res, next) {
    try {
      res.json({ count: await notificationService.unreadCount(req.auth.sub) });
    } catch (error) {
      next(error);
    }
  },
  async markRead(req, res, next) {
    try {
      res.json(await notificationService.markRead(req.auth.sub, req.params.id));
    } catch (error) {
      next(error);
    }
  },
  async markAllRead(req, res, next) {
    try {
      res.json(await notificationService.markAllRead(req.auth.sub));
    } catch (error) {
      next(error);
    }
  },
  async archive(req, res, next) {
    try {
      res.json(await notificationService.archive(req.auth.sub, req.params.id));
    } catch (error) {
      next(error);
    }
  }
};
