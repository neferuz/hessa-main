"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Search,
  Bell,
  Sparkles,
  LayoutDashboard,
  Calendar,
  Library,
  Users,
  Link as LinkIcon,
  Folder,
  ChevronDown,
  MessageSquare,
  Settings,
  HelpCircle,
  Check,
  Plus,
  ClipboardList,
  Megaphone,
  Briefcase,
  Inbox,
  CircleDashed,
  Layers,
  Map,
  LayoutGrid,
  SquareStack,
  LayoutTemplate,
  LayoutPanelTop,
  Undo2,
  MapPin,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Kbd } from "@/components/ui/kbd";
import Image from "next/image";
import { cn } from "@/lib/utils";


export function DashboardSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const [favoritesOpen, setFavoritesOpen] = useState(true);
  const pathname = usePathname();

  return (
    <Sidebar className="lg:border-r-0!" collapsible="offcanvas" {...props}>
      <SidebarHeader className="pb-0">
        <div className="px-2 py-2 mb-2">
          <div className="flex items-center justify-between group-data-[collapsible=icon]:justify-center">
            <div className="flex items-center gap-2 group-data-[collapsible=icon]:hidden">
              <div className="size-6 bg-black text-white rounded-md flex items-center justify-center font-bold text-xs">
                He
              </div>
              <span className="font-semibold text-sm">Hessa</span>
              <ChevronDown className="size-3 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-1 group-data-[collapsible=icon]:hidden">
              <Button variant="ghost" size="icon" className="size-8">
                <Search className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="size-8">
                <MessageSquare className="size-4" />
              </Button>
            </div>

            {/* Icon-only fallback */}
            <div className="hidden group-data-[collapsible=icon]:flex">
              <div className="size-6 bg-black text-white rounded-md flex items-center justify-center font-bold text-xs">
                He
              </div>
            </div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {/* Inbox / Issues Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-8 text-sm font-medium">
                  <Inbox className="size-4" />
                  <span>Inbox</span>
                  <span className="ml-auto bg-foreground/10 text-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-sm">7</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="h-8 text-sm font-medium">
                  <CircleDashed className="size-4 text-muted-foreground" />
                  <span>My issues</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground/70 tracking-tight flex items-center justify-between cursor-pointer hover:text-foreground transition-colors group/label mb-1">
            Workspace <ChevronDown className="size-3 opacity-0 group-hover/label:opacity-100 transition-opacity" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/">
                    <LayoutDashboard className="size-4" />
                    <span>Дашборд</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/users"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/users">
                    <Users className="size-4" />
                    <span>Пользователи</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/employees"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/employees">
                    <Briefcase className="size-4" />
                    <span>Сотрудники</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/orders"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/orders">
                    <ClipboardList className="size-4" />
                    <span>Заказы</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/analysis"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/analysis">
                    <ClipboardList className="size-4" />
                    <span>Анализы</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/products"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/products">
                    <SquareStack className="size-4" />
                    <span>Товары</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/categories"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/categories">
                    <Layers className="size-4" />
                    <span>Категории</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/quiz"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/quiz">
                    <HelpCircle className="size-4" />
                    <span>Викторина</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/promo-codes"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/promo-codes">
                    <Megaphone className="size-4" />
                    <span>Промокоды</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/plans"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/plans">
                    <Sparkles className="size-4" />
                    <span>Планы</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel className="px-2 text-xs font-semibold text-muted-foreground/70 tracking-tight flex items-center justify-between cursor-pointer hover:text-foreground transition-colors group/label mb-1">
            Веб сайт <ChevronDown className="size-3 opacity-0 group-hover/label:opacity-100 transition-opacity" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/main-page"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/main-page">
                    <SquareStack className="size-4" />
                    <span>Главная страница</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/about"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/about">
                    <SquareStack className="size-4" />
                    <span>О нас</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/services"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/services">
                    <SquareStack className="size-4" />
                    <span>Услуги</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/faq"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/faq">
                    <HelpCircle className="size-4" />
                    <span>FAQ</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/footer"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/footer">
                    <LayoutPanelTop className="size-4" />
                    <span>Футер</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/companies"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/companies">
                    <Briefcase className="size-4" />
                    <span>Компании</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/contacts-info"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/contacts-info">
                    <MapPin className="size-4" />
                    <span>Контакты</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/return"} className="h-8 text-sm text-muted-foreground font-medium">
                  <Link href="/return">
                    <Undo2 className="size-4" />
                    <span>Возврат</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>


      </SidebarContent>

      <SidebarFooter className="p-4">
        <div className="space-y-1 mb-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-7 text-sm text-muted-foreground">
                <MessageSquare className="size-4" />
                <span>Обратная связь</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-7 text-sm text-muted-foreground">
                <Settings className="size-4" />
                <span>Настройки</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton className="h-7 text-sm text-muted-foreground">
                <HelpCircle className="size-4" />
                <span>Помощь</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>


      </SidebarFooter>
    </Sidebar >
  );
}
