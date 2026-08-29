'use client'

import { Volume2, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AudioPlayerProps {
  audioUrl: string
  title?: string
}

export function AudioPlayer({ audioUrl, title }: AudioPlayerProps) {
  if (!audioUrl) return null

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Volume2 className="h-4 w-4 text-primary" />
          <span>Enregistrement audio source</span>
        </div>
        <a href={audioUrl} download={`${title || 'reunion'}.webm`} target="_blank" rel="noreferrer">
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground">
            <Download className="h-3.5 w-3.5" />
            Télécharger
          </Button>
        </a>
      </div>

      <audio controls className="w-full h-10 rounded-md outline-none">
        <source src={audioUrl} type="audio/webm" />
        <source src={audioUrl} type="audio/mp3" />
        Votre navigateur ne prend pas en charge la lecture audio.
      </audio>
    </div>
  )
} 