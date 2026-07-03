"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  BookOpen,
  FileText,
  Settings,
  GraduationCap,
  BarChart3,
  Menu,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Clock } from "@/components/clock";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/estudiantes", label: "Estudiantes", icon: Users },
  { href: "/admin/asistencia", label: "Asistencia", icon: CalendarCheck },
  { href: "/admin/agenda", label: "Agenda", icon: BookOpen },
  { href: "/admin/reportes", label: "Reportes", icon: BarChart3 },
  { href: "/admin/documentacion", label: "Documentación", icon: FileText },
  { href: "/admin/configuracion", label: "Configuración", icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Desktop sidebar */}
      <aside
        className={cn(
          "hidden flex-col border-r bg-card lg:flex transition-all duration-200",
          collapsed ? "w-[68px]" : "w-64",
        )}
      >
        <div
          className={cn(
            "flex items-center border-b py-4",
            collapsed ? "justify-center px-2" : "justify-between px-4",
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <GraduationCap className="h-6 w-6 shrink-0 text-primary" />
            {!collapsed && <span className="font-bold whitespace-nowrap">Curso Computación</span>}
          </div>
          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="shrink-0 p-1 text-muted-foreground hover:bg-accent rounded"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>
        {collapsed && (
          <div className="flex justify-center border-b py-2">
            <button
              onClick={() => setCollapsed(false)}
              className="p-1 text-muted-foreground hover:bg-accent rounded"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>
          </div>
        )}
        <nav className="flex-1 space-y-1 p-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 font-medium transition-colors",
                  collapsed ? "justify-center" : "",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                )}
              >
                <Icon className={cn("shrink-0", collapsed ? "h-6 w-6" : "h-4 w-4")} />
                {!collapsed && <span className="text-sm">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className={cn("border-t", collapsed ? "p-2" : "p-4")}>
          {!collapsed && <Clock />}
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        {/* Mobile header */}
        <header className="flex items-center justify-between border-b bg-card px-4 py-3 lg:hidden">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-semibold">Curso Computación</span>
          </div>
          <div className="flex items-center gap-1">
            <ThemeSwitcher />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-md p-2 text-muted-foreground hover:bg-accent"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <nav className="border-b bg-card p-2 lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        <main className="flex-1 overflow-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
