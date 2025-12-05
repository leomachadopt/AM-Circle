import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { compressImages } from '../utils/image-compression.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Criar diretório de upload de imagens de eventos se não existir
const eventsImagesDir = path.join(__dirname, '../../uploads/events/images')

if (!fs.existsSync(eventsImagesDir)) {
  fs.mkdirSync(eventsImagesDir, { recursive: true })
}

// Configuração do storage para imagens de eventos
const eventsImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, eventsImagesDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    cb(null, `event-image-${uniqueSuffix}${ext}`)
  },
})

// Filtro de tipos de arquivo para imagens
const imageFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas imagens são aceitas (PNG, JPEG, JPG, WEBP, GIF).'))
  }
}

// Upload de imagem única para eventos
export const uploadEventImage = multer({
  storage: eventsImageStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
})

// Middleware para comprimir imagem após upload
export const compressEventImage = async (req: any, res: any, next: any) => {
  if (req.file) {
    try {
      const filePath = req.file.path
      const results = await compressImages([filePath], 1920, 1920)
      
      // Se a imagem foi convertida para JPEG, atualizar o filename
      if (results.length > 0 && results[0].path !== filePath) {
        const newFilename = path.basename(results[0].path)
        req.file.filename = newFilename
        req.file.path = results[0].path
        console.log(`Imagem do evento convertida: ${path.basename(filePath)} -> ${newFilename}`)
      }
      
      next()
    } catch (error) {
      console.error('Erro ao comprimir imagem do evento:', error)
      next(error)
    }
  } else {
    next()
  }
}

