import { db } from './index.js'
import { events } from './schema.js'
import { eq } from 'drizzle-orm'

async function createFutureEvents() {
  console.log('📅 Criando eventos futuros do tipo "Em Direto"...')
  
  try {
    const now = new Date()
    const nextMonth = new Date(now)
    nextMonth.setMonth(now.getMonth() + 1)
    const twoMonthsLater = new Date(now)
    twoMonthsLater.setMonth(now.getMonth() + 2)
    const threeMonthsLater = new Date(now)
    threeMonthsLater.setMonth(now.getMonth() + 3)
    
    const futureEvents = [
      {
        title: 'Mentoria de Vendas Avançadas',
        date: new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15, 19, 0),
        type: 'Em Direto',
        description: 'Mentoria sobre técnicas avançadas de vendas para clínicas dentárias',
      },
      {
        title: 'Análise de Casos Clínicos',
        date: new Date(twoMonthsLater.getFullYear(), twoMonthsLater.getMonth(), 22, 20, 0),
        type: 'Em Direto',
        description: 'Análise de casos clínicos reais com discussão interativa',
      },
      {
        title: 'Workshop: Gestão Financeira',
        date: new Date(threeMonthsLater.getFullYear(), threeMonthsLater.getMonth(), 10, 19, 0),
        type: 'Em Direto',
        description: 'Workshop sobre gestão financeira e planeamento estratégico',
      },
    ]
    
    // Verificar se já existem eventos com os mesmos títulos
    for (const event of futureEvents) {
      const existing = await db
        .select()
        .from(events)
        .where(eq(events.title, event.title))
        .limit(1)
      
      if (existing.length > 0) {
        // Atualizar evento existente
        await db
          .update(events)
          .set({
            date: event.date,
            type: event.type,
            description: event.description,
            updatedAt: new Date(),
          })
          .where(eq(events.id, existing[0].id))
        console.log(`✓ Evento "${event.title}" atualizado`)
      } else {
        // Criar novo evento
        await db.insert(events).values(event)
        console.log(`✓ Evento "${event.title}" criado`)
      }
    }
    
    console.log('✅ Eventos futuros criados/atualizados com sucesso!')
  } catch (error: any) {
    console.error('❌ Erro ao criar eventos futuros:', error)
    console.error('Detalhes:', error.message, error.stack)
    process.exit(1)
  }
  
  process.exit(0)
}

createFutureEvents()

