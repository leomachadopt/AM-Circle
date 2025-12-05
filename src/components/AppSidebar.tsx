import { useLocation, Link } from 'react-router-dom'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar'
import { navItems, adminNavItems } from '@/lib/data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function AppSidebar() {
  const location = useLocation()
  const { setOpenMobile, isMobile } = useSidebar()
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLinkClick = () => {
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-primary/30 bg-gradient-to-b from-black to-sidebar-background">
        <div className="flex items-center gap-3 px-2 w-full overflow-hidden">
          <div className="h-10 w-10 rounded-lg bg-gradient-gold flex-shrink-0 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-gold">
            A
          </div>
          <span className="font-bold text-primary text-lg truncate group-data-[collapsible=icon]:hidden text-shadow-gold">
            AMC Hub
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="bg-sidebar-background">
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary/70 font-semibold tracking-wider text-xs uppercase">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className="hover:bg-primary/10 hover:text-primary data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/20 data-[active=true]:to-transparent data-[active=true]:border-l-4 data-[active=true]:border-primary data-[active=true]:pl-2 transition-all duration-300 ease-netflix my-1 rounded-lg"
                  >
                    <Link
                      to={item.url}
                      className="flex items-center gap-3"
                      onClick={handleLinkClick}
                    >
                      <item.icon
                        className={`h-5 w-5 transition-all duration-300 ${location.pathname === item.url ? 'text-primary scale-110' : 'text-muted-foreground'}`}
                      />
                      <span
                        className={
                          location.pathname === item.url
                            ? 'font-semibold text-primary'
                            : 'font-medium text-foreground'
                        }
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {isAdmin && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-primary/70 font-semibold tracking-wider text-xs uppercase">
              Administração
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {adminNavItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className="hover:bg-primary/10 hover:text-primary data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/20 data-[active=true]:to-transparent data-[active=true]:border-l-4 data-[active=true]:border-primary data-[active=true]:pl-2 transition-all duration-300 ease-netflix my-1 rounded-lg"
                  >
                    <Link
                      to={item.url}
                      className="flex items-center gap-3"
                      onClick={handleLinkClick}
                    >
                      <item.icon
                        className={`h-5 w-5 transition-all duration-300 ${location.pathname === item.url ? 'text-primary scale-110' : 'text-muted-foreground'}`}
                      />
                      <span
                        className={
                          location.pathname === item.url
                            ? 'font-semibold text-primary'
                            : 'font-medium text-foreground'
                        }
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="border-t border-primary/20 p-4 bg-gradient-to-t from-black to-sidebar-background">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-10 w-10 border-2 border-primary/50 shadow-gold">
            {user?.avatar && <AvatarImage src={user.avatar} alt={user?.name} />}
            <AvatarFallback className="bg-gradient-gold text-primary-foreground font-bold">
              {(() => {
                if (!user?.name) return 'U'
                const initials = user.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)
                return initials || 'U'
              })()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold truncate text-foreground">
              {user?.name || 'Usuário'}
            </span>
            <button
              onClick={handleLogout}
              className="text-xs text-muted-foreground flex items-center gap-1 hover:text-primary transition-colors text-left"
            >
              <LogOut className="h-3 w-3" /> Sair
            </button>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
