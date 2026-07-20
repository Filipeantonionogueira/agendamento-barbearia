import { lgpdService } from "../services/lgpdService.js";
import { auditService } from "../services/auditService.js";

export const accountController = {
  async exportData(req, res, next) {
    try {
      const data = await lgpdService.exportData(req.auth.sub);
      auditService.record({ action: "DATA_EXPORTED", entity: "User", entityId: req.auth.sub, req });
      res.setHeader("Content-Disposition", 'attachment; filename="meus-dados.json"');
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
  async deleteAccount(req, res, next) {
    try {
      const result = await lgpdService.deleteAccount(req.auth.sub);
      auditService.record({ action: "ACCOUNT_DELETED", entity: "User", entityId: req.auth.sub, req });
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
};
