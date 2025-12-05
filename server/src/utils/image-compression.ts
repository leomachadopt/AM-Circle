import sharp from 'sharp'
import fs from 'fs'
import path from 'path'

// Configurações de compressão
const MAX_WIDTH = 1920 // Largura máxima
const MAX_HEIGHT = 1920 // Altura máxima
const QUALITY = 80 // Qualidade JPEG (0-100) - reduzido para melhor compressão
const WEBP_QUALITY = 80 // Qualidade WebP (0-100) - reduzido para melhor compressão

/**
 * Comprime uma imagem usando sharp
 * @param inputPath - Caminho da imagem original
 * @param outputPath - Caminho onde salvar a imagem comprimida (opcional, sobrescreve original se não fornecido)
 * @param maxWidth - Largura máxima (padrão: 1920px)
 * @param maxHeight - Altura máxima (padrão: 1920px)
 * @returns Promise com informações sobre a compressão
 */
export async function compressImage(
  inputPath: string,
  outputPath?: string,
  maxWidth: number = MAX_WIDTH,
  maxHeight: number = MAX_HEIGHT
): Promise<{ originalSize: number; compressedSize: number; saved: number; savedPercent: number; outputPath: string }> {
  try {
    const finalOutputPath = outputPath || inputPath
    const originalStats = fs.statSync(inputPath)
    const originalSize = originalStats.size

    // Obter metadados da imagem
    const metadata = await sharp(inputPath).metadata()
    const format = metadata.format

    console.log(`Comprimindo imagem: ${inputPath}`, {
      format,
      width: metadata.width,
      height: metadata.height,
      originalSize: originalSize,
    })

    // Determinar se precisa redimensionar
    const needsResize = metadata.width && metadata.height && 
      (metadata.width > maxWidth || metadata.height > maxHeight)

    let sharpInstance = sharp(inputPath)

    // Redimensionar se necessário
    if (needsResize && metadata.width && metadata.height) {
      sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      console.log(`Redimensionando de ${metadata.width}x${metadata.height} para máximo ${maxWidth}x${maxHeight}`)
    } else {
      console.log(`Não precisa redimensionar (${metadata.width}x${metadata.height})`)
    }

    // Comprimir baseado no formato
    // Para avatares e posts, sempre converter para JPEG para melhor compressão
    const isAvatar = finalOutputPath.includes('avatars')
    const isPost = finalOutputPath.includes('posts')
    let actualOutputPath = finalOutputPath
    
    // Sempre comprimir, mesmo que não precise redimensionar
    // Converter para JPEG para melhor compressão (exceto se já for WebP e for post)
    const shouldConvertToJpeg = isAvatar || 
      format === 'jpeg' || 
      format === 'jpg' || 
      format === 'png' ||
      (format !== 'webp' && isPost)
    
    if (shouldConvertToJpeg) {
      // Converter para JPEG se não for JPEG já
      if (format !== 'jpeg' && format !== 'jpg') {
        actualOutputPath = finalOutputPath.replace(/\.[^.]+$/, '.jpg')
        console.log(`Convertendo ${format} para JPEG para melhor compressão`)
      }
      
      await sharpInstance
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toFile(actualOutputPath)
      
      // Se converteu para JPEG, remover arquivo original se diferente
      if (actualOutputPath !== finalOutputPath && fs.existsSync(finalOutputPath)) {
        fs.unlinkSync(finalOutputPath)
        console.log(`Arquivo original removido: ${finalOutputPath}`)
      }
    } else if (format === 'webp') {
      // Manter WebP se já for WebP (melhor compressão que JPEG)
      await sharpInstance
        .webp({ quality: WEBP_QUALITY })
        .toFile(actualOutputPath)
    } else {
      // Para outros formatos desconhecidos, converter para JPEG
      console.log(`Convertendo ${format} para JPEG para melhor compressão`)
      actualOutputPath = finalOutputPath.replace(/\.[^.]+$/, '.jpg')
      await sharpInstance
        .jpeg({ quality: QUALITY, mozjpeg: true })
        .toFile(actualOutputPath)
      
      // Remover arquivo original
      if (actualOutputPath !== finalOutputPath && fs.existsSync(finalOutputPath)) {
        fs.unlinkSync(finalOutputPath)
      }
    }

    const compressedStats = fs.statSync(actualOutputPath)
    const compressedSize = compressedStats.size
    const saved = originalSize - compressedSize
    const savedPercent = ((saved / originalSize) * 100).toFixed(2)

    console.log(`Compressão concluída: ${originalSize} bytes -> ${compressedSize} bytes (${savedPercent}% economizado)`)

    return {
      originalSize,
      compressedSize,
      saved,
      savedPercent: parseFloat(savedPercent),
      outputPath: actualOutputPath, // Retornar o caminho final (pode ser diferente se foi convertido)
    }
  } catch (error) {
    console.error('Erro ao comprimir imagem:', error)
    throw error
  }
}

/**
 * Comprime múltiplas imagens
 */
export async function compressImages(
  filePaths: string[],
  maxWidth: number = MAX_WIDTH,
  maxHeight: number = MAX_HEIGHT
): Promise<Array<{ path: string; originalSize: number; compressedSize: number; saved: number; savedPercent: number }>> {
  const results = await Promise.all(
    filePaths.map(async (filePath) => {
      try {
        const result = await compressImage(filePath, undefined, maxWidth, maxHeight)
        return {
          path: result.outputPath, // Usar o caminho de saída (pode ser diferente se foi convertido)
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          saved: result.saved,
          savedPercent: result.savedPercent,
        }
      } catch (error) {
        console.error(`Erro ao comprimir ${filePath}:`, error)
        // Retornar informações básicas mesmo em caso de erro
        const stats = fs.statSync(filePath)
        return {
          path: filePath,
          originalSize: stats.size,
          compressedSize: stats.size,
          saved: 0,
          savedPercent: 0,
        }
      }
    })
  )

  return results
}

/**
 * Verifica se um arquivo é uma imagem
 */
export function isImage(mimetype: string): boolean {
  return mimetype.startsWith('image/')
}

/**
 * Obtém o tamanho do arquivo em formato legível
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

