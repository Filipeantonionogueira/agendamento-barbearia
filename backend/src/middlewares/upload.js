import multer from "multer";
import crypto from "node:crypto";
import path from "node:path";
import fs from "node:fs";
import { AppError } from "../utils/AppError.js";

export const UPLOAD_DIR = path.resolve("uploads");

// Garante o diretorio de uploads na inicializacao.
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Somente imagens: mimetype E extensao precisam bater com a allowlist.
const ALLOWED = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"]
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    // Nome sempre gerado: o nome enviado pelo usuario nunca toca o disco
    // (evita path traversal e sobrescrita de arquivos).
    const extension = ALLOWED.get(file.mimetype) || ".bin";
    cb(null, `${Date.now()}-${crypto.randomBytes(12).toString("hex")}${extension}`);
  }
});

function fileFilter(_req, file, cb) {
  if (!ALLOWED.has(file.mimetype)) {
    return cb(new AppError("Formato invalido. Envie uma imagem JPG, PNG ou WEBP.", 400));
  }
  const extension = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
  if (!allowedExtensions.includes(extension)) {
    return cb(new AppError("Extensao de arquivo nao permitida.", 400));
  }
  cb(null, true);
}

export const uploadImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 1 } // 5 MB, um arquivo por vez
}).single("file");

// Converte erros do multer em AppError com mensagem amigavel.
export function handleUpload(req, res, next) {
  uploadImage(req, res, (error) => {
    if (!error) return next();
    if (error.code === "LIMIT_FILE_SIZE") return next(new AppError("Imagem muito grande (maximo 5 MB).", 413));
    if (error instanceof AppError) return next(error);
    return next(new AppError("Falha no envio do arquivo.", 400));
  });
}
