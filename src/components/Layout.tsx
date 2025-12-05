import { Outlet, useLocation } from 'react-router-dom'
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/AppSidebar'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Bell, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export default function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const isLoginPage = location.pathname === '/login'

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (isLoginPage) {
    return <Outlet />
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-col flex-1 w-full overflow-hidden">
          <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border/50 bg-black/95 backdrop-blur-md px-6 shadow-netflix">
            <SidebarTrigger className="md:hidden text-foreground hover:text-primary transition-colors" />
            <div className="hidden md:flex items-center gap-2 text-muted-foreground">
              <Search className="h-4 w-4 text-primary" />
              <Input
                placeholder="Pesquisar..."
                className="h-9 w-64 border-none bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary placeholder:text-muted-foreground/70 transition-all"
              />
            </div>
            <div className="ml-auto flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="relative text-muted-foreground hover:text-primary transition-colors"
              >
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary animate-pulse" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full hover:ring-2 hover:ring-primary transition-all"
                  >
                    <Avatar className="h-9 w-9 border-2 border-primary/50">
                      {user?.avatar && <AvatarImage src={user.avatar} alt={user?.name} />}
                      <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                        {user?.name
                          ?.split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-card border-border" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none text-foreground">
                        {user?.name || 'Usuário'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email || ''}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem asChild className="hover:bg-muted cursor-pointer">
                    <Link to="/profile">Perfil</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-muted cursor-pointer">
                    <Link to="/support">Apoio</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border" />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-destructive focus:text-destructive hover:bg-destructive/10"
                  >
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-gradient-to-b from-background to-black">
            <div className="mx-auto max-w-7xl animate-fade-in">
              <Outlet />
            </div>
          </main>
          <footer className="border-t border-border/30 bg-black/95 p-6 text-center text-xs text-muted-foreground backdrop-blur-sm">
            <div className="flex flex-col gap-2">
              <p className="text-primary font-semibold text-sm">AMC Dental Mastery Hub</p>
              <p>© {new Date().getFullYear()} Todos os direitos reservados.</p>
            </div>
          </footer>
        </div>
      </div>
    </SidebarProvider>
  )
}
