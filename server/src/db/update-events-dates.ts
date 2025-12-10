import { db } from './index.js'
import { events } from './schema.js'
import { eq } from 'drizzle-orm'

async function updateEventsDates() {
  console.log('🔄 Atualizando datas dos eventos para o futuro...')
  
  try {
    // Buscar todos os eventos
    const allEvents = await db.select().from(events)
    
    if (allEvents.length === 0) {
      console.log('Nenhum evento encontrado no banco de dados.')
      return
    }
    
    const now = new Date()
    const nextMonth = new Date(now)
    nextMonth.setMonth(now.getMonth() + 1)
    const twoMonthsLater = new Date(now)
    twoMonthsLater.setMonth(now.getMonth() + 2)
    const threeMonthsLater = new Date(now)
    threeMonthsLater.setMonth(now.getMonth() + 3)
    
    const futureDates = [
      new Date(nextMonth.getFullYear(), nextMonth.getMonth(), 15, 19, 0),
      new Date(twoMonthsLater.getFullYear(), twoMonthsLater.getMonth(), 22, 20, 0),
      new Date(threeMonthsLater.getFullYear(), threeMonthsLater.getMonth(), 10, 19, 0),
    ]
    
    // Atualizar cada evento com uma data futura
    for (let i = 0; i < allEvents.length; i++) {
      const event = allEvents[i]
      const futureDate = futureDates[i % futureDates.length]
      
      await db
        .update(events)
        .set({
          date: futureDate,
          updatedAt: new Date(),
        })
        .where(eq(events.id, event.id))
      
      console.log(`✓ Evento "${event.title}" atualizado para ${futureDate.toISOString()}`)
    }
    
    console.log('✅ Datas dos eventos atualizadas com sucesso!')
  } catch (error: any) {
    console.error('❌ Erro ao atualizar datas dos eventos:', error)
    console.error('Detalhes:', error.message, error.stack)
    process.exit(1)
  }
  
  process.exit(0)
}

updateEventsDates()


