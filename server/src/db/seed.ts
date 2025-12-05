import { db } from './index.js'
import { users, lessons, events, tools, posts, modules, postCategories } from './schema.js'
import { eq } from 'drizzle-orm'

async function seed() {
  console.log('🌱 Iniciando seed do banco de dados...')

  try {
    // Limpar dados existentes (opcional - comentar em produção)
    // await db.delete(posts)
    // await db.delete(events)
    // await db.delete(lessons)
    // await db.delete(tools)
    // await db.delete(users)
    // await db.delete(modules)

    // Criar módulos
    console.log('📚 Criando módulos...')
    let gestaoModule, marketingModule, atendimentoModule, liderancaModule, financeiroModule

    try {
      const [gestao] = await db
        .insert(modules)
        .values({ name: 'Gestão', description: 'Módulo de gestão' })
        .returning()
      gestaoModule = gestao
    } catch (e) {
      const existing = await db.select().from(modules).where(eq(modules.name, 'Gestão')).limit(1)
      gestaoModule = existing[0]
    }

    try {
      const [marketing] = await db
        .insert(modules)
        .values({ name: 'Marketing', description: 'Módulo de marketing' })
        .returning()
      marketingModule = marketing
    } catch (e) {
      const existing = await db.select().from(modules).where(eq(modules.name, 'Marketing')).limit(1)
      marketingModule = existing[0]
    }

    try {
      const [atendimento] = await db
        .insert(modules)
        .values({ name: 'Atendimento', description: 'Módulo de atendimento' })
        .returning()
      atendimentoModule = atendimento
    } catch (e) {
      const existing = await db.select().from(modules).where(eq(modules.name, 'Atendimento')).limit(1)
      atendimentoModule = existing[0]
    }

    try {
      const [lideranca] = await db
        .insert(modules)
        .values({ name: 'Liderança', description: 'Módulo de liderança' })
        .returning()
      liderancaModule = lideranca
    } catch (e) {
      const existing = await db.select().from(modules).where(eq(modules.name, 'Liderança')).limit(1)
      liderancaModule = existing[0]
    }

    try {
      const [financeiro] = await db
        .insert(modules)
        .values({ name: 'Financeiro', description: 'Módulo financeiro' })
        .returning()
      financeiroModule = financeiro
    } catch (e) {
      const existing = await db.select().from(modules).where(eq(modules.name, 'Financeiro')).limit(1)
      financeiroModule = existing[0]
    }

    // Criar usuário mock
    console.log('👤 Criando usuário...')
    let user
    try {
      const [newUser] = await db
        .insert(users)
        .values({
          name: 'Dr. Ricardo Silva',
          email: 'ricardo.silva@dental.com',
          avatar: 'https://img.usecurling.com/ppl/medium?gender=male',
          progress: 68,
        })
        .returning()
      user = newUser
    } catch (e) {
      const existing = await db.select().from(users).where(eq(users.email, 'ricardo.silva@dental.com')).limit(1)
      user = existing[0]
    }

    // Criar aulas
    console.log('📖 Criando aulas...')
    await db.insert(lessons).values([
      {
        title: 'Fundamentos da Gestão Dentária',
        duration: '45 min',
        module: 'Gestão',
        moduleId: gestaoModule?.id,
        order: 1,
      },
      {
        title: 'Marketing Digital para Dentistas',
        duration: '60 min',
        module: 'Marketing',
        moduleId: marketingModule?.id,
        order: 2,
      },
      {
        title: 'Atendimento Premium: A Jornada do Paciente',
        duration: '50 min',
        module: 'Atendimento',
        moduleId: atendimentoModule?.id,
        order: 3,
      },
      {
        title: 'Liderança de Equipas de Alta Performance',
        duration: '55 min',
        module: 'Liderança',
        moduleId: liderancaModule?.id,
        order: 4,
      },
      {
        title: 'Definição Estratégica de Preços',
        duration: '40 min',
        module: 'Financeiro',
        moduleId: financeiroModule?.id,
        order: 5,
      },
    ])

    // Criar eventos
    console.log('📅 Criando eventos...')
    await db.insert(events).values([
      {
        title: 'Mentoria de Vendas Avançadas',
        date: new Date('2024-06-15T19:00:00'),
        type: 'Em Direto',
        description: 'Mentoria sobre técnicas avançadas de vendas',
      },
      {
        title: 'Análise de Casos Clínicos',
        date: new Date('2024-06-22T20:00:00'),
        type: 'Em Direto',
        description: 'Análise de casos clínicos reais',
      },
      {
        title: 'Workshop: Gestão Financeira',
        date: new Date('2024-05-10T19:00:00'),
        type: 'Gravação',
        description: 'Workshop sobre gestão financeira',
      },
    ])

    // Criar ferramentas
    console.log('🔧 Criando ferramentas...')
    await db.insert(tools).values([
      {
        title: 'Calculadora de ROI',
        category: 'Calculadoras',
        icon: 'Calculator',
      },
      {
        title: 'Guião de Confirmação de Consulta',
        category: 'Guiões',
        icon: 'FileText',
      },
      {
        title: 'Lista de Verificação de Abertura da Clínica',
        category: 'Listas de Verificação',
        icon: 'CheckSquare',
      },
      {
        title: 'Folha de Cálculo de Fluxo de Caixa',
        category: 'Folhas de Cálculo',
        icon: 'Table',
      },
      {
        title: 'PNO: Esterilização de Materiais',
        category: 'PNOs',
        icon: 'File',
      },
    ])

    // Criar categorias de posts
    console.log('🏷️ Criando categorias de posts...')
    let perguntaCategory, linksCategory, ficheirosCategory

    try {
      const [pergunta] = await db
        .insert(postCategories)
        .values({
          name: 'Perguntas',
          slug: 'perguntas',
          description: 'Categoria para perguntas e dúvidas da comunidade',
        })
        .returning()
      perguntaCategory = pergunta
    } catch (e) {
      const existing = await db
        .select()
        .from(postCategories)
        .where(eq(postCategories.name, 'Perguntas'))
        .limit(1)
      perguntaCategory = existing[0]
    }

    try {
      const [links] = await db
        .insert(postCategories)
        .values({
          name: 'Links Interessantes',
          slug: 'links-interessantes',
          description: 'Categoria para compartilhar links e recursos interessantes',
        })
        .returning()
      linksCategory = links
    } catch (e) {
      const existing = await db
        .select()
        .from(postCategories)
        .where(eq(postCategories.name, 'Links Interessantes'))
        .limit(1)
      linksCategory = existing[0]
    }

    try {
      const [ficheiros] = await db
        .insert(postCategories)
        .values({
          name: 'Ficheiros',
          slug: 'ficheiros',
          description: 'Categoria para compartilhar ficheiros e documentos',
        })
        .returning()
      ficheirosCategory = ficheiros
    } catch (e) {
      const existing = await db
        .select()
        .from(postCategories)
        .where(eq(postCategories.name, 'Ficheiros'))
        .limit(1)
      ficheirosCategory = existing[0]
    }

    // Criar posts
    console.log('💬 Criando posts...')
    if (user) {
      await db.insert(posts).values([
        {
          author: 'Dra. Ana Souza',
          avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female',
          content:
            'Alguém já implementou o novo guião de vendas? Tive um aumento de 20% na conversão esta semana!',
          likes: 15,
          comments: 4,
          topic: 'Perguntas',
        },
        {
          author: 'Dr. Carlos Mendes',
          avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
          content:
            'Dúvida sobre o módulo financeiro: como estão a calcular a hora clínica?',
          likes: 8,
          comments: 12,
          topic: 'Perguntas',
        },
        {
          author: 'Dra. Mariana Costa',
          avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=3',
          content:
            'Encontrei este artigo sobre tendências de marketing para 2025, vale a leitura: https://example.com/marketing-2025',
          likes: 22,
          comments: 7,
          topic: 'Links Interessantes',
        },
        {
          author: 'Dr. Roberto Lima',
          avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=4',
          content:
            'A partilhar o meu modelo de contrato de prestação de serviços. Espero que ajude!',
          likes: 45,
          comments: 18,
          topic: 'Ficheiros',
        },
      ])
    }

    console.log('✅ Seed concluído com sucesso!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Erro ao executar seed:', error)
    process.exit(1)
  }
}

seed()

