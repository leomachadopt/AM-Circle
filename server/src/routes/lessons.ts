import { Router } from 'express'
import { db } from '../db/index.js'
import { lessons, userLessons, modules, lessonActivationTasks, userActivationTasks, lessonMaterials, lessonComments } from '../db/schema.js'
import { eq, and, desc } from 'drizzle-orm'

const router = Router()

// Obter todas as aulas
router.get('/', async (req, res) => {
  try {
    const allLessons = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        duration: lessons.duration,
        module: lessons.module,
        moduleId: lessons.moduleId,
        videoUrl: lessons.videoUrl,
        imageUrl: lessons.imageUrl,
        description: lessons.description,
        order: lessons.order,
      })
      .from(lessons)
      .orderBy(lessons.order)

    res.json(allLessons)
  } catch (error) {
    console.error('Erro ao buscar aulas:', error)
    res.status(500).json({ error: 'Erro ao buscar aulas' })
  }
})

// Obter aula por ID (com tarefas e materiais)
router.get('/:id', async (req, res) => {
  try {
    const lesson = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, parseInt(req.params.id)))
      .limit(1)

    if (lesson.length === 0) {
      return res.status(404).json({ error: 'Aula não encontrada' })
    }

    // Buscar tarefas de ativação (com tratamento de erro caso a tabela não exista)
    let tasks = []
    try {
      tasks = await db
        .select()
        .from(lessonActivationTasks)
        .where(eq(lessonActivationTasks.lessonId, parseInt(req.params.id)))
        .orderBy(lessonActivationTasks.order)
    } catch (error: any) {
      // Se a tabela não existir, retorna array vazio
      if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
        console.log('Tabela lesson_activation_tasks não existe ainda. Retornando array vazio.')
        tasks = []
      } else {
        throw error
      }
    }

    // Buscar materiais (com tratamento de erro caso a tabela não exista)
    let materials = []
    try {
      materials = await db
        .select()
        .from(lessonMaterials)
        .where(eq(lessonMaterials.lessonId, parseInt(req.params.id)))
        .orderBy(lessonMaterials.order)
    } catch (error: any) {
      // Se a tabela não existir, retorna array vazio
      if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
        console.log('Tabela lesson_materials não existe ainda. Retornando array vazio.')
        materials = []
      } else {
        throw error
      }
    }

    res.json({
      ...lesson[0],
      activationTasks: tasks,
      materials: materials,
    })
  } catch (error: any) {
    console.error('Erro ao buscar aula:', error)
    console.error('Detalhes:', error.message)
    res.status(500).json({ 
      error: 'Erro ao buscar aula',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Obter progresso do usuário em uma aula
router.get('/:id/progress/:userId', async (req, res) => {
  try {
    const progress = await db
      .select()
      .from(userLessons)
      .where(
        and(
          eq(userLessons.lessonId, parseInt(req.params.id)),
          eq(userLessons.userId, parseInt(req.params.userId))
        )
      )
      .limit(1)

    if (progress.length === 0) {
      return res.json({ completed: false, progress: 0 })
    }

    res.json(progress[0])
  } catch (error) {
    console.error('Erro ao buscar progresso:', error)
    res.status(500).json({ error: 'Erro ao buscar progresso' })
  }
})

// Atualizar progresso do usuário
router.post('/:id/progress', async (req, res) => {
  try {
    const { userId, completed, progress } = req.body
    const lessonId = parseInt(req.params.id)

    const existing = await db
      .select()
      .from(userLessons)
      .where(
        and(
          eq(userLessons.lessonId, lessonId),
          eq(userLessons.userId, userId)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(userLessons)
        .set({
          completed,
          progress: progress || existing[0].progress,
          completedAt: completed ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(userLessons.id, existing[0].id))
    } else {
      await db.insert(userLessons).values({
        userId,
        lessonId,
        completed: completed || false,
        progress: progress || 0,
        completedAt: completed ? new Date() : null,
      })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar progresso:', error)
    res.status(500).json({ error: 'Erro ao atualizar progresso' })
  }
})

// Obter aulas com progresso do usuário
router.get('/user/:userId', async (req, res) => {
  try {
    const userId = parseInt(req.params.userId)

    const userLessonsData = await db
      .select({
        id: lessons.id,
        title: lessons.title,
        duration: lessons.duration,
        module: lessons.module,
        completed: userLessons.completed,
        progress: userLessons.progress,
      })
      .from(lessons)
      .leftJoin(
        userLessons,
        and(
          eq(lessons.id, userLessons.lessonId),
          eq(userLessons.userId, userId)
        )
      )
      .orderBy(lessons.order)

    res.json(userLessonsData)
  } catch (error) {
    console.error('Erro ao buscar aulas do usuário:', error)
    res.status(500).json({ error: 'Erro ao buscar aulas do usuário' })
  }
})

// Criar nova aula
router.post('/', async (req, res) => {
  try {
    const { title, duration, module, moduleId, videoUrl, imageUrl, description, order } =
      req.body

    const [newLesson] = await db
      .insert(lessons)
      .values({
        title,
        duration,
        module,
        moduleId,
        videoUrl,
        imageUrl,
        description,
        order: order || 0,
      })
      .returning()

    res.status(201).json(newLesson)
  } catch (error) {
    console.error('Erro ao criar aula:', error)
    res.status(500).json({ error: 'Erro ao criar aula' })
  }
})

// Atualizar aula
router.put('/:id', async (req, res) => {
  try {
    const { title, duration, module, moduleId, videoUrl, imageUrl, description, order } =
      req.body
    const lessonId = parseInt(req.params.id)

    const [updatedLesson] = await db
      .update(lessons)
      .set({
        title,
        duration,
        module,
        moduleId,
        videoUrl,
        imageUrl,
        description,
        order,
        updatedAt: new Date(),
      })
      .where(eq(lessons.id, lessonId))
      .returning()

    if (!updatedLesson) {
      return res.status(404).json({ error: 'Aula não encontrada' })
    }

    res.json(updatedLesson)
  } catch (error) {
    console.error('Erro ao atualizar aula:', error)
    res.status(500).json({ error: 'Erro ao atualizar aula' })
  }
})

// Deletar aula
router.delete('/:id', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id)

    // Verificar se a aula existe
    const lesson = await db
      .select()
      .from(lessons)
      .where(eq(lessons.id, lessonId))
      .limit(1)

    if (lesson.length === 0) {
      return res.status(404).json({ error: 'Aula não encontrada' })
    }

    // Deletar progressos relacionados primeiro
    await db
      .delete(userLessons)
      .where(eq(userLessons.lessonId, lessonId))

    // Deletar tarefas de ativação e progressos relacionados (se as tabelas existirem)
    try {
      const tasks = await db
        .select()
        .from(lessonActivationTasks)
        .where(eq(lessonActivationTasks.lessonId, lessonId))

      for (const task of tasks) {
        try {
          await db
            .delete(userActivationTasks)
            .where(eq(userActivationTasks.taskId, task.id))
        } catch (error: any) {
          // Ignora se a tabela não existir
          if (!error.message?.includes('does not exist') && !error.message?.includes('relation')) {
            throw error
          }
        }
      }

      await db
        .delete(lessonActivationTasks)
        .where(eq(lessonActivationTasks.lessonId, lessonId))
    } catch (error: any) {
      // Ignora se as tabelas não existirem
      if (!error.message?.includes('does not exist') && !error.message?.includes('relation')) {
        throw error
      }
    }

    // Deletar materiais (se a tabela existir)
    try {
      await db
        .delete(lessonMaterials)
        .where(eq(lessonMaterials.lessonId, lessonId))
    } catch (error: any) {
      // Ignora se a tabela não existir
      if (!error.message?.includes('does not exist') && !error.message?.includes('relation')) {
        throw error
      }
    }

    // Deletar comentários (se a tabela existir)
    try {
      await db
        .delete(lessonComments)
        .where(eq(lessonComments.lessonId, lessonId))
    } catch (error: any) {
      // Ignora se a tabela não existir
      if (!error.message?.includes('does not exist') && !error.message?.includes('relation')) {
        throw error
      }
    }

    // Deletar a aula
    await db.delete(lessons).where(eq(lessons.id, lessonId))

    res.json({ success: true, message: 'Aula deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar aula:', error)
    res.status(500).json({ error: 'Erro ao deletar aula' })
  }
})

// ========== TAREFAS DE ATIVAÇÃO ==========

// Obter tarefas de ativação de uma aula
router.get('/:id/activation-tasks', async (req, res) => {
  try {
    const tasks = await db
      .select()
      .from(lessonActivationTasks)
      .where(eq(lessonActivationTasks.lessonId, parseInt(req.params.id)))
      .orderBy(lessonActivationTasks.order)

    res.json(tasks)
  } catch (error) {
    console.error('Erro ao buscar tarefas:', error)
    res.status(500).json({ error: 'Erro ao buscar tarefas' })
  }
})

// Criar tarefa de ativação
router.post('/:id/activation-tasks', async (req, res) => {
  try {
    const { title, order } = req.body
    const lessonId = parseInt(req.params.id)

    const [newTask] = await db
      .insert(lessonActivationTasks)
      .values({
        lessonId,
        title,
        order: order || 0,
      })
      .returning()

    res.status(201).json(newTask)
  } catch (error) {
    console.error('Erro ao criar tarefa:', error)
    res.status(500).json({ error: 'Erro ao criar tarefa' })
  }
})

// Atualizar tarefa de ativação
router.put('/activation-tasks/:taskId', async (req, res) => {
  try {
    const { title, order } = req.body
    const taskId = parseInt(req.params.taskId)

    const [updatedTask] = await db
      .update(lessonActivationTasks)
      .set({
        title,
        order,
        updatedAt: new Date(),
      })
      .where(eq(lessonActivationTasks.id, taskId))
      .returning()

    if (!updatedTask) {
      return res.status(404).json({ error: 'Tarefa não encontrada' })
    }

    res.json(updatedTask)
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error)
    res.status(500).json({ error: 'Erro ao atualizar tarefa' })
  }
})

// Deletar tarefa de ativação
router.delete('/activation-tasks/:taskId', async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId)

    // Deletar progressos relacionados
    await db
      .delete(userActivationTasks)
      .where(eq(userActivationTasks.taskId, taskId))

    // Deletar a tarefa
    await db.delete(lessonActivationTasks).where(eq(lessonActivationTasks.id, taskId))

    res.json({ success: true, message: 'Tarefa deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar tarefa:', error)
    res.status(500).json({ error: 'Erro ao deletar tarefa' })
  }
})

// Atualizar progresso do usuário em uma tarefa
router.post('/activation-tasks/:taskId/complete', async (req, res) => {
  try {
    const { userId, completed } = req.body
    const taskId = parseInt(req.params.taskId)

    const existing = await db
      .select()
      .from(userActivationTasks)
      .where(
        and(
          eq(userActivationTasks.taskId, taskId),
          eq(userActivationTasks.userId, userId)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(userActivationTasks)
        .set({
          completed,
          completedAt: completed ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(userActivationTasks.id, existing[0].id))
    } else {
      await db.insert(userActivationTasks).values({
        userId,
        taskId,
        completed: completed || false,
        completedAt: completed ? new Date() : null,
      })
    }

    res.json({ success: true })
  } catch (error) {
    console.error('Erro ao atualizar progresso da tarefa:', error)
    res.status(500).json({ error: 'Erro ao atualizar progresso da tarefa' })
  }
})

// Obter progresso do usuário nas tarefas de uma aula
router.get('/:id/activation-tasks/user/:userId', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id)
    const userId = parseInt(req.params.userId)

    const tasks = await db
      .select({
        id: lessonActivationTasks.id,
        lessonId: lessonActivationTasks.lessonId,
        title: lessonActivationTasks.title,
        order: lessonActivationTasks.order,
        completed: userActivationTasks.completed,
        completedAt: userActivationTasks.completedAt,
      })
      .from(lessonActivationTasks)
      .leftJoin(
        userActivationTasks,
        and(
          eq(lessonActivationTasks.id, userActivationTasks.taskId),
          eq(userActivationTasks.userId, userId)
        )
      )
      .where(eq(lessonActivationTasks.lessonId, lessonId))
      .orderBy(lessonActivationTasks.order)

    res.json(tasks)
  } catch (error) {
    console.error('Erro ao buscar progresso das tarefas:', error)
    res.status(500).json({ error: 'Erro ao buscar progresso das tarefas' })
  }
})

// ========== MATERIAIS ==========

// Obter materiais de uma aula
router.get('/:id/materials', async (req, res) => {
  try {
    const materials = await db
      .select()
      .from(lessonMaterials)
      .where(eq(lessonMaterials.lessonId, parseInt(req.params.id)))
      .orderBy(lessonMaterials.order)

    res.json(materials)
  } catch (error) {
    console.error('Erro ao buscar materiais:', error)
    res.status(500).json({ error: 'Erro ao buscar materiais' })
  }
})

// Criar material
router.post('/:id/materials', async (req, res) => {
  try {
    const { title, fileUrl, fileType, fileSize, order } = req.body
    const lessonId = parseInt(req.params.id)

    const [newMaterial] = await db
      .insert(lessonMaterials)
      .values({
        lessonId,
        title,
        fileUrl,
        fileType,
        fileSize,
        order: order || 0,
      })
      .returning()

    res.status(201).json(newMaterial)
  } catch (error) {
    console.error('Erro ao criar material:', error)
    res.status(500).json({ error: 'Erro ao criar material' })
  }
})

// Atualizar material
router.put('/materials/:materialId', async (req, res) => {
  try {
    const { title, fileUrl, fileType, fileSize, order } = req.body
    const materialId = parseInt(req.params.materialId)

    const [updatedMaterial] = await db
      .update(lessonMaterials)
      .set({
        title,
        fileUrl,
        fileType,
        fileSize,
        order,
        updatedAt: new Date(),
      })
      .where(eq(lessonMaterials.id, materialId))
      .returning()

    if (!updatedMaterial) {
      return res.status(404).json({ error: 'Material não encontrado' })
    }

    res.json(updatedMaterial)
  } catch (error) {
    console.error('Erro ao atualizar material:', error)
    res.status(500).json({ error: 'Erro ao atualizar material' })
  }
})

// Deletar material
router.delete('/materials/:materialId', async (req, res) => {
  try {
    const materialId = parseInt(req.params.materialId)

    await db.delete(lessonMaterials).where(eq(lessonMaterials.id, materialId))

    res.json({ success: true, message: 'Material deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar material:', error)
    res.status(500).json({ error: 'Erro ao deletar material' })
  }
})

// ========== COMENTÁRIOS/DÚVIDAS ==========

// Obter comentários de uma aula (com respostas aninhadas)
router.get('/:id/comments', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id)

    // Buscar todos os comentários da aula
    const allComments = await db
      .select()
      .from(lessonComments)
      .where(eq(lessonComments.lessonId, lessonId))
      .orderBy(desc(lessonComments.createdAt))

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
  } catch (error: any) {
    console.error('Erro ao buscar comentários:', error)
    // Se a tabela não existir, retornar array vazio
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      console.log('Tabela lesson_comments não existe ainda. Retornando array vazio.')
      return res.json([])
    }
    res.status(500).json({ 
      error: 'Erro ao buscar comentários',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Criar comentário em uma aula (ou resposta a um comentário)
router.post('/:id/comments', async (req, res) => {
  try {
    const lessonId = parseInt(req.params.id)
    const { userId, author, avatar, content, parentId } = req.body

    if (!userId || !author || !content) {
      return res.status(400).json({ error: 'Campos obrigatórios: userId, author, content' })
    }

    const [newComment] = await db
      .insert(lessonComments)
      .values({
        lessonId,
        userId,
        parentId: parentId || null,
        author,
        avatar: avatar || null,
        content,
        likes: 0,
      })
      .returning()

    res.status(201).json(newComment)
  } catch (error: any) {
    console.error('Erro ao criar comentário:', error)
    console.error('Detalhes:', error.message)
    
    // Se a tabela não existir, retornar erro informativo
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.status(500).json({ 
        error: 'Tabela de comentários não encontrada. Execute a migração: npm run db:create-lesson-tasks',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      })
    }
    
    res.status(500).json({ 
      error: 'Erro ao criar comentário',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Atualizar comentário
router.put('/comments/:commentId', async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId)
    const { content } = req.body

    const [updatedComment] = await db
      .update(lessonComments)
      .set({
        content,
        updatedAt: new Date(),
      })
      .where(eq(lessonComments.id, commentId))
      .returning()

    if (!updatedComment) {
      return res.status(404).json({ error: 'Comentário não encontrado' })
    }

    res.json(updatedComment)
  } catch (error) {
    console.error('Erro ao atualizar comentário:', error)
    res.status(500).json({ error: 'Erro ao atualizar comentário' })
  }
})

// Deletar comentário
router.delete('/comments/:commentId', async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId)

    // Deletar respostas primeiro (se houver)
    try {
      await db
        .delete(lessonComments)
        .where(eq(lessonComments.parentId, commentId))
    } catch (error: any) {
      // Ignora se a tabela não existir
      if (!error.message?.includes('does not exist') && !error.message?.includes('relation')) {
        throw error
      }
    }

    // Deletar o comentário
    await db.delete(lessonComments).where(eq(lessonComments.id, commentId))

    res.json({ success: true, message: 'Comentário deletado com sucesso' })
  } catch (error: any) {
    console.error('Erro ao deletar comentário:', error)
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.status(500).json({ 
        error: 'Tabela de comentários não encontrada. Execute a migração: npm run db:create-lesson-tasks'
      })
    }
    res.status(500).json({ 
      error: 'Erro ao deletar comentário',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Curtir comentário
router.post('/comments/:commentId/like', async (req, res) => {
  try {
    const commentId = parseInt(req.params.commentId)

    const [comment] = await db
      .select()
      .from(lessonComments)
      .where(eq(lessonComments.id, commentId))
      .limit(1)

    if (!comment) {
      return res.status(404).json({ error: 'Comentário não encontrado' })
    }

    await db
      .update(lessonComments)
      .set({
        likes: (comment.likes || 0) + 1,
      })
      .where(eq(lessonComments.id, commentId))

    res.json({ success: true })
  } catch (error: any) {
    console.error('Erro ao curtir comentário:', error)
    if (error.message?.includes('does not exist') || error.message?.includes('relation')) {
      return res.status(500).json({ 
        error: 'Tabela de comentários não encontrada. Execute a migração: npm run db:create-lesson-tasks'
      })
    }
    res.status(500).json({ 
      error: 'Erro ao curtir comentário',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router

