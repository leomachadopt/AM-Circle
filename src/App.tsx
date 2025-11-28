import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import Index from './pages/Index'
import Login from './pages/Login'
import Academy from './pages/Academy'
import LessonDetails from './pages/LessonDetails'
import Mentorships from './pages/Mentorships'
import Tools from './pages/Tools'
import AIAssistant from './pages/AIAssistant'
import KPIs from './pages/KPIs'
import Community from './pages/Community'
import CustomTracks from './pages/CustomTracks'
import TrackDetails from './pages/TrackDetails'
import Profile from './pages/Profile'
import Support from './pages/Support'
import NotFound from './pages/NotFound'

const App = () => (
  <BrowserRouter
    future={{ v7_startTransition: false, v7_relativeSplatPath: false }}
  >
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<Layout />}>
          <Route path="/" element={<Index />} />
          <Route path="/academy" element={<Academy />} />
          <Route path="/academy/lesson/:id" element={<LessonDetails />} />
          <Route path="/mentorships" element={<Mentorships />} />
          <Route path="/tools" element={<Tools />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/kpis" element={<KPIs />} />
          <Route path="/community" element={<Community />} />
          <Route path="/tracks" element={<CustomTracks />} />
          <Route path="/tracks/:id" element={<TrackDetails />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/support" element={<Support />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
