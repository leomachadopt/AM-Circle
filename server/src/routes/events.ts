import { Router } from 'express'
import { db } from '../db/index.js'
import { events, eventRegistrations, users } from '../db/schema.js'
import { eq, desc, and, gte } from 'drizzle-orm'
import { authenticate, AuthRequest } from '../middleware/auth.js'
import { uploadEventImage, compressEventImage } from '../middleware/upload-event-image.js'

const router = Router()

// Obter todos os eventos
router.get('/', async (req, res) => {
  try {
    const { futureOnly } = req.query
    const now = new Date()

    let allEvents

    if (futureOnly === 'true') {
      // Filtrar apenas eventos futuros
      allEvents = await db
        .select({
          id: events.id,
          title: events.title,
          date: events.date,
          type: events.type,
          description: events.description,
          imageUrl: events.imageUrl,
          videoUrl: events.videoUrl,
          meetingUrl: events.meetingUrl,
          address: events.address,
          createdAt: events.createdAt,
          updatedAt: events.updatedAt,
        })
        .from(events)
        .where(gte(events.date, now))
        .orderBy(events.date)
    } else {
      // Buscar todos os eventos
      allEvents = await db
        .select({
          id: events.id,
          title: events.title,
          date: events.date,
          type: events.type,
          description: events.description,
          imageUrl: events.imageUrl,
          videoUrl: events.videoUrl,
          meetingUrl: events.meetingUrl,
          address: events.address,
          createdAt: events.createdAt,
          updatedAt: events.updatedAt,
        })
        .from(events)
        .orderBy(desc(events.date))
    }

    res.json(allEvents)
  } catch (error: any) {
    console.error('Erro ao buscar eventos:', error)
    console.error('Detalhes do erro:', error.message)
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
    res.status(500).json({ 
      error: 'Erro ao buscar eventos',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
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

// Upload de imagem para evento
router.post('/upload-image', uploadEventImage.single('image'), compressEventImage, (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada' })
    }

    const baseUrl = req.protocol + '://' + req.get('host')
    const imageUrl = `${baseUrl}/uploads/events/images/${req.file.filename}`

    res.json({
      success: true,
      imageUrl,
    })
  } catch (error: any) {
    console.error('Erro ao fazer upload da imagem:', error)
    console.error('Stack trace:', error.stack)
    res.status(500).json({ 
      error: error.message || 'Erro ao fazer upload da imagem',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

// Criar novo evento
router.post('/', async (req, res) => {
  try {
    const { title, date, type, description, imageUrl, videoUrl, meetingUrl, address } = req.body

    const [newEvent] = await db
      .insert(events)
      .values({
        title,
        date: new Date(date),
        type,
        description,
        imageUrl,
        videoUrl,
        meetingUrl,
        address,
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
    const { title, date, type, description, imageUrl, videoUrl, meetingUrl, address } = req.body
    const eventId = parseInt(req.params.id)

    const [updatedEvent] = await db
      .update(events)
      .set({
        title,
        date: new Date(date),
        type,
        description,
        imageUrl,
        videoUrl,
        meetingUrl,
        address,
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

// Confirmar participação em evento
router.post('/:id/register', authenticate, async (req: AuthRequest, res) => {
  try {
    const eventId = parseInt(req.params.id)
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    // Verificar se o evento existe
    const event = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1)

    if (event.length === 0) {
      return res.status(404).json({ error: 'Evento não encontrado' })
    }

    // Verificar se já está registrado
    const existingRegistration = await db
      .select()
      .from(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, userId)))
      .limit(1)

    if (existingRegistration.length > 0) {
      return res.status(400).json({ error: 'Você já está registrado neste evento' })
    }

    // Criar registro
    const [registration] = await db
      .insert(eventRegistrations)
      .values({
        eventId,
        userId,
      })
      .returning()

    res.status(201).json(registration)
  } catch (error: any) {
    console.error('Erro ao confirmar participação:', error)
    res.status(500).json({ error: error.message || 'Erro ao confirmar participação' })
  }
})

// Cancelar participação em evento
router.delete('/:id/register', authenticate, async (req: AuthRequest, res) => {
  try {
    const eventId = parseInt(req.params.id)
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    // Verificar se o registro existe
    const registration = await db
      .select()
      .from(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, userId)))
      .limit(1)

    if (registration.length === 0) {
      return res.status(404).json({ error: 'Registro não encontrado' })
    }

    // Deletar registro
    await db
      .delete(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, userId)))

    res.json({ success: true, message: 'Participação cancelada com sucesso' })
  } catch (error: any) {
    console.error('Erro ao cancelar participação:', error)
    res.status(500).json({ error: error.message || 'Erro ao cancelar participação' })
  }
})

// Obter participantes de um evento (apenas admin)
router.get('/:id/participants', authenticate, async (req: AuthRequest, res) => {
  try {
    const eventId = parseInt(req.params.id)
    const user = req.user

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    // Buscar registros com informações do usuário
    const participants = await db
      .select({
        id: eventRegistrations.id,
        userId: users.id,
        userName: users.name,
        userEmail: users.email,
        userAvatar: users.avatar,
        registeredAt: eventRegistrations.createdAt,
      })
      .from(eventRegistrations)
      .innerJoin(users, eq(eventRegistrations.userId, users.id))
      .where(eq(eventRegistrations.eventId, eventId))
      .orderBy(desc(eventRegistrations.createdAt))

    res.json(participants)
  } catch (error) {
    console.error('Erro ao buscar participantes:', error)
    res.status(500).json({ error: 'Erro ao buscar participantes' })
  }
})

// Verificar se usuário está registrado em um evento
router.get('/:id/register/status', authenticate, async (req: AuthRequest, res) => {
  try {
    const eventId = parseInt(req.params.id)
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const registration = await db
      .select()
      .from(eventRegistrations)
      .where(and(eq(eventRegistrations.eventId, eventId), eq(eventRegistrations.userId, userId)))
      .limit(1)

    res.json({ isRegistered: registration.length > 0 })
  } catch (error) {
    console.error('Erro ao verificar status de registro:', error)
    res.status(500).json({ error: 'Erro ao verificar status de registro' })
  }
})

export default router


