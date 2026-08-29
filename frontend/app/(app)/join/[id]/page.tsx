'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Radio, UserCheck, LogIn } from 'lucide-react'

export default function JoinMeetingPage() {
  const params = useParams()
  const meetingId = decodeURIComponent((params.id as string) || '')
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [meetingTitle, setMeetingTitle] = useState<string>('')
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null)

  useEffect(() => {
    async function init() {
      if (!meetingId) {
        setError('Identifiant de salle manquant.')
        setLoading(false)
        return
      }

      // 1. Vérifier si l'utilisateur est connecté
      const storedEmail =
        typeof window !== 'undefined'
          ? localStorage.getItem('scribe_email') || localStorage.getItem('email')
          : null

      if (!storedEmail) {
        // Redirection vers la page de connexion avec l'URL de retour
        router.push(`/signin?redirect=${encodeURIComponent(`/join/${meetingId}`)}`)
        return
      }

      setCurrentUserEmail(storedEmail)

      // 2. Vérifier si c'est un UUID de réunion dans Supabase pour récupérer le vrai titre
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
          // Si échec, on applique le fallback
        }
      }

      const defaultTitle =
        meetingId === 'salon-principal'
          ? 'Salon Principal'
          : `Salle ${meetingId}`
      setMeetingTitle(defaultTitle)
      setLoading(false)
    }

    init()
  }, [meetingId, router])

  const handleJoin = async () => {
    if (!currentUserEmail) {
      router.push(`/signin?redirect=${encodeURIComponent(`/join/${meetingId}`)}`)
      return
    }

    setJoining(true)
    setError(null)

    try {
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: meetingId,
          participantName: currentUserEmail,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.token) {
        throw new Error(data.error || 'Impossible de générer le token de connexion.')
      }

      // Redirection vers le flux live avec le token et le titre exact
      router.push(
        `/capture?room=${encodeURIComponent(meetingId)}&token=${data.token}&title=${encodeURIComponent(meetingTitle)}`
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
            Une session audio / vidéo est ouverte. Cliquez ci-dessous pour rejoindre la réunion.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-secondary/50 p-4 text-xs text-muted-foreground space-y-1">
            <p><strong>Salle :</strong> {meetingId}</p>
            <p><strong>Connecté en tant que :</strong> {currentUserEmail}</p>
          </div>

          {error && (
            <div className="rounded-md bg-destructive/15 p-3 text-xs text-destructive">
              {error}
            </div>
          )}

          <Button onClick={handleJoin} className="w-full" disabled={joining}>
            {joining ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Connexion en cours...
              </>
            ) : (
              <>
                <UserCheck className="h-4 w-4 mr-2" />
                Rejoindre la salle
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}