'use client'

import { useState } from 'react'
import { Share2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ShareMeetingButton({ meetingId }: { meetingId: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    const shareUrl = `${window.location.origin}/join/${meetingId}`
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleCopy}
      className="flex items-center gap-2"
    >
      {copied ? (
        <>
          <Check className="h-4 w-4 text-emerald-500" />
          <span>Lien copié !</span>
        </>
      ) : (
        <>
          <Share2 className="h-4 w-4" />
          <span>Inviter / Partager</span>
        </>
      )}
    </Button>
  )
}