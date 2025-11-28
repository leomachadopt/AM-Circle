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
  { title: 'Mentorias & Eventos', url: '/mentorships', icon: Calendar },
  { title: 'Ferramentas', url: '/tools', icon: Wrench },
  { title: 'IA Assistente', url: '/ai-assistant', icon: Bot },
  { title: 'KPIs & Evolução', url: '/kpis', icon: BarChart2 },
  { title: 'Trilhas', url: '/tracks', icon: Route },
  { title: 'Comunidade', url: '/community', icon: Users },
  { title: 'Perfil', url: '/profile', icon: User },
  { title: 'Suporte', url: '/support', icon: LifeBuoy },
]

export const mockUser = {
  name: 'Dr. Ricardo Silva',
  email: 'ricardo.silva@dental.com',
  avatar: 'https://img.usecurling.com/ppl/medium?gender=male',
  points: 1250,
  level: 'Especialista HBM',
  progress: 68,
}

export const mockLessons = [
  {
    id: 1,
    title: 'Fundamentos da Gestão Odontológica',
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
    title: 'Liderança de Equipes de Alta Performance',
    duration: '55 min',
    completed: false,
    module: 'Liderança',
  },
  {
    id: 5,
    title: 'Precificação Estratégica',
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
    type: 'Live',
  },
  {
    id: 2,
    title: 'Análise de Casos Clínicos',
    date: '2024-06-22T20:00:00',
    type: 'Live',
  },
  {
    id: 3,
    title: 'Workshop: Gestão Financeira',
    date: '2024-05-10T19:00:00',
    type: 'Replay',
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
    title: 'Script de Confirmação de Consulta',
    category: 'Scripts',
    icon: 'FileText',
  },
  {
    id: 3,
    title: 'Checklist de Abertura da Clínica',
    category: 'Checklists',
    icon: 'CheckSquare',
  },
  {
    id: 4,
    title: 'Planilha de Fluxo de Caixa',
    category: 'Planilhas',
    icon: 'Table',
  },
  {
    id: 5,
    title: 'SOP: Esterilização de Materiais',
    category: 'SOPs',
    icon: 'File',
  },
]

export const mockPosts = [
  {
    id: 1,
    author: 'Dra. Ana Souza',
    avatar: 'https://img.usecurling.com/ppl/thumbnail?gender=female',
    content:
      'Alguém já implementou o novo script de vendas? Tive um aumento de 20% na conversão essa semana!',
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
      'Dúvida sobre o módulo financeiro: como vocês estão calculando a hora clínica?',
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
      'Encontrei esse artigo sobre tendências de marketing para 2025, vale a leitura: https://example.com/marketing-2025',
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
      'Compartilhando meu modelo de contrato de prestação de serviços. Espero que ajude!',
    likes: 45,
    comments: 18,
    time: '2d atrás',
    topic: 'Arquivos',
  },
]
