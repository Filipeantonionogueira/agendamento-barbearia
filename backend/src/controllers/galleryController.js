import { galleryService } from "../services/galleryService.js";
import { auditService } from "../services/auditService.js";
import { AppError } from "../utils/AppError.js";

export const galleryController = {
  async listPublic(_req, res, next) {
    try {
      res.json(await galleryService.listPublic());
    } catch (error) {
      next(error);
    }
  },
  async listAll(_req, res, next) {
    try {
      res.json(await galleryService.listAll());
    } catch (error) {
      next(error);
    }
  },
  async create(req, res, next) {
    try {
      const item = await galleryService.create(req.body);
      auditService.record({ action: "GALLERY_ITEM_CREATED", entity: "GalleryItem", entityId: item.id, req });
      res.status(201).json(item);
    } catch (error) {
      next(error);
    }
  },
  async update(req, res, next) {
    try {
      res.json(await galleryService.update(req.params.id, req.body));
    } catch (error) {
      next(error);
    }
  },
  async remove(req, res, next) {
    try {
      const result = await galleryService.remove(req.params.id);
      auditService.record({ action: "GALLERY_ITEM_DELETED", entity: "GalleryItem", entityId: req.params.id, req });
      res.json(result);
    } catch (error) {
      next(error);
    }
  },
  // Recebe o arquivo e devolve a URL publica para uso em galeria/perfil/servicos.
  async upload(req, res, next) {
    try {
      if (!req.file) throw new AppError("Nenhum arquivo enviado.", 400);
      const url = `/uploads/${req.file.filename}`;
      auditService.record({ action: "FILE_UPLOADED", entity: "Upload", entityId: req.file.filename, req });
      res.status(201).json({ url, filename: req.file.filename, sizeBytes: req.file.size });
    } catch (error) {
      next(error);
    }
  }
};
