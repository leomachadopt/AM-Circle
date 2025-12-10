import { Router } from 'express'
import { db } from '../db/index.js'
import { posts, comments, users, postLikes } from '../db/schema.js'
import { eq, desc, and } from 'drizzle-orm'
import { uploadPostMedia, compressPostImages } from '../middleware/upload-post.js'
import { authenticate, AuthRequest } from '../middleware/auth.js'

const router = Router()

// Obter todos os posts
router.get('/', async (req, res) => {
  try {
    const allPosts = await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt))

    // Tentar obter userId do token se fornecido
    let userId: number | null = null
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')
      if (token) {
        const jwt = await import('jsonwebtoken')
        const JWT_SECRET = process.env.JWT_SECRET

        if (!JWT_SECRET) {
          throw new Error('JWT_SECRET não definido. Configure a variável de ambiente.')
        }

        const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string; role: string }
        userId = decoded.id
      }
    } catch (error) {
      // Token inválido ou não fornecido, continuar sem userId
      userId = null
    }

    // Se houver usuário autenticado, verificar quais posts ele curtiu
    let likedPostIds: number[] = []
    if (userId) {
      try {
        const userLikes = await db
          .select({ postId: postLikes.postId })
          .from(postLikes)
          .where(eq(postLikes.userId, userId))
        
        likedPostIds = userLikes.map((like) => like.postId)
      } catch (error) {
        console.error('Erro ao buscar likes do usuário:', error)
      }
    }

    // Adicionar informação de like aos posts
    const postsWithLikes = allPosts.map((post) => ({
      ...post,
      isLiked: likedPostIds.includes(post.id),
    }))

    res.json(postsWithLikes)
  } catch (error) {
    console.error('Erro ao buscar posts:', error)
    res.status(500).json({ error: 'Erro ao buscar posts' })
  }
})

// Obter post por ID
router.get('/:id', async (req, res) => {
  try {
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, parseInt(req.params.id)))
      .limit(1)

    if (post.length === 0) {
      return res.status(404).json({ error: 'Post não encontrado' })
    }

    res.json(post[0])
  } catch (error) {
    console.error('Erro ao buscar post:', error)
    res.status(500).json({ error: 'Erro ao buscar post' })
  }
})

// Upload de imagens e arquivos para posts
router.post('/upload', uploadPostMedia.array('media', 10), compressPostImages, (req, res) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' })
    }

    const baseUrl = req.protocol + '://' + req.get('host')
    const uploadedFiles = (req.files as Express.Multer.File[]).map((file) => {
      const isImage = file.mimetype.startsWith('image/')
      const fileUrl = `${baseUrl}/uploads/posts/${isImage ? 'images' : 'files'}/${file.filename}`

      if (isImage) {
        return fileUrl
      } else {
        return {
          url: fileUrl,
          name: file.originalname,
          filename: file.filename,
          size: file.size,
          type: file.mimetype,
        }
      }
    })

    const images = uploadedFiles.filter((f) => typeof f === 'string') as string[]
    const files = uploadedFiles.filter((f) => typeof f === 'object') as Array<{
      url: string
      name: string
      filename: string
      size: number
      type: string
    }>

    res.json({
      success: true,
      images,
      files,
    })
  } catch (error: any) {
    console.error('Erro ao fazer upload:', error)
    res.status(500).json({ error: error.message || 'Erro ao fazer upload do arquivo' })
  }
})

// Criar novo post
router.post('/', async (req, res) => {
  try {
    const { author, avatar, content, topic, userId, images, files } = req.body

    console.log('Recebendo post:', {
      author,
      content: content?.substring(0, 50),
      topic,
      userId,
      imagesType: typeof images,
      imagesValue: images,
      imagesLength: Array.isArray(images) ? images.length : 'not array',
      filesType: typeof files,
      filesValue: files,
    })

    // Parse JSON se vier como string
    let parsedImages = images
    let parsedFiles = files
    if (typeof images === 'string') {
      try {
        parsedImages = JSON.parse(images)
      } catch (e) {
        console.error('Erro ao fazer parse de images:', e)
        parsedImages = null
      }
    }
    if (typeof files === 'string') {
      try {
        parsedFiles = JSON.parse(files)
      } catch (e) {
        console.error('Erro ao fazer parse de files:', e)
        parsedFiles = null
      }
    }

    // Garantir que images seja um array ou null
    if (parsedImages && !Array.isArray(parsedImages)) {
      console.warn('Images não é um array, convertendo:', parsedImages)
      parsedImages = [parsedImages]
    }

    // Garantir que files seja um array ou null
    if (parsedFiles && !Array.isArray(parsedFiles)) {
      console.warn('Files não é um array, convertendo:', parsedFiles)
      parsedFiles = [parsedFiles]
    }

    console.log('Dados processados:', {
      parsedImages,
      parsedFiles,
      imagesIsArray: Array.isArray(parsedImages),
      filesIsArray: Array.isArray(parsedFiles),
    })

    const [newPost] = await db
      .insert(posts)
      .values({
        author,
        avatar,
        content,
        topic,
        userId,
        images: parsedImages && parsedImages.length > 0 ? parsedImages : null,
        files: parsedFiles && parsedFiles.length > 0 ? parsedFiles : null,
        likes: 0,
        comments: 0,
      })
      .returning()

    console.log('Post criado:', {
      id: newPost.id,
      hasImages: !!newPost.images,
      imagesCount: Array.isArray(newPost.images) ? newPost.images.length : 0,
      hasFiles: !!newPost.files,
      filesCount: Array.isArray(newPost.files) ? newPost.files.length : 0,
    })

    res.status(201).json(newPost)
  } catch (error) {
    console.error('Erro ao criar post:', error)
    res.status(500).json({ error: 'Erro ao criar post' })
  }
})

// Curtir/Descurtir post (toggle)
router.post('/:id/like', authenticate, async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.id)
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)

    if (post.length === 0) {
      return res.status(404).json({ error: 'Post não encontrado' })
    }

    // Verificar se o usuário já curtiu o post
    let existingLike
    try {
      existingLike = await db
        .select()
        .from(postLikes)
        .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
        .limit(1)
    } catch (error: any) {
      console.error('Erro ao buscar like existente:', error)
      // Se a tabela não existir, retornar erro mais específico
      if (error.message && error.message.includes('does not exist')) {
        return res.status(500).json({ 
          error: 'Tabela de likes não encontrada. Execute a migration 0011_create_post_likes.sql' 
        })
      }
      throw error
    }

    let updatedPost
    let isLiked

    if (existingLike.length > 0) {
      // Descurtir: remover o like
      try {
        await db
          .delete(postLikes)
          .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
      } catch (error: any) {
        console.error('Erro ao deletar like:', error)
        throw error
      }

      // Atualizar contador de likes
      updatedPost = await db
        .update(posts)
        .set({
          likes: Math.max(0, (post[0].likes || 0) - 1),
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId))
        .returning()

      isLiked = false
    } else {
      // Curtir: adicionar o like
      try {
        await db
          .insert(postLikes)
          .values({
            postId,
            userId,
          })
      } catch (error: any) {
        console.error('Erro ao inserir like:', error)
        // Se for erro de constraint única, significa que já existe (race condition)
        if (error.message && error.message.includes('unique')) {
          // Tentar novamente buscar o like
          const retryLike = await db
            .select()
            .from(postLikes)
            .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
            .limit(1)
          
          if (retryLike.length > 0) {
            // Já existe, então descurtir
            await db
              .delete(postLikes)
              .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
            
            updatedPost = await db
              .update(posts)
              .set({
                likes: Math.max(0, (post[0].likes || 0) - 1),
                updatedAt: new Date(),
              })
              .where(eq(posts.id, postId))
              .returning()
            
            isLiked = false
          } else {
            throw error
          }
        } else {
          throw error
        }
      }

      if (!updatedPost) {
        // Atualizar contador de likes
        updatedPost = await db
          .update(posts)
          .set({
            likes: (post[0].likes || 0) + 1,
            updatedAt: new Date(),
          })
          .where(eq(posts.id, postId))
          .returning()

        isLiked = true
      }
    }

    if (!updatedPost || updatedPost.length === 0) {
      return res.status(500).json({ error: 'Erro ao atualizar post' })
    }

    res.json({
      ...updatedPost[0],
      isLiked,
    })
  } catch (error: any) {
    console.error('Erro ao curtir/descurtir post:', error)
    console.error('Stack trace:', error.stack)
    console.error('Post ID:', req.params.id)
    console.error('User ID:', req.user?.id)
    
    // Mensagem de erro mais específica
    let errorMessage = 'Erro ao curtir/descurtir post'
    if (error.message) {
      if (error.message.includes('does not exist') || error.message.includes('relation') || error.message.includes('table')) {
        errorMessage = 'Tabela de likes não encontrada. Execute a migration: npm run db:migrate'
      } else if (error.message.includes('foreign key') || error.message.includes('constraint')) {
        errorMessage = 'Erro de integridade: verifique se o post e usuário existem'
      } else {
        errorMessage = error.message
      }
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Obter comentários de um post
router.get('/:id/comments', async (req, res) => {
  try {
    const postComments = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        userId: comments.userId,
        content: comments.content,
        createdAt: comments.createdAt,
        updatedAt: comments.updatedAt,
        author: users.name,
        avatar: users.avatar,
      })
      .from(comments)
      .leftJoin(users, eq(comments.userId, users.id))
      .where(eq(comments.postId, parseInt(req.params.id)))
      .orderBy(desc(comments.createdAt))

    res.json(postComments)
  } catch (error) {
    console.error('Erro ao buscar comentários:', error)
    res.status(500).json({ error: 'Erro ao buscar comentários' })
  }
})

// Adicionar comentário
router.post('/:id/comments', async (req, res) => {
  try {
    const { userId, content } = req.body
    const postId = parseInt(req.params.id)

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Conteúdo do comentário é obrigatório' })
    }

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado. Faça login para comentar.' })
    }

    const [newComment] = await db
      .insert(comments)
      .values({
        postId,
        userId,
        content: content.trim(),
      })
      .returning()

    // Buscar informações do usuário se userId foi fornecido
    let userData = null
    if (userId) {
      const user = await db
        .select({
          name: users.name,
          avatar: users.avatar,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1)
      
      if (user.length > 0) {
        userData = user[0]
      }
    }

    // Atualizar contador de comentários
    const post = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)

    if (post.length > 0) {
      await db
        .update(posts)
        .set({
          comments: (post[0].comments || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId))
    }

    // Retornar comentário com informações do usuário
    res.status(201).json({
      ...newComment,
      author: userData?.name || null,
      avatar: userData?.avatar || null,
    })
  } catch (error) {
    console.error('Erro ao criar comentário:', error)
    res.status(500).json({ error: 'Erro ao criar comentário' })
  }
})

// Editar post
router.put('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.id)
    const { content, topic, images, files } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    // Verificar se o post existe e se o usuário é o autor
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' })
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para editar este post' })
    }

    // Parse JSON se vier como string
    let parsedImages = images
    let parsedFiles = files
    if (typeof images === 'string') {
      try {
        parsedImages = JSON.parse(images)
      } catch (e) {
        parsedImages = null
      }
    }
    if (typeof files === 'string') {
      try {
        parsedFiles = JSON.parse(files)
      } catch (e) {
        parsedFiles = null
      }
    }

    // Atualizar post
    const [updatedPost] = await db
      .update(posts)
      .set({
        content: content || post.content,
        topic: topic !== undefined ? topic : post.topic,
        images: parsedImages !== undefined ? parsedImages : post.images,
        files: parsedFiles !== undefined ? parsedFiles : post.files,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId))
      .returning()

    res.json(updatedPost)
  } catch (error) {
    console.error('Erro ao editar post:', error)
    res.status(500).json({ error: 'Erro ao editar post' })
  }
})

// Excluir post
router.delete('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const postId = parseInt(req.params.id)
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    // Verificar se o post existe e se o usuário é o autor
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)

    if (!post) {
      return res.status(404).json({ error: 'Post não encontrado' })
    }

    if (post.userId !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este post' })
    }

    // Excluir todos os comentários do post primeiro
    await db
      .delete(comments)
      .where(eq(comments.postId, postId))

    // Excluir o post
    await db
      .delete(posts)
      .where(eq(posts.id, postId))

    res.json({ message: 'Post excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir post:', error)
    res.status(500).json({ error: 'Erro ao excluir post' })
  }
})

// Editar comentário
router.put('/:postId/comments/:commentId', authenticate, async (req: AuthRequest, res) => {
  try {
    const commentId = parseInt(req.params.commentId)
    const { content } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Conteúdo do comentário é obrigatório' })
    }

    // Verificar se o comentário existe e se o usuário é o autor
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1)

    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado' })
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para editar este comentário' })
    }

    // Atualizar comentário
    const [updatedComment] = await db
      .update(comments)
      .set({
        content: content.trim(),
        updatedAt: new Date(),
      })
      .where(eq(comments.id, commentId))
      .returning()

    // Buscar informações do usuário
    const [user] = await db
      .select({
        name: users.name,
        avatar: users.avatar,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    res.json({
      ...updatedComment,
      author: user?.name || null,
      avatar: user?.avatar || null,
    })
  } catch (error) {
    console.error('Erro ao editar comentário:', error)
    res.status(500).json({ error: 'Erro ao editar comentário' })
  }
})

// Excluir comentário
router.delete('/:postId/comments/:commentId', authenticate, async (req: AuthRequest, res) => {
  try {
    const commentId = parseInt(req.params.commentId)
    const postId = parseInt(req.params.postId)
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    // Verificar se o comentário existe e se o usuário é o autor
    const [comment] = await db
      .select()
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1)

    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado' })
    }

    if (comment.userId !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para excluir este comentário' })
    }

    // Excluir comentário
    await db
      .delete(comments)
      .where(eq(comments.id, commentId))

    // Atualizar contador de comentários do post
    const [post] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1)

    if (post) {
      await db
        .update(posts)
        .set({
          comments: Math.max(0, (post.comments || 0) - 1),
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId))
    }

    res.json({ message: 'Comentário excluído com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir comentário:', error)
    res.status(500).json({ error: 'Erro ao excluir comentário' })
  }
})

export default router


