import Link from 'next/link'
import { ScribeLogo } from '@/components/scribe-logo'
import { Button } from '@/components/ui/button'

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="Scribe home">
          <ScribeLogo />
        </Link>
        <nav className="hidden items-center gap-8 md:flex">
          <a href="#modes" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Capture modes
          </a>
          <a href="#how" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            How it works
          </a>
          <a href="#privacy" className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Privacy
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/signin">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/signin">Open app</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}