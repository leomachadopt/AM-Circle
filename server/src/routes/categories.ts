import { Router } from 'express'
import { db } from '../db/index.js'
import { articleCategories, articles } from '../db/schema.js'
import { eq, desc } from 'drizzle-orm'

const router = Router()

// Obter todas as categorias
router.get('/', async (req, res) => {
  try {
    const allCategories = await db
      .select()
      .from(articleCategories)
      .orderBy(desc(articleCategories.createdAt))

    res.json(allCategories)
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    res.status(500).json({ error: 'Erro ao buscar categorias' })
  }
})

// Obter categoria por ID
router.get('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id)

    const category = await db
      .select()
      .from(articleCategories)
      .where(eq(articleCategories.id, categoryId))
      .limit(1)

    if (category.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' })
    }

    res.json(category[0])
  } catch (error) {
    console.error('Erro ao buscar categoria:', error)
    res.status(500).json({ error: 'Erro ao buscar categoria' })
  }
})

// Criar nova categoria
router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório' })
    }

    // Gerar slug a partir do nome
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Verificar se já existe categoria com mesmo nome ou slug
    const existing = await db
      .select()
      .from(articleCategories)
      .where(eq(articleCategories.name, name.trim()))

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Já existe uma categoria com este nome' })
    }

    const [newCategory] = await db
      .insert(articleCategories)
      .values({
        name: name.trim(),
        slug,
        description: description || null,
      })
      .returning()

    res.status(201).json(newCategory)
  } catch (error: any) {
    console.error('Erro ao criar categoria:', error)
    if (error.code === '23505') {
      // Unique constraint violation
      return res.status(400).json({ error: 'Já existe uma categoria com este nome ou slug' })
    }
    res.status(500).json({ error: 'Erro ao criar categoria' })
  }
})

// Atualizar categoria
router.put('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id)
    const { name, description } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório' })
    }

    // Gerar slug a partir do nome
    const slug = name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Verificar se já existe outra categoria com mesmo nome ou slug
    const existing = await db
      .select()
      .from(articleCategories)
      .where(eq(articleCategories.name, name.trim()))

    if (existing.length > 0 && existing[0].id !== categoryId) {
      return res.status(400).json({ error: 'Já existe outra categoria com este nome' })
    }

    const [updatedCategory] = await db
      .update(articleCategories)
      .set({
        name: name.trim(),
        slug,
        description: description || null,
        updatedAt: new Date(),
      })
      .where(eq(articleCategories.id, categoryId))
      .returning()

    if (updatedCategory) {
      res.json(updatedCategory)
    } else {
      res.status(404).json({ error: 'Categoria não encontrada' })
    }
  } catch (error: any) {
    console.error('Erro ao atualizar categoria:', error)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Já existe uma categoria com este nome ou slug' })
    }
    res.status(500).json({ error: 'Erro ao atualizar categoria' })
  }
})

// Deletar categoria
router.delete('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id)

    // Verificar se há artigos usando esta categoria
    const articlesWithCategory = await db
      .select()
      .from(articles)
      .where(eq(articles.category, categoryId.toString()))

    if (articlesWithCategory.length > 0) {
      return res.status(400).json({
        error: `Não é possível excluir esta categoria. Existem ${articlesWithCategory.length} artigo(s) usando ela.`,
      })
    }

    await db.delete(articleCategories).where(eq(articleCategories.id, categoryId))

    res.json({ success: true, message: 'Categoria deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar categoria:', error)
    res.status(500).json({ error: 'Erro ao deletar categoria' })
  }
})

export default router

