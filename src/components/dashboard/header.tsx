'use client'

import { signOut } from '@/app/actions/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User } from 'lucide-react'

interface DashboardHeaderProps {
  user: {
    display_name: string | null
    email: string
    avatar_url: string | null
  }
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="h-14 border-b border-neutral-200 bg-white flex items-center justify-between px-6">
      <div />
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm hover:bg-neutral-50 transition-colors outline-none">
          <div className="w-6 h-6 bg-neutral-200 rounded-full flex items-center justify-center">
            <User className="w-3.5 h-3.5 text-neutral-600" />
          </div>
          <span className="text-neutral-700">
            {user.display_name || user.email}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem className="text-xs text-neutral-500" disabled>
            {user.email}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => signOut()}
            className="text-red-600 cursor-pointer"
          >
            <LogOut className="w-4 h-4 mr-2" />
            ログアウト
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
