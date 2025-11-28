import {
  LayoutDashboard,
  GraduationCap,
  Calendar,
  Wrench,
  Bot,
  BarChart2,
  Route,
  Users,
  User,
  LifeBuoy,
} from 'lucide-react'

export const navItems = [
  { title: 'Dashboard', url: '/', icon: LayoutDashboard },
  { title: 'Academia HBM', url: '/academy', icon: GraduationCap },
  { title: 'Mentorias e Eventos', url: '/mentorships', icon: Calendar },
  { title: 'Ferramentas', url: '/tools', icon: Wrench },
  { title: 'Assistente IA', url: '/ai-assistant', icon: Bot },
  { title: 'KPIs e Evolução', url: '/kpis', icon: BarChart2 },
  { title: 'Percursos', url: '/tracks', icon: Route },
  { title: 'Comunidade', url: '/community', icon: Users },
  { title: 'Perfil', url: '/profile', icon: User },
  { title: 'Apoio', url: '/support', icon: LifeBuoy },
]

export const mockUser = {
  name: 'Dr. Ricardo Silva',
  email: 'ricardo.silva@dental.com',
  avatar: 'https://img.usecurling.com/ppl/medium?gender=male',
  progress: 68,
}

export const mockLessons = [
  {
    id: 1,
    title: 'Fundamentos da Gestão Dentária',
    duration: '45 min',
    completed: true,
    module: 'Gestão',
  },
  {
    id: 2,
    title: 'Marketing Digital para Dentistas',
    duration: '60 min',
    completed: true,
    module: 'Marketing',
  },
  {
    id: 3,
    title: 'Atendimento Premium: A Jornada do Paciente',
    duration: '50 min',
    completed: false,
    module: 'Atendimento',
  },
  {
    id: 4,
    title: 'Liderança de Equipas de Alta Performance',
    duration: '55 min',
    completed: false,
    module: 'Liderança',
  },
  {
    id: 5,
    title: 'Definição Estratégica de Preços',
    duration: '40 min',
    completed: false,
    module: 'Financeiro',
  },
]

export const mockEvents = [
  {
    id: 1,
    title: 'Mentoria de Vendas Avançadas',
    date: '2024-06-15T19:00:00',
    type: 'Em Direto',
  },
  {
    id: 2,
    title: 'Análise de Casos Clínicos',
    date: '2024-06-22T20:00:00',
    type: 'Em Direto',
  },
  {
    id: 3,
    title: 'Workshop: Gestão Financeira',
    date: '2024-05-10T19:00:00',
    type: 'Gravação',
  },
]

export const mockTools = [
  {
    id: 1,
    title: 'Calculadora de ROI',
    category: 'Calculadoras',
    icon: 'Calculator',
  },
  {
    id: 2,
    title: 'Guião de Confirmação de Consulta',
    category: 'Guiões',
    icon: 'FileText',
  },
  {
    id: 3,
    title: 'Lista de Verificação de Abertura da Clínica',
    category: 'Listas de Verificação',
    icon: 'CheckSquare',
  },
  {
    id: 4,
    title: 'Folha de Cálculo de Fluxo de Caixa',
    category: 'Folhas de Cálculo',
    icon: 'Table',
  },
  {
    id: 5,
    title: 'PNO: Esterilização de Materiais',
    category: 'PNOs',
    icon: 'File',
  },
]

export const mockPosts = [
  {
    id: 1,
    author: 'Dra. Ana Souza',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female',
    content:
      'Alguém já implementou o novo guião de vendas? Tive um aumento de 20% na conversão esta semana!',
    likes: 15,
    comments: 4,
    time: '2h atrás',
    topic: 'Perguntas',
  },
  {
    id: 2,
    author: 'Dr. Carlos Mendes',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=2',
    content:
      'Dúvida sobre o módulo financeiro: como estão a calcular a hora clínica?',
    likes: 8,
    comments: 12,
    time: '5h atrás',
    topic: 'Perguntas',
  },
  {
    id: 3,
    author: 'Dra. Mariana Costa',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female&seed=3',
    content:
      'Encontrei este artigo sobre tendências de marketing para 2025, vale a leitura: https://example.com/marketing-2025',
    likes: 22,
    comments: 7,
    time: '1d atrás',
    topic: 'Links Interessantes',
  },
  {
    id: 4,
    author: 'Dr. Roberto Lima',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=male&seed=4',
    content:
      'A partilhar o meu modelo de contrato de prestação de serviços. Espero que ajude!',
    likes: 45,
    comments: 18,
    time: '2d atrás',
    topic: 'Ficheiros',
  },
]
