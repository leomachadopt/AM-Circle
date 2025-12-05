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
import AdminAcademy from './pages/AdminAcademy'
import AdminMentorships from './pages/AdminMentorships'
import AdminTools from './pages/AdminTools'
import AdminArticles from './pages/AdminArticles'
import AdminUsers from './pages/AdminUsers'
import AdminPostCategories from './pages/AdminPostCategories'
import AdminQuestions from './pages/AdminQuestions'
import AdminTracks from './pages/AdminTracks'
import Articles from './pages/Articles'
import ArticleDetails from './pages/ArticleDetails'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/ProtectedRoute'

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
          <Route path="/articles" element={<Articles />} />
          <Route path="/articles/:slug" element={<ArticleDetails />} />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/support" element={<Support />} />
          <Route
            path="/admin/academy"
            element={
              <ProtectedRoute requireAdmin>
                <AdminAcademy />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/mentorships"
            element={
              <ProtectedRoute requireAdmin>
                <AdminMentorships />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tools"
            element={
              <ProtectedRoute requireAdmin>
                <AdminTools />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/articles"
            element={
              <ProtectedRoute requireAdmin>
                <AdminArticles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute requireAdmin>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/post-categories"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPostCategories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/questions"
            element={
              <ProtectedRoute requireAdmin>
                <AdminQuestions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/tracks"
            element={
              <ProtectedRoute requireAdmin>
                <AdminTracks />
              </ProtectedRoute>
            }
          />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </BrowserRouter>
)

export default App
