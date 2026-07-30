import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { v2 as cloudinary } from "cloudinary";
import { env } from "../config/env.js";
import { AppError } from "../utils/AppError.js";
import { logger } from "../utils/logger.js";

export const UPLOAD_DIR = path.resolve("uploads");

// Diretorio local usado apenas no fallback de desenvolvimento.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

if (env.cloudinary.enabled) {
  cloudinary.config({
    cloud_name: env.cloudinary.cloudName,
    api_key: env.cloudinary.apiKey,
    api_secret: env.cloudinary.apiSecret,
    secure: true
  });
}

const EXTENSION_BY_MIME = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"]
]);

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: env.cloudinary.folder,
        resource_type: "image",
        // Entrega otimizada e responsiva sem trabalho extra no cliente.
        transformation: [{ quality: "auto", fetch_format: "auto" }]
      },
      (error, result) => (error ? reject(error) : resolve(result))
    );
    stream.end(buffer);
  });
}

/**
 * Salva a imagem enviada e devolve a URL publica.
 *
 * Em producao usa o Cloudinary (armazenamento durável, CDN e otimizacao).
 * Sem credenciais, grava no disco local — suficiente para desenvolvimento.
 */
export const storageService = {
  get provider() {
    return env.cloudinary.enabled ? "cloudinary" : "local";
  },

  async saveImage(file) {
    if (!file?.buffer?.length) throw new AppError("Nenhum arquivo enviado.", 400);

    if (env.cloudinary.enabled) {
      try {
        const result = await uploadToCloudinary(file.buffer);
        logger.info("upload_stored", { provider: "cloudinary", publicId: result.public_id, bytes: result.bytes });
        return { url: result.secure_url, filename: result.public_id, sizeBytes: result.bytes };
      } catch (error) {
        logger.error("upload_failed", { provider: "cloudinary", message: error.message });
        throw new AppError("Nao foi possivel enviar a imagem. Tente novamente.", 502);
      }
    }

    const extension = EXTENSION_BY_MIME.get(file.mimetype) || ".bin";
    // Nome sempre gerado: o nome enviado pelo usuario nunca toca o disco.
    const filename = `${Date.now()}-${crypto.randomBytes(12).toString("hex")}${extension}`;
    await fs.promises.writeFile(path.join(UPLOAD_DIR, filename), file.buffer);
    logger.info("upload_stored", { provider: "local", filename, bytes: file.buffer.length });
    return { url: `/uploads/${filename}`, filename, sizeBytes: file.buffer.length };
  }
};
