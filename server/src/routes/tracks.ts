import { Router } from 'express'
import { db } from '../db/index.js'
import { tracks, trackItems, articles, lessons, tools, userTrackItems } from '../db/schema.js'
import { eq, and, asc, desc } from 'drizzle-orm'

const router = Router()

// Obter todas as trilhas
router.get('/', async (req, res) => {
  try {
    // Filtrar apenas trilhas publicadas se o parâmetro published=true for passado
    const publishedOnly = req.query.published === 'true'
    
    const allTracks = publishedOnly
      ? await db.select().from(tracks).where(eq(tracks.published, true)).orderBy(desc(tracks.createdAt))
      : await db.select().from(tracks).orderBy(desc(tracks.createdAt))
    
    // Buscar itens de cada trilha
    const tracksWithItems = await Promise.all(
      allTracks.map(async (track) => {
        const items = await db
          .select()
          .from(trackItems)
          .where(eq(trackItems.trackId, track.id))
          .orderBy(asc(trackItems.order))

        // Buscar detalhes dos itens
        const itemsWithDetails = await Promise.all(
          items.map(async (item) => {
            let details = null
            try {
              if (item.type === 'article') {
                const article = await db
                  .select()
                  .from(articles)
                  .where(eq(articles.id, item.itemId))
                  .limit(1)
                details = article[0] || null
              } else if (item.type === 'lesson') {
                const lesson = await db
                  .select()
                  .from(lessons)
                  .where(eq(lessons.id, item.itemId))
                  .limit(1)
                details = lesson[0] || null
              } else if (item.type === 'tool') {
                const tool = await db
                  .select()
                  .from(tools)
                  .where(eq(tools.id, item.itemId))
                  .limit(1)
                details = tool[0] || null
              }
            } catch (itemError) {
              console.error(`Erro ao buscar detalhes do item ${item.id}:`, itemError)
              // Continuar mesmo se houver erro ao buscar detalhes
            }

            return {
              ...item,
              details,
            }
          })
        )

        return {
          ...track,
          items: itemsWithDetails,
        }
      })
    )

    res.json(tracksWithItems)
  } catch (error: any) {
    console.error('Erro ao buscar trilhas:', error)
    console.error('Detalhes do erro:', error.message)
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
    
    // Mensagem de erro mais específica
    let errorMessage = 'Erro ao buscar trilhas'
    if (error.message) {
      if (error.message.includes('does not exist') || error.message.includes('relation') || error.message.includes('table')) {
        errorMessage = 'Tabelas de trilhas não encontradas. Execute a migração: npm run db:migrate'
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

// Obter trilha por ID
router.get('/:id', async (req, res) => {
  try {
    const userId = req.query.userId ? parseInt(req.query.userId as string) : null
    const track = await db
      .select()
      .from(tracks)
      .where(eq(tracks.id, parseInt(req.params.id)))
      .limit(1)

    if (track.length === 0) {
      return res.status(404).json({ error: 'Trilha não encontrada' })
    }

    // Buscar itens da trilha
    const items = await db
      .select()
      .from(trackItems)
      .where(eq(trackItems.trackId, track[0].id))
      .orderBy(asc(trackItems.order))

    // Buscar progresso do usuário se userId for fornecido
    let userProgress: Record<number, boolean> = {}
    if (userId) {
      const progressItems = await db
        .select()
        .from(userTrackItems)
        .where(
          and(
            eq(userTrackItems.userId, userId),
            eq(userTrackItems.completed, true)
          )
        )
      
      progressItems.forEach((progress) => {
        userProgress[progress.trackItemId] = true
      })
    }

    // Buscar detalhes dos itens
    const itemsWithDetails = await Promise.all(
      items.map(async (item) => {
        let details = null
        if (item.type === 'article') {
          const article = await db
            .select()
            .from(articles)
            .where(eq(articles.id, item.itemId))
            .limit(1)
          details = article[0] || null
        } else if (item.type === 'lesson') {
          const lesson = await db
            .select()
            .from(lessons)
            .where(eq(lessons.id, item.itemId))
            .limit(1)
          details = lesson[0] || null
        } else if (item.type === 'tool') {
          const tool = await db
            .select()
            .from(tools)
            .where(eq(tools.id, item.itemId))
            .limit(1)
          details = tool[0] || null
        }

        return {
          ...item,
          details,
          completed: userId ? userProgress[item.id] || false : false,
        }
      })
    )

    res.json({
      ...track[0],
      items: itemsWithDetails,
    })
  } catch (error: any) {
    console.error('Erro ao buscar trilha:', error)
    console.error('Detalhes do erro:', error.message)
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
    
    // Mensagem de erro mais específica
    let errorMessage = 'Erro ao buscar trilha'
    if (error.message) {
      if (error.message.includes('does not exist') || error.message.includes('relation') || error.message.includes('table')) {
        errorMessage = 'Tabelas de trilhas não encontradas. Execute a migração: npm run db:migrate'
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

// Criar nova trilha
router.post('/', async (req, res) => {
  try {
    const { title, description, published, items } = req.body

    console.log('Recebendo requisição para criar trilha:', {
      title,
      description: description?.substring(0, 50),
      published,
      itemsCount: items?.length || 0,
      items: items,
    })

    // Validar campos obrigatórios
    if (!title || !title.trim()) {
      return res.status(400).json({ 
        error: 'Título é obrigatório',
        details: 'O título da trilha não pode estar vazio'
      })
    }

    // Criar a trilha
    console.log('Criando trilha no banco de dados...')
    const [newTrack] = await db
      .insert(tracks)
      .values({
        title: title.trim(),
        description: description || null,
        published: published || false,
      })
      .returning()

    console.log('Trilha criada:', newTrack)

    if (!newTrack) {
      return res.status(500).json({ error: 'Erro ao criar trilha - nenhum registro retornado' })
    }

    // Adicionar itens se fornecidos
    if (items && Array.isArray(items) && items.length > 0) {
      console.log('Adicionando itens à trilha:', items.length)
      const trackItemsToInsert = items.map((item: any, index: number) => ({
        trackId: newTrack.id,
        type: item.type,
        itemId: item.itemId,
        order: item.order !== undefined ? item.order : index,
      }))

      console.log('Itens a serem inseridos:', trackItemsToInsert)
      await db.insert(trackItems).values(trackItemsToInsert)
      console.log('Itens inseridos com sucesso')
    }

    // Buscar trilha completa com itens
    const itemsData = await db
      .select()
      .from(trackItems)
      .where(eq(trackItems.trackId, newTrack.id))
      .orderBy(asc(trackItems.order))

    console.log('Trilha criada com sucesso:', { id: newTrack.id, itemsCount: itemsData.length })

    res.status(201).json({
      ...newTrack,
      items: itemsData,
    })
  } catch (error: any) {
    console.error('Erro ao criar trilha:', error)
    console.error('Detalhes do erro:', error.message)
    if (error.stack) {
      console.error('Stack trace:', error.stack)
    }
    if (error.code) {
      console.error('Código do erro:', error.code)
    }
    
    // Mensagem de erro mais específica
    let errorMessage = 'Erro ao criar trilha'
    if (error.message) {
      if (error.message.includes('does not exist') || error.message.includes('relation') || error.message.includes('table')) {
        errorMessage = 'Tabelas de trilhas não encontradas. Execute a migração: npm run db:migrate'
      } else if (error.message.includes('foreign key') || error.message.includes('constraint')) {
        errorMessage = 'Erro de integridade: verifique se os itens (artigos, aulas, ferramentas) existem'
      } else {
        errorMessage = error.message
      }
    }
    
    res.status(500).json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
      code: error.code
    })
  }
})

// Atualizar trilha
router.put('/:id', async (req, res) => {
  try {
    const { title, description, published, items } = req.body
    const trackId = parseInt(req.params.id)

    // Atualizar a trilha
    const [updatedTrack] = await db
      .update(tracks)
      .set({
        title,
        description,
        published,
        updatedAt: new Date(),
      })
      .where(eq(tracks.id, trackId))
      .returning()

    if (!updatedTrack) {
      return res.status(404).json({ error: 'Trilha não encontrada' })
    }

    // Se items foram fornecidos, atualizar os itens
    if (items && Array.isArray(items)) {
      // Deletar itens existentes
      await db.delete(trackItems).where(eq(trackItems.trackId, trackId))

      // Inserir novos itens
      if (items.length > 0) {
        const trackItemsToInsert = items.map((item: any, index: number) => ({
          trackId,
          type: item.type,
          itemId: item.itemId,
          order: item.order !== undefined ? item.order : index,
        }))

        await db.insert(trackItems).values(trackItemsToInsert)
      }
    }

    // Buscar trilha completa com itens
    const itemsData = await db
      .select()
      .from(trackItems)
      .where(eq(trackItems.trackId, trackId))
      .orderBy(asc(trackItems.order))

    res.json({
      ...updatedTrack,
      items: itemsData,
    })
  } catch (error) {
    console.error('Erro ao atualizar trilha:', error)
    res.status(500).json({ error: 'Erro ao atualizar trilha' })
  }
})

// Deletar trilha
router.delete('/:id', async (req, res) => {
  try {
    const trackId = parseInt(req.params.id)

    // Verificar se a trilha existe
    const track = await db
      .select()
      .from(tracks)
      .where(eq(tracks.id, trackId))
      .limit(1)

    if (track.length === 0) {
      return res.status(404).json({ error: 'Trilha não encontrada' })
    }

    // Deletar itens da trilha (cascade já faz isso, mas vamos fazer explicitamente)
    await db.delete(trackItems).where(eq(trackItems.trackId, trackId))

    // Deletar a trilha
    await db.delete(tracks).where(eq(tracks.id, trackId))

    res.json({ success: true, message: 'Trilha deletada com sucesso' })
  } catch (error) {
    console.error('Erro ao deletar trilha:', error)
    res.status(500).json({ error: 'Erro ao deletar trilha' })
  }
})

// Marcar item da trilha como concluído
router.post('/:trackId/items/:itemId/complete', async (req, res) => {
  try {
    const { userId } = req.body
    const trackItemId = parseInt(req.params.itemId)

    if (!userId) {
      return res.status(400).json({ error: 'userId é obrigatório' })
    }

    // Verificar se o item existe
    const item = await db
      .select()
      .from(trackItems)
      .where(eq(trackItems.id, trackItemId))
      .limit(1)

    if (item.length === 0) {
      return res.status(404).json({ error: 'Item da trilha não encontrado' })
    }

    // Verificar se já existe progresso
    const existing = await db
      .select()
      .from(userTrackItems)
      .where(
        and(
          eq(userTrackItems.userId, userId),
          eq(userTrackItems.trackItemId, trackItemId)
        )
      )
      .limit(1)

    if (existing.length > 0) {
      // Atualizar progresso existente
      await db
        .update(userTrackItems)
        .set({
          completed: true,
          completedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(userTrackItems.id, existing[0].id))
    } else {
      // Criar novo progresso
      await db.insert(userTrackItems).values({
        userId,
        trackItemId,
        completed: true,
        completedAt: new Date(),
      })
    }

    res.json({ success: true, message: 'Item marcado como concluído' })
  } catch (error: any) {
    console.error('Erro ao marcar item como concluído:', error)
    res.status(500).json({ 
      error: 'Erro ao marcar item como concluído',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// Desmarcar item da trilha como concluído
router.post('/:trackId/items/:itemId/uncomplete', async (req, res) => {
  try {
    const { userId } = req.body
    const trackItemId = parseInt(req.params.itemId)

    if (!userId) {
      return res.status(400).json({ error: 'userId é obrigatório' })
    }

    // Atualizar progresso
    await db
      .update(userTrackItems)
      .set({
        completed: false,
        completedAt: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(userTrackItems.userId, userId),
          eq(userTrackItems.trackItemId, trackItemId)
        )
      )

    res.json({ success: true, message: 'Item desmarcado como concluído' })
  } catch (error: any) {
    console.error('Erro ao desmarcar item:', error)
    res.status(500).json({ 
      error: 'Erro ao desmarcar item',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

export default router

