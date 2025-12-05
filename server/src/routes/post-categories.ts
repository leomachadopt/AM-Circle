import { Router } from 'express'
import { db } from '../db/index.js'
import { postCategories, posts } from '../db/schema.js'
import { eq, desc } from 'drizzle-orm'

const router = Router()

// Obter todas as categorias de posts
router.get('/', async (req, res) => {
  try {
    const allCategories = await db
      .select()
      .from(postCategories)
      .orderBy(desc(postCategories.createdAt))

    res.json(allCategories)
  } catch (error: any) {
    console.error('Erro ao buscar categorias de posts:', error)
    console.error('Detalhes do erro:', error.message, error.stack)
    res.status(500).json({ 
      error: 'Erro ao buscar categorias de posts',
      details: error.message 
    })
  }
})

// Obter categoria por ID
router.get('/:id', async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id)

    const category = await db
      .select()
      .from(postCategories)
      .where(eq(postCategories.id, categoryId))
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
      .from(postCategories)
      .where(eq(postCategories.name, name.trim()))

    if (existing.length > 0) {
      return res.status(400).json({ error: 'Já existe uma categoria com este nome' })
    }

    const [newCategory] = await db
      .insert(postCategories)
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
      .from(postCategories)
      .where(eq(postCategories.name, name.trim()))

    if (existing.length > 0 && existing[0].id !== categoryId) {
      return res.status(400).json({ error: 'Já existe outra categoria com este nome' })
    }

    const [updatedCategory] = await db
      .update(postCategories)
      .set({
        name: name.trim(),
        slug,
        description: description || null,
        updatedAt: new Date(),
      })
      .where(eq(postCategories.id, categoryId))
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

    // Verificar se há posts usando esta categoria
    const postsWithCategory = await db
      .select()
      .from(posts)
      .where(eq(posts.topic, categoryId.toString()))

    // Também verificar por nome da categoria
    const category = await db
      .select()
      .from(postCategories)
      .where(eq(postCategories.id, categoryId))
      .limit(1)

    if (category.length === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' })
    }

    const postsWithCategoryName = await db
      .select()
      .from(posts)
      .where(eq(posts.topic, category[0].name))

    const totalPosts = postsWithCategory.length + postsWithCategoryName.length

    if (totalPosts > 0) {
      return res.status(400).json({
        error: `Não é possível excluir esta categoria. Existem ${totalPosts} post(s) usando ela.`,
      })
    }

    await db.delete(postCategories).where(eq(postCategories.id, categoryId))

    res.json({ success: true, message: 'Categoria deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar categoria:', error)
    res.status(500).json({ error: 'Erro ao deletar categoria' })
  }
})

export default router

