import { Router } from 'express'
import { db } from '../db/index.js'
import { events } from '../db/schema.js'
import { eq, desc } from 'drizzle-orm'

const router = Router()

// Obter todos os eventos
router.get('/', async (req, res) => {
  try {
    const allEvents = await db
      .select()
      .from(events)
      .orderBy(desc(events.date))

    res.json(allEvents)
  } catch (error) {
    console.error('Erro ao buscar eventos:', error)
    res.status(500).json({ error: 'Erro ao buscar eventos' })
  }
})

// Obter evento por ID
router.get('/:id', async (req, res) => {
  try {
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, parseInt(req.params.id)))
      .limit(1)

    if (event.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    res.json(event[0])
  } catch (error) {
    console.error('Erro ao buscar evento:', error)
    res.status(500).json({ error: 'Erro ao buscar evento' })
  }
})

// Obter eventos por tipo
router.get('/type/:type', async (req, res) => {
  try {
    const eventsList = await db
      .select()
      .from(events)
      .where(eq(events.type, req.params.type))
      .orderBy(desc(events.date))

    res.json(eventsList)
  } catch (error) {
    console.error('Erro ao buscar eventos por tipo:', error)
    res.status(500).json({ error: 'Erro ao buscar eventos por tipo' })
  }
})

// Criar novo evento
router.post('/', async (req, res) => {
  try {
    const { title, date, type, description, videoUrl, meetingUrl } = req.body

    const [newEvent] = await db
      .insert(events)
      .values({
        title,
        date: new Date(date),
        type,
        description,
        videoUrl,
        meetingUrl,
      })
      .returning()

    res.status(201).json(newEvent)
  } catch (error) {
    console.error('Erro ao criar evento:', error)
    res.status(500).json({ error: 'Erro ao criar evento' })
  }
})

// Atualizar evento
router.put('/:id', async (req, res) => {
  try {
    const { title, date, type, description, videoUrl, meetingUrl } = req.body
    const eventId = parseInt(req.params.id)

    const [updatedEvent] = await db
      .update(events)
      .set({
        title,
        date: new Date(date),
        type,
        description,
        videoUrl,
        meetingUrl,
        updatedAt: new Date(),
      })
      .where(eq(events.id, eventId))
      .returning()

    if (!updatedEvent) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    res.json(updatedEvent)
  } catch (error) {
    console.error('Erro ao atualizar evento:', error)
    res.status(500).json({ error: 'Erro ao atualizar evento' })
  }
})

// Deletar evento
router.delete('/:id', async (req, res) => {
  try {
    const eventId = parseInt(req.params.id)

    // Verificar se o evento existe
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1)

    if (event.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    // Deletar o evento
    await db.delete(events).where(eq(events.id, eventId))

    res.json({ success: true, message: 'Evento deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar evento:', error)
    res.status(500).json({ error: 'Erro ao deletar evento' })
  }
})

export default router


