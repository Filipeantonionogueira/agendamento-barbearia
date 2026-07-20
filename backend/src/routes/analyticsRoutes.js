import { Router } from "express";
import { analyticsService } from "../services/analyticsService.js";

export const analyticsRoutes = Router();

// Publico: registra visita anonima. Falha em silencio para nunca atrapalhar o site.
analyticsRoutes.post("/visita", async (req, res) => {
  try {
    await analyticsService.record(req.body);
  } catch {
    // ignorado de proposito
  }
  res.status(202).json({ ok: true });
});
