import { Router } from 'express'
import { db } from '../db/index.js'
import { tools } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { upload } from '../middleware/upload.js'

const router = Router()

// Obter todas as ferramentas
router.get('/', async (req, res) => {
  try {
    const allTools = await db.select().from(tools)
    res.json(allTools)
  } catch (error) {
    console.error('Erro ao buscar ferramentas:', error)
    res.status(500).json({ error: 'Erro ao buscar ferramentas' })
  }
})

// Obter ferramenta por ID
router.get('/:id', async (req, res) => {
  try {
    const tool = await db
      .select()
      .from(tools)
      .where(eq(tools.id, parseInt(req.params.id)))
      .limit(1)

    if (tool.length === 0) {
      return res.status(404).json({ error: 'Ferramenta não encontrada' })
    }

    res.json(tool[0])
  } catch (error) {
    console.error('Erro ao buscar ferramenta:', error)
    res.status(500).json({ error: 'Erro ao buscar ferramenta' })
  }
})

// Obter ferramentas por categoria
router.get('/category/:category', async (req, res) => {
  try {
    const toolsList = await db
      .select()
      .from(tools)
      .where(eq(tools.category, req.params.category))

    res.json(toolsList)
  } catch (error) {
    console.error('Erro ao buscar ferramentas por categoria:', error)
    res.status(500).json({ error: 'Erro ao buscar ferramentas por categoria' })
  }
})

// Upload de arquivo
router.post('/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    }

    const fileUrl = `/uploads/${req.file.filename}`
    res.json({
      success: true,
      fileUrl,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    })
  } catch (error) {
    console.error('Erro ao fazer upload:', error)
    res.status(500).json({ error: 'Erro ao fazer upload do arquivo' })
  }
})

// Criar nova ferramenta
router.post('/', async (req, res) => {
  try {
    const { title, category, icon, description, fileUrl } = req.body

    const [newTool] = await db
      .insert(tools)
      .values({
        title,
        category,
        icon,
        description,
        fileUrl,
      })
      .returning()

    res.status(201).json(newTool)
  } catch (error) {
    console.error('Erro ao criar ferramenta:', error)
    res.status(500).json({ error: 'Erro ao criar ferramenta' })
  }
})

// Atualizar ferramenta
router.put('/:id', async (req, res) => {
  try {
    const { title, category, icon, description, fileUrl } = req.body
    const toolId = parseInt(req.params.id)

    const [updatedTool] = await db
      .update(tools)
      .set({
        title,
        category,
        icon,
        description,
        fileUrl,
        updatedAt: new Date(),
      })
      .where(eq(tools.id, toolId))
      .returning()

    if (!updatedTool) {
      return res.status(404).json({ error: 'Ferramenta não encontrada' })
    }

    res.json(updatedTool)
  } catch (error) {
    console.error('Erro ao atualizar ferramenta:', error)
    res.status(500).json({ error: 'Erro ao atualizar ferramenta' })
  }
})

// Deletar ferramenta
router.delete('/:id', async (req, res) => {
  try {
    const toolId = parseInt(req.params.id)

    // Verificar se a ferramenta existe
    const tool = await db
      .select()
      .from(tools)
      .where(eq(tools.id, toolId))
      .limit(1)

    if (tool.length === 0) {
      return res.status(404).json({ error: 'Ferramenta não encontrada' })
    }

    // Deletar a ferramenta
    await db.delete(tools).where(eq(tools.id, toolId))

    res.json({ success: true, message: 'Ferramenta deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar ferramenta:', error)
    res.status(500).json({ error: 'Erro ao deletar ferramenta' })
  }
})

export default router


