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
} from '@/components/ui/sidebar'
import { navItems, mockUser } from '@/lib/data'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogOut } from 'lucide-react'

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 flex items-center justify-center border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 w-full overflow-hidden">
          <div className="h-8 w-8 rounded bg-primary flex-shrink-0 flex items-center justify-center text-secondary font-bold">
            H
          </div>
          <span className="font-bold text-primary truncate group-data-[collapsible=icon]:hidden">
            HBM Dental Hub
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.url}
                    tooltip={item.title}
                    className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-gradient-to-r data-[active=true]:from-primary/10 data-[active=true]:to-transparent data-[active=true]:border-l-4 data-[active=true]:border-secondary data-[active=true]:pl-2 transition-all duration-200"
                  >
                    <Link to={item.url} className="flex items-center gap-3">
                      <item.icon
                        className={`h-5 w-5 ${location.pathname === item.url ? 'text-secondary' : 'text-muted-foreground'}`}
                      />
                      <span
                        className={
                          location.pathname === item.url
                            ? 'font-medium text-primary'
                            : ''
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
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <Avatar className="h-9 w-9 border border-border">
            <AvatarImage src={mockUser.avatar} alt={mockUser.name} />
            <AvatarFallback>DR</AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-medium truncate">
              {mockUser.name}
            </span>
            <Link
              to="/login"
              className="text-xs text-muted-foreground flex items-center gap-1 hover:text-destructive transition-colors"
            >
              <LogOut className="h-3 w-3" /> Sair
            </Link>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
