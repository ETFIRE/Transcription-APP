'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { LayoutDashboard, Mic, History, Menu, X, Plus, Settings, ShieldCheck, LogOut } from 'lucide-react'
import { ScribeLogo } from '@/components/scribe-logo'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'

const nav = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/capture', label: 'New capture', icon: Mic },
  { href: '/history', label: 'History', icon: History },
  { href: '/privacy', label: 'Privacy', icon: ShieldCheck },
]

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  return (
    <nav className="flex flex-col gap-1">
      {nav.map((item) => {
        const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const [userEmail, setUserEmail] = useState('Chargement...')
  const router = useRouter()

  useEffect(() => {
    async function fetchUser() {
      try {
        const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('scribe_email') : null

        if (!savedEmail) {
          router.push('/signin')
          return
        }

        const { data, error } = await supabase
          .from('tenants')
          .select('email')
          .eq('email', savedEmail)
          .single()

        if (data?.email) {
          setUserEmail(data.email)
        } else {
          setUserEmail(savedEmail)
        }
      } catch (err) {
        setUserEmail('Mon Compte')
      }
    }
    fetchUser()
  }, [router])

  const handleSignOut = () => {
    localStorage.removeItem('scribe_email')
    router.push('/signin')
  }

  const initials = userEmail !== 'Chargement...' && userEmail !== 'Mon Compte' ? userEmail.substring(0, 2).toUpperCase() : 'SC'
  const displayName = userEmail.includes('@') ? userEmail.split('@')[0] : userEmail

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="px-2 pt-1">
        <Link href="/" onClick={onNavigate}>
          <ScribeLogo />
        </Link>
      </div>

      <Button asChild className="justify-start gap-2">
        <Link href="/capture" onClick={onNavigate}>
          <Plus className="h-4 w-4" />
          New meeting
        </Link>
      </Button>

      <NavLinks onNavigate={onNavigate} />

      <div className="mt-auto flex flex-col gap-3">
        <Link
          href="/settings"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Link>
        
        <div className="flex items-center justify-between rounded-lg border border-sidebar-border bg-card p-3">
          <div className="flex items-center gap-3 min-w-0">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-brand text-brand-foreground text-xs">{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium capitalize">{displayName}</p>
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0" 
            onClick={handleSignOut}
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close menu"
            className="absolute inset-0 bg-foreground/40"
            onClick={() => setOpen(false)}
          />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-sidebar-border bg-sidebar">
            <SidebarContent onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-border bg-background/80 px-4 py-3 backdrop-blur lg:hidden">
          <Link href="/">
            <ScribeLogo />
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </header>

        <main className="flex-1">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</div>
        </main>
      </div>
    </div>
  )
}