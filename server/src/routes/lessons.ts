import { Router } from 'express'
import { db } from '../db/index.js'
import { lessons, userLessons, modules } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'

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

// Obter aula por ID
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

    res.json(lesson[0])
  } catch (error) {
    console.error('Erro ao buscar aula:', error)
    res.status(500).json({ error: 'Erro ao buscar aula' })
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

    // Deletar a aula
    await db.delete(lessons).where(eq(lessons.id, lessonId))

    res.json({ success: true, message: 'Aula deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar aula:', error)
    res.status(500).json({ error: 'Erro ao deletar aula' })
  }
})

export default router

