import { Router } from 'express'
import { db } from '../db/index.js'
import { articles, articleComments } from '../db/schema.js'
import { eq, desc, ilike, or, sql, count } from 'drizzle-orm'
import { upload } from '../middleware/upload.js'

const router = Router()

// Obter todos os artigos (apenas publicados)
router.get('/', async (req, res) => {
  try {
    const { published, category, search, sortBy } = req.query

    // Buscar artigos com contagem de comentários
    let query = db
      .select({
        id: articles.id,
        title: articles.title,
        slug: articles.slug,
        category: articles.category,
        description: articles.description,
        fileUrl: articles.fileUrl,
        published: articles.published,
        publishedAt: articles.publishedAt,
        views: articles.views,
        downloads: articles.downloads,
        tags: articles.tags,
        createdAt: articles.createdAt,
        updatedAt: articles.updatedAt,
        commentsCount: sql<number>`COALESCE((
          SELECT COUNT(*)::int
          FROM ${articleComments}
          WHERE ${articleComments.articleId} = ${articles.id}
        ), 0)`.as('comments_count'),
      })
      .from(articles)

    // Se não for admin, mostrar apenas publicados
    if (published !== 'all') {
      query = query.where(eq(articles.published, true)) as any
    }

    if (category) {
      query = query.where(eq(articles.category, category as string)) as any
    }

    if (search) {
      query = query.where(
        or(
          ilike(articles.title, `%${search}%`),
          ilike(articles.description, `%${search}%`)
        ) as any
      ) as any
    }

    // Aplicar ordenação
    let orderByClause: any
    switch (sortBy) {
      case 'views':
        orderByClause = desc(articles.views)
        break
      case 'downloads':
        orderByClause = desc(articles.downloads)
        break
      case 'comments':
        orderByClause = sql`(SELECT COUNT(*)::int FROM ${articleComments} WHERE ${articleComments.articleId} = ${articles.id}) DESC`
        break
      case 'recent':
      default:
        orderByClause = desc(articles.publishedAt || articles.createdAt)
        break
    }

    const allArticles = await query.orderBy(orderByClause)

    res.json(allArticles)
  } catch (error) {
    console.error('Erro ao buscar artigos:', error)
    res.status(500).json({ error: 'Erro ao buscar artigos' })
  }
})

// Obter artigo por ID
router.get('/:id', async (req, res) => {
  try {
    const article = await db
      .select()
      .from(articles)
      .where(eq(articles.id, parseInt(req.params.id)))
      .limit(1)

    if (article.length === 0) {
      return res.status(404).json({ error: 'Artigo não encontrado' })
    }

    // Incrementar visualizações
    await db
      .update(articles)
      .set({ views: (article[0].views || 0) + 1 })
      .where(eq(articles.id, parseInt(req.params.id)))

    res.json(article[0])
  } catch (error) {
    console.error('Erro ao buscar artigo:', error)
    res.status(500).json({ error: 'Erro ao buscar artigo' })
  }
})

// Obter artigo por slug
router.get('/slug/:slug', async (req, res) => {
  try {
    const article = await db
      .select()
      .from(articles)
      .where(eq(articles.slug, req.params.slug))
      .limit(1)

    if (article.length === 0) {
      return res.status(404).json({ error: 'Artigo não encontrado' })
    }

    // Incrementar visualizações
    await db
      .update(articles)
      .set({ views: (article[0].views || 0) + 1 })
      .where(eq(articles.slug, req.params.slug))

    res.json(article[0])
  } catch (error) {
    console.error('Erro ao buscar artigo:', error)
    res.status(500).json({ error: 'Erro ao buscar artigo' })
  }
})

// Criar novo artigo
router.post('/', async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      description,
      fileUrl,
      published,
      tags,
    } = req.body

    // Gerar slug se não fornecido
    const articleSlug =
      slug ||
      title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    // Validar campos obrigatórios
    if (!title || !fileUrl) {
      return res.status(400).json({ 
        error: 'Título e arquivo PDF são obrigatórios',
        details: !title ? 'Título é obrigatório' : 'Arquivo PDF é obrigatório'
      })
    }

    const [newArticle] = await db
      .insert(articles)
      .values({
        title,
        slug: articleSlug,
        category: category || null,
        description: description || null,
        fileUrl: fileUrl || null,
        published: published || false,
        publishedAt: published ? new Date() : null,
        tags: tags || [],
        downloads: 0,
      })
      .returning()

    res.status(201).json(newArticle)
  } catch (error: any) {
    console.error('Erro ao criar artigo:', error)
    console.error('Detalhes do erro:', error.message)
    console.error('Stack:', error.stack)
    res.status(500).json({ 
      error: 'Erro ao criar artigo',
      details: error.message || 'Erro desconhecido'
    })
  }
})

// Atualizar artigo
router.put('/:id', async (req, res) => {
  try {
    const {
      title,
      slug,
      category,
      description,
      fileUrl,
      published,
      tags,
    } = req.body
    const articleId = parseInt(req.params.id)

    // Buscar artigo existente para verificar se já estava publicado
    const existingArticle = await db
      .select()
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1)

    if (existingArticle.length === 0) {
      return res.status(404).json({ error: 'Artigo não encontrado' })
    }

    // Gerar slug se não fornecido
    const articleSlug =
      slug ||
      title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')

    const updateData: any = {
      title,
      slug: articleSlug,
      category: category || null,
      description: description || null,
      fileUrl,
      published,
      tags: tags || [],
      updatedAt: new Date(),
    }

    // Se está sendo publicado agora e não estava publicado antes
    if (published && !existingArticle[0].publishedAt) {
      updateData.publishedAt = new Date()
    }

    const [updatedArticle] = await db
      .update(articles)
      .set(updateData)
      .where(eq(articles.id, articleId))
      .returning()

    res.json(updatedArticle)
  } catch (error) {
    console.error('Erro ao atualizar artigo:', error)
    res.status(500).json({ error: 'Erro ao atualizar artigo' })
  }
})

// Deletar artigo
router.delete('/:id', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id)

    // Verificar se o artigo existe
    const article = await db
      .select()
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1)

    if (article.length === 0) {
      return res.status(404).json({ error: 'Artigo não encontrado' })
    }

    // Deletar o artigo
    await db.delete(articles).where(eq(articles.id, articleId))

    res.json({ success: true, message: 'Artigo deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar artigo:', error)
    res.status(500).json({ error: 'Erro ao deletar artigo' })
  }
})

// Incrementar contador de downloads
router.post('/:id/download', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id)

    const article = await db
      .select()
      .from(articles)
      .where(eq(articles.id, articleId))
      .limit(1)

    if (article.length === 0) {
      return res.status(404).json({ error: 'Artigo não encontrado' })
    }

    const [updatedArticle] = await db
      .update(articles)
      .set({ downloads: (article[0].downloads || 0) + 1 })
      .where(eq(articles.id, articleId))
      .returning()

    res.json({ success: true, downloads: updatedArticle.downloads })
  } catch (error) {
    console.error('Erro ao incrementar downloads:', error)
    res.status(500).json({ error: 'Erro ao incrementar downloads' })
  }
})

// Comentários de artigos

// Obter comentários de um artigo (com respostas aninhadas)
router.get('/:id/comments', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id)

    // Buscar todos os comentários do artigo
    const allComments = await db
      .select()
      .from(articleComments)
      .where(eq(articleComments.articleId, articleId))
      .orderBy(desc(articleComments.createdAt))

    // Separar comentários principais (sem parent) e respostas
    const mainComments = allComments.filter((c) => !c.parentId)
    const replies = allComments.filter((c) => c.parentId)

    // Organizar respostas por comentário pai
    const commentsWithReplies = mainComments.map((comment) => {
      const commentReplies = replies
        .filter((r) => r.parentId === comment.id)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      return {
        ...comment,
        replies: commentReplies,
      }
    })

    res.json(commentsWithReplies)
  } catch (error) {
    console.error('Erro ao buscar comentários:', error)
    res.status(500).json({ error: 'Erro ao buscar comentários' })
  }
})

// Criar comentário em um artigo (ou resposta a um comentário)
router.post('/:id/comments', async (req, res) => {
  try {
    const articleId = parseInt(req.params.id)
    const { userId, author, avatar, content, parentId } = req.body

    const [newComment] = await db
      .insert(articleComments)
      .values({
        articleId,
        userId,
        parentId: parentId || null,
        author,
        avatar,
        content,
        likes: 0,
      })
      .returning()

    res.status(201).json(newComment)
  } catch (error) {
    console.error('Erro ao criar comentário:', error)
    res.status(500).json({ error: 'Erro ao criar comentário' })
  }
})

// Curtir comentário
router.post('/comments/:id/like', async (req, res) => {
  try {
    const commentId = parseInt(req.params.id)

    const comment = await db
      .select()
      .from(articleComments)
      .where(eq(articleComments.id, commentId))
      .limit(1)

    if (comment.length === 0) {
      return res.status(404).json({ error: 'Comentário não encontrado' })
    }

    const [updatedComment] = await db
      .update(articleComments)
      .set({
        likes: (comment[0].likes || 0) + 1,
        updatedAt: new Date(),
      })
      .where(eq(articleComments.id, commentId))
      .returning()

    res.json(updatedComment)
  } catch (error) {
    console.error('Erro ao curtir comentário:', error)
    res.status(500).json({ error: 'Erro ao curtir comentário' })
  }
})

// Atualizar comentário
router.put('/comments/:id', async (req, res) => {
  try {
    const commentId = parseInt(req.params.id)
    const { content } = req.body

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Conteúdo do comentário é obrigatório' })
    }

    const [updatedComment] = await db
      .update(articleComments)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(eq(articleComments.id, commentId))
      .returning()

    if (updatedComment) {
      res.json(updatedComment)
    } else {
      res.status(404).json({ error: 'Comentário não encontrado' })
    }
  } catch (error) {
    console.error('Erro ao atualizar comentário:', error)
    res.status(500).json({ error: 'Erro ao atualizar comentário' })
  }
})

// Deletar comentário
router.delete('/comments/:id', async (req, res) => {
  try {
    const commentId = parseInt(req.params.id)

    await db.delete(articleComments).where(eq(articleComments.id, commentId))

    res.json({ success: true, message: 'Comentário deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar comentário:', error)
    res.status(500).json({ error: 'Erro ao deletar comentário' })
  }
})

// Upload de PDF para artigo
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    }

    // Construir URL completa do arquivo
    const baseUrl = req.protocol + '://' + req.get('host')
    const fileUrl = `${baseUrl}/uploads/${req.file.filename}`

    res.json({
      success: true,
      fileUrl,
      filename: req.file.filename,
    })
  } catch (error) {
    console.error('Erro ao fazer upload do arquivo:', error)
    res.status(500).json({ error: 'Erro ao fazer upload do arquivo' })
  }
})

export default router

