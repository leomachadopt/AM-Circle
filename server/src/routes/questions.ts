import { Router } from 'express'
import { db } from '../db/index.js'
import { mentorshipQuestions, users } from '../db/schema.js'
import { eq, desc } from 'drizzle-orm'

const router = Router()

// Obter todas as perguntas
router.get('/', async (req, res) => {
  try {
    const allQuestions = await db
      .select()
      .from(mentorshipQuestions)
      .orderBy(desc(mentorshipQuestions.createdAt))

    res.json(allQuestions)
  } catch (error) {
    console.error('Erro ao buscar perguntas:', error)
    res.status(500).json({ error: 'Erro ao buscar perguntas' })
  }
})

// Obter perguntas de um usuário
router.get('/user/:userId', async (req, res) => {
  try {
    const userQuestions = await db
      .select()
      .from(mentorshipQuestions)
      .where(eq(mentorshipQuestions.userId, parseInt(req.params.userId)))
      .orderBy(desc(mentorshipQuestions.createdAt))

    res.json(userQuestions)
  } catch (error) {
    console.error('Erro ao buscar perguntas do usuário:', error)
    res.status(500).json({ error: 'Erro ao buscar perguntas do usuário' })
  }
})

// Criar nova pergunta
router.post('/', async (req, res) => {
  try {
    const { userId, subject, question, eventId } = req.body

    const [newQuestion] = await db
      .insert(mentorshipQuestions)
      .values({
        userId,
        subject,
        question,
        eventId,
        answered: false,
      })
      .returning()

    res.status(201).json(newQuestion)
  } catch (error) {
    console.error('Erro ao criar pergunta:', error)
    res.status(500).json({ error: 'Erro ao criar pergunta' })
  }
})

// Marcar pergunta como respondida
router.put('/:id/answer', async (req, res) => {
  try {
    const [updatedQuestion] = await db
      .update(mentorshipQuestions)
      .set({
        answered: true,
        updatedAt: new Date(),
      })
      .where(eq(mentorshipQuestions.id, parseInt(req.params.id)))
      .returning()

    if (!updatedQuestion) {
      return res.status(404).json({ error: 'Pergunta não encontrada' })
    }

    res.json(updatedQuestion)
  } catch (error) {
    console.error('Erro ao atualizar pergunta:', error)
    res.status(500).json({ error: 'Erro ao atualizar pergunta' })
  }
})

export default router


