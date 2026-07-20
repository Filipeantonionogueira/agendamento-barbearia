import { Router } from "express";
import { galleryController } from "../controllers/galleryController.js";
import { requireStaff } from "../middlewares/auth.js";
import { handleUpload } from "../middlewares/upload.js";

export const galleryRoutes = Router();

// Publico: galeria do site.
galleryRoutes.get("/", galleryController.listPublic);

// Staff: gestao da galeria e envio de imagens.
galleryRoutes.get("/admin", requireStaff, galleryController.listAll);
galleryRoutes.post("/upload", requireStaff, handleUpload, galleryController.upload);
galleryRoutes.post("/", requireStaff, galleryController.create);
galleryRoutes.put("/:id", requireStaff, galleryController.update);
galleryRoutes.delete("/:id", requireStaff, galleryController.remove);
