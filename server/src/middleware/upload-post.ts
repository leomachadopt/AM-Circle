import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'
import { compressImages, isImage } from '../utils/image-compression.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Criar diretórios de upload se não existirem
const postsImagesDir = path.join(__dirname, '../../uploads/posts/images')
const postsFilesDir = path.join(__dirname, '../../uploads/posts/files')

if (!fs.existsSync(postsImagesDir)) {
  fs.mkdirSync(postsImagesDir, { recursive: true })
}
if (!fs.existsSync(postsFilesDir)) {
  fs.mkdirSync(postsFilesDir, { recursive: true })
}

// Configuração do storage para imagens
const imagesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, postsImagesDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    cb(null, `image-${uniqueSuffix}${ext}`)
  },
})

// Configuração do storage para arquivos
const filesStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, postsFilesDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext)
    cb(null, `file-${uniqueSuffix}${ext}`)
  },
})

// Filtro de tipos de arquivo para imagens
const imagesFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas imagens são aceitas (PNG, JPEG, JPG, WEBP, GIF).'))
  }
}

// Filtro de tipos de arquivo para documentos
const filesFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/csv',
    'application/zip',
    'application/x-zip-compressed',
  ]
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Tipo de arquivo não permitido. Apenas PDF, Excel, Word, CSV e ZIP são aceitos.'))
  }
}

// Upload de imagens (múltiplas)
export const uploadPostImages = multer({
  storage: imagesStorage,
  fileFilter: imagesFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB por imagem (reduzido de 10MB)
  },
})

// Upload de arquivos (múltiplos)
export const uploadPostFiles = multer({
  storage: filesStorage,
  fileFilter: filesFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB por arquivo (reduzido de 50MB)
  },
})

// Upload combinado (imagens e arquivos)
export const uploadPostMedia = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const isImg = file.mimetype.startsWith('image/')
      cb(null, isImg ? postsImagesDir : postsFilesDir)
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9)
      const ext = path.extname(file.originalname)
      const isImg = file.mimetype.startsWith('image/')
      const prefix = isImg ? 'image' : 'file'
      cb(null, `${prefix}-${uniqueSuffix}${ext}`)
    },
  }),
  fileFilter: (req, file, cb) => {
    const isImg = file.mimetype.startsWith('image/')
    const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif']
    const allowedFileTypes = [
      'application/pdf',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/csv',
      'application/zip',
      'application/x-zip-compressed',
    ]

    if (isImg && allowedImageTypes.includes(file.mimetype)) {
      cb(null, true)
    } else if (!isImg && allowedFileTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Tipo de arquivo não permitido.'))
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB (reduzido de 50MB)
  },
})

// Middleware para comprimir imagens após upload
export const compressPostImages = async (req: any, res: any, next: any) => {
  if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
    return next()
  }

  try {
    const files = req.files as Express.Multer.File[]
    const imageFiles = files.filter((file) => isImage(file.mimetype))

    console.log(`Processando ${imageFiles.length} imagem(ns) para compressão`)

    if (imageFiles.length > 0) {
      const imagePaths = imageFiles.map((file) => file.path)
      console.log('Caminhos das imagens:', imagePaths)
      
      const results = await compressImages(imagePaths, 1920, 1920)
      
      const totalOriginal = results.reduce((sum, r) => sum + r.originalSize, 0)
      const totalCompressed = results.reduce((sum, r) => sum + r.compressedSize, 0)
      const totalSaved = totalOriginal - totalCompressed
      const savedPercent = totalOriginal > 0 ? ((totalSaved / totalOriginal) * 100).toFixed(2) : '0'
      
      console.log(`✅ Imagens comprimidas: ${imageFiles.length} arquivo(s)`)
      console.log(`   Tamanho original: ${(totalOriginal / 1024 / 1024).toFixed(2)} MB`)
      console.log(`   Tamanho comprimido: ${(totalCompressed / 1024 / 1024).toFixed(2)} MB`)
      console.log(`   Economia: ${savedPercent}%`)
      
      // Atualizar os nomes dos arquivos se foram convertidos para JPEG
      results.forEach((result, index) => {
        const originalFile = imageFiles[index]
        const originalPath = originalFile.path
        const newPath = result.path
        
        // Se o caminho mudou (conversão para JPEG), atualizar req.files
        if (newPath !== originalPath && fs.existsSync(newPath)) {
          const newFilename = path.basename(newPath)
          originalFile.filename = newFilename
          originalFile.path = newPath
          console.log(`Arquivo convertido: ${path.basename(originalPath)} -> ${newFilename}`)
        }
      })
    }
    
    next()
  } catch (error) {
    console.error('❌ Erro ao comprimir imagens:', error)
    // Continuar mesmo se a compressão falhar
    next()
  }
}

