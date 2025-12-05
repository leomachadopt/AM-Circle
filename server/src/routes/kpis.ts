import { Router } from 'express'
import { db } from '../db/index.js'
import { kpis } from '../db/schema.js'
import { eq, desc, and, gte, lte } from 'drizzle-orm'
import { authenticate, AuthRequest } from '../middleware/auth.js'

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

// Obter KPIs mensais do usuário (últimos 12 meses)
router.get('/monthly', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    // Buscar KPIs dos últimos 12 meses
    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const userKpis = await db
      .select()
      .from(kpis)
      .where(
        and(
          eq(kpis.userId, userId),
          eq(kpis.metric, 'monthly'),
          gte(kpis.date, twelveMonthsAgo)
        )
      )
      .orderBy(kpis.date)

    res.json(userKpis)
  } catch (error) {
    console.error('Erro ao buscar KPIs mensais:', error)
    res.status(500).json({ error: 'Erro ao buscar KPIs mensais' })
  }
})

// Obter KPI de um mês específico
router.get('/month/:year/:month', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id
    const year = parseInt(req.params.year)
    const month = parseInt(req.params.month) - 1 // JavaScript months are 0-indexed

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59)

    const kpi = await db
      .select()
      .from(kpis)
      .where(
        and(
          eq(kpis.userId, userId),
          eq(kpis.metric, 'monthly'),
          gte(kpis.date, startDate),
          lte(kpis.date, endDate)
        )
      )
      .limit(1)

    if (kpi.length === 0) {
      return res.status(404).json({ error: 'KPI não encontrado para este mês' })
    }

    res.json(kpi[0])
  } catch (error) {
    console.error('Erro ao buscar KPI do mês:', error)
    res.status(500).json({ error: 'Erro ao buscar KPI do mês' })
  }
})

// Criar ou atualizar KPI mensal
router.post('/monthly', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id
    const { year, month, revenue, casesPresented, casesClosed } = req.body

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    if (!year || !month || revenue === undefined || casesPresented === undefined || casesClosed === undefined) {
      return res.status(400).json({ error: 'Dados incompletos' })
    }

    const kpiDate = new Date(year, month - 1, 1) // month is 1-indexed in request

    // Verificar se já existe KPI para este mês
    const startDate = new Date(year, month - 1, 1)
    const endDate = new Date(year, month, 0, 23, 59, 59)

    const existing = await db
      .select()
      .from(kpis)
      .where(
        and(
          eq(kpis.userId, userId),
          eq(kpis.metric, 'monthly'),
          gte(kpis.date, startDate),
          lte(kpis.date, endDate)
        )
      )
      .limit(1)

    let result
    if (existing.length > 0) {
      // Atualizar existente
      result = await db
        .update(kpis)
        .set({
          value: revenue, // Usar revenue como valor principal
          metadata: {
            revenue: parseFloat(revenue),
            casesPresented: parseInt(casesPresented),
            casesClosed: parseInt(casesClosed),
          },
          date: kpiDate,
        })
        .where(eq(kpis.id, existing[0].id))
        .returning()
    } else {
      // Criar novo
      result = await db
        .insert(kpis)
        .values({
          userId,
          metric: 'monthly',
          value: revenue,
          date: kpiDate,
          metadata: {
            revenue: parseFloat(revenue),
            casesPresented: parseInt(casesPresented),
            casesClosed: parseInt(casesClosed),
          },
        })
        .returning()
    }

    res.json(result[0])
  } catch (error) {
    console.error('Erro ao salvar KPI mensal:', error)
    res.status(500).json({ error: 'Erro ao salvar KPI mensal' })
  }
})

// Deletar KPI mensal
router.delete('/month/:year/:month', authenticate, async (req: AuthRequest, res) => {
  try {
    const userId = req.user?.id
    const year = parseInt(req.params.year)
    const month = parseInt(req.params.month) - 1

    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' })
    }

    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0, 23, 59, 59)

    await db
      .delete(kpis)
      .where(
        and(
          eq(kpis.userId, userId),
          eq(kpis.metric, 'monthly'),
          gte(kpis.date, startDate),
          lte(kpis.date, endDate)
        )
      )

    res.json({ message: 'KPI deletado com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar KPI:', error)
    res.status(500).json({ error: 'Erro ao deletar KPI' })
  }
})

export default router


