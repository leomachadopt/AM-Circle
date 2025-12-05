import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { compressImage, isImage } from '../utils/image-compression.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Criar diretório de avatares se não existir
const avatarsDir = path.join(__dirname, '../../uploads/avatars')
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true })
}

// Configuração do storage para avatares
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarsDir)
  },
  filename: (req, file, cb) => {
    // Gerar nome único para o arquivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `avatar-${uniqueSuffix}${ext}`)
  },
})

// Filtro de tipos de arquivo permitidos (apenas imagens)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas imagens são aceitas (PNG, JPEG, JPG, WEBP, GIF).'))
  }
}

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 3 * 1024 * 1024, // 3MB (reduzido de 5MB)
  },
})

// Middleware para comprimir avatar após upload
export const compressAvatar = async (req: any, res: any, next: any) => {
  if (!req.file) {
    return next()
  }

  try {
    // Comprimir avatar (máximo 500x500px para avatares)
    const result = await compressImage(req.file.path, undefined, 500, 500)
    console.log(`Avatar comprimido: ${result.originalSize} bytes -> ${result.compressedSize} bytes (${result.savedPercent}% economizado)`)
    next()
  } catch (error) {
    console.error('Erro ao comprimir avatar:', error)
    // Continuar mesmo se a compressão falhar
    next()
  }
}

