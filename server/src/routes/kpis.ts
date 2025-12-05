import { Router } from 'express'
import { db } from '../db/index.js'
import { kpis } from '../db/schema.js'
import { eq, desc } from 'drizzle-orm'

const router = Router()

// Obter KPIs de um usuário
router.get('/user/:userId', async (req, res) => {
  try {
    const userKpis = await db
      .select()
      .from(kpis)
      .where(eq(kpis.userId, parseInt(req.params.userId)))
      .orderBy(desc(kpis.date))

    res.json(userKpis)
  } catch (error) {
    console.error('Erro ao buscar KPIs:', error)
    res.status(500).json({ error: 'Erro ao buscar KPIs' })
  }
})

// Criar novo KPI
router.post('/', async (req, res) => {
  try {
    const { userId, metric, value, date, metadata } = req.body

    const [newKpi] = await db
      .insert(kpis)
      .values({
        userId,
        metric,
        value,
        date: date ? new Date(date) : new Date(),
        metadata,
      })
      .returning()

    res.status(201).json(newKpi)
  } catch (error) {
    console.error('Erro ao criar KPI:', error)
    res.status(500).json({ error: 'Erro ao criar KPI' })
  }
})

export default router


