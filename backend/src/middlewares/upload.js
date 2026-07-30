import multer from "multer";
import path from "node:path";
import { AppError } from "../utils/AppError.js";
import { UPLOAD_DIR } from "../services/storageService.js";

export { UPLOAD_DIR };

// Somente imagens: mimetype E extensao precisam bater com a allowlist.
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

// Memoria, nao disco: o arquivo segue direto para o storage (Cloudinary) sem
// depender do sistema de arquivos do container, que e efemero em producao.
const storage = multer.memoryStorage();

function fileFilter(_req, file, cb) {
  if (!ALLOWED_MIME.has(file.mimetype)) {
    return cb(new AppError("Formato invalido. Envie uma imagem JPG, PNG ou WEBP.", 400));
  }
  const extension = path.extname(file.originalname).toLowerCase();
  if (!ALLOWED_EXTENSIONS.includes(extension)) {
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
