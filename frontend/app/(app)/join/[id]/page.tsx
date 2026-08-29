'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Radio, UserCheck, User } from 'lucide-react'

export default function JoinMeetingPage() {
  const params = useParams()
  const meetingId = decodeURIComponent((params.id as string) || '')
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [meetingTitle, setMeetingTitle] = useState<string>('')
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState<string>('')

  useEffect(() => {
    async function init() {
      if (!meetingId) {
        setError('Identifiant de salle manquant.')
        setLoading(false)
        return
      }

      const storedEmail =
        typeof window !== 'undefined'
          ? localStorage.getItem('scribe_email') || localStorage.getItem('email')
          : null

      if (!storedEmail) {
        router.push(`/signin?redirect=${encodeURIComponent(`/join/${meetingId}`)}`)
        return
      }

      setCurrentUserEmail(storedEmail)

      // Pré-remplir le nom du participant
      const savedName = localStorage.getItem('scribe_display_name')
      if (savedName) {
        setDisplayName(savedName)
      } else {
        const defaultName = storedEmail.split('@')[0].replace(/[._-]/g, ' ')
        setDisplayName(defaultName.charAt(0).toUpperCase() + defaultName.slice(1))
      }

      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(meetingId)

      if (isUuid) {
        try {
          const { data } = await supabase
            .from('reunions')
            .select('titre')
            .eq('id', meetingId)
            .maybeSingle()

          if (data?.titre) {
            setMeetingTitle(data.titre)
            setLoading(false)
            return
          }
        } catch {
          // Fallback
        }
      }

      setMeetingTitle(meetingId === 'salon-principal' ? 'Salon Principal' : `Salle ${meetingId}`)
      setLoading(false)
    }

    init()
  }, [meetingId, router])

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentUserEmail) return

    setJoining(true)
    setError(null)

    const finalParticipantName = displayName.trim() || currentUserEmail.split('@')[0]
    localStorage.setItem('scribe_display_name', finalParticipantName)

    try {
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: meetingId,
          participantName: finalParticipantName,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Impossible de générer le token de connexion.')
      }

      router.push(
        `/capture?room=${encodeURIComponent(meetingId)}&token=${data.token}&title=${encodeURIComponent(meetingTitle)}&username=${encodeURIComponent(finalParticipantName)}`
      )
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la connexion.')
      setJoining(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg border">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
            <Radio className="h-6 w-6 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold">{meetingTitle}</CardTitle>
          <CardDescription>
            Indiquez votre nom avant de rejoindre la visioconférence.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleJoin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guestName" className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" /> Votre nom affiché
              </Label>
              <Input
                id="guestName"
                type="text"
                required
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ex: Thomas Martin"
              />
            </div>

            <div className="rounded-lg bg-secondary/50 p-3 text-xs text-muted-foreground space-y-1">
              <p><strong>Salle :</strong> {meetingId}</p>
              <p><strong>Compte :</strong> {currentUserEmail}</p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={joining}>
              {joining ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Connexion...
                </>
              ) : (
                <>
                  <UserCheck className="h-4 w-4 mr-2" />
                  Rejoindre la salle
                </>
              )}
            </Button>
          </CardContent>
        </form>
      </Card>
    </div>
  )
}