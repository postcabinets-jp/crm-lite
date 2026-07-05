'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Users, BarChart3, Activity, Settings, LayoutDashboard } from 'lucide-react'

const navItems = [
  { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  { href: '/dashboard/contacts', label: 'コンタクト', icon: Users },
  { href: '/dashboard/deals', label: '案件', icon: BarChart3 },
  { href: '/dashboard/activities', label: 'アクティビティ', icon: Activity },
  { href: '/dashboard/settings', label: '設定', icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex w-56 flex-col border-r border-neutral-200 bg-white">
      <div className="flex items-center gap-2 px-4 h-14 border-b border-neutral-200">
        <div className="w-6 h-6 bg-neutral-900 rounded flex items-center justify-center">
          <Users className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-semibold text-sm text-neutral-900">CRM Lite</span>
      </div>
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-neutral-100 text-neutral-900 font-medium'
                  : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50',
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
