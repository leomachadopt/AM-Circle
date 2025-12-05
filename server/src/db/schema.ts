import { pgTable, serial, varchar, text, boolean, timestamp, integer, jsonb } from 'drizzle-orm/pg-core'

// Tabela de Usuários
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(), // Hash da senha
  role: varchar('role', { length: 50 }).default('user').notNull(), // 'admin' ou 'user'
  avatar: text('avatar'),
  progress: integer('progress').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Módulos
export const modules = pgTable('modules', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Tabela de Aulas/Lições
export const lessons = pgTable('lessons', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  duration: varchar('duration', { length: 50 }),
  moduleId: integer('module_id').references(() => modules.id),
  module: varchar('module', { length: 100 }),
  videoUrl: text('video_url'),
  imageUrl: text('image_url'),
  description: text('description'),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Progresso do Usuário nas Aulas
export const userLessons = pgTable('user_lessons', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  lessonId: integer('lesson_id').references(() => lessons.id).notNull(),
  completed: boolean('completed').default(false).notNull(),
  progress: integer('progress').default(0), // 0-100
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Eventos/Mentorias
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  date: timestamp('date').notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'Em Direto', 'Gravação' ou 'Presencial'
  description: text('description'),
  imageUrl: text('image_url'), // URL da imagem do evento
  videoUrl: text('video_url'),
  meetingUrl: text('meeting_url'),
  address: text('address'), // Endereço para eventos presenciais
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Confirmações de Participação em Eventos
export const eventRegistrations = pgTable('event_registrations', {
  id: serial('id').primaryKey(),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Tabela de Ferramentas
export const tools = pgTable('tools', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  category: varchar('category', { length: 100 }).notNull(),
  icon: varchar('icon', { length: 50 }),
  description: text('description'),
  fileUrl: text('file_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Posts da Comunidade
export const posts = pgTable('posts', {
  id: serial('id').primaryKey(),
  author: varchar('author', { length: 255 }).notNull(),
  avatar: text('avatar'),
  content: text('content').notNull(),
  topic: varchar('topic', { length: 100 }),
  images: jsonb('images'), // Array de URLs de imagens
  files: jsonb('files'), // Array de objetos com {url, name, size, type}
  likes: integer('likes').default(0),
  comments: integer('comments').default(0),
  userId: integer('user_id').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Comentários
export const comments = pgTable('comments', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Likes de Posts
export const postLikes = pgTable('post_likes', {
  id: serial('id').primaryKey(),
  postId: integer('post_id').references(() => posts.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Tabela de KPIs
export const kpis = pgTable('kpis', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  metric: varchar('metric', { length: 100 }).notNull(),
  value: integer('value').notNull(),
  date: timestamp('date').defaultNow().notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Tabela de Perguntas para Mentorias
export const mentorshipQuestions = pgTable('mentorship_questions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  subject: varchar('subject', { length: 255 }).notNull(),
  question: text('question').notNull(),
  eventId: integer('event_id').references(() => events.id),
  answered: boolean('answered').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Artigos da Biblioteca
export const articles = pgTable('articles', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  category: varchar('category', { length: 100 }),
  description: text('description'), // Descrição do artigo
  fileUrl: text('file_url'), // URL do PDF
  published: boolean('published').default(false).notNull(),
  publishedAt: timestamp('published_at'),
  views: integer('views').default(0),
  downloads: integer('downloads').default(0), // Contador de downloads
  tags: jsonb('tags'), // Array de tags
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Categorias de Artigos
export const articleCategories = pgTable('article_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Comentários de Artigos
export const articleComments = pgTable('article_comments', {
  id: serial('id').primaryKey(),
  articleId: integer('article_id').references(() => articles.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  parentId: integer('parent_id').references(() => articleComments.id), // Para respostas
  author: varchar('author', { length: 255 }).notNull(),
  avatar: text('avatar'),
  content: text('content').notNull(),
  likes: integer('likes').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Categorias de Posts da Comunidade
export const postCategories = pgTable('post_categories', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Trilhas
export const tracks = pgTable('tracks', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  published: boolean('published').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Itens das Trilhas (artigos, vídeos, ferramentas)
export const trackItems = pgTable('track_items', {
  id: serial('id').primaryKey(),
  trackId: integer('track_id').references(() => tracks.id, { onDelete: 'cascade' }).notNull(),
  type: varchar('type', { length: 50 }).notNull(), // 'article', 'lesson', 'tool'
  itemId: integer('item_id').notNull(), // ID do artigo, aula ou ferramenta
  order: integer('order').default(0), // Ordem do item na trilha
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Progresso do Usuário nos Itens das Trilhas
export const userTrackItems = pgTable('user_track_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  trackItemId: integer('track_item_id').references(() => trackItems.id, { onDelete: 'cascade' }).notNull(),
  completed: boolean('completed').default(false).notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Tarefas de Ativação das Aulas
export const lessonActivationTasks = pgTable('lesson_activation_tasks', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(),
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Progresso do Usuário nas Tarefas de Ativação
export const userActivationTasks = pgTable('user_activation_tasks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  taskId: integer('task_id').references(() => lessonActivationTasks.id, { onDelete: 'cascade' }).notNull(),
  completed: boolean('completed').default(false).notNull(),
  completedAt: timestamp('completed_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Materiais das Aulas
export const lessonMaterials = pgTable('lesson_materials', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  fileUrl: text('file_url'),
  fileType: varchar('file_type', { length: 50 }), // 'pdf', 'xls', 'doc', etc.
  fileSize: integer('file_size'), // em bytes
  order: integer('order').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Tabela de Comentários/Dúvidas das Aulas
export const lessonComments = pgTable('lesson_comments', {
  id: serial('id').primaryKey(),
  lessonId: integer('lesson_id').references(() => lessons.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  parentId: integer('parent_id').references(() => lessonComments.id), // Para respostas
  author: varchar('author', { length: 255 }).notNull(),
  avatar: text('avatar'),
  content: text('content').notNull(),
  likes: integer('likes').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})


