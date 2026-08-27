'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Radio, UserCheck } from 'lucide-react'

export default function JoinMeetingPage() {
  const params = useParams()
  const meetingId = params.id as string
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [meeting, setMeeting] = useState<any>(null)
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function checkMeeting() {
      try {
        const { data, error } = await supabase
          .from('reunions')
          .select('id, titre, statut, cree_le')
          .eq('id', meetingId)
          .maybeSingle()

        if (error || !data) {
          setError('Réunion introuvable.')
        } else {
          setMeeting(data)
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    if (meetingId) checkMeeting()
  }, [meetingId])

  const handleJoin = async () => {
    setJoining(true)
    const storedEmail =
      typeof window !== 'undefined'
        ? localStorage.getItem('scribe_email') || localStorage.getItem('email') || 'Invité'
        : 'Invité'

    try {
      const res = await fetch('/api/livekit/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          roomName: meetingId,
          participantName: storedEmail,
        }),
      })

      const data = await res.json()
      if (!res.ok || !data.token) throw new Error(data.error || 'Erreur token LiveKit')

      // Redirection vers /capture avec le token LiveKit et l'ID de la réunion
      router.push(`/capture?room=${meetingId}&token=${data.token}`)
    } catch (err: any) {
      setError(err.message)
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

  if (error || !meeting) {
    return (
      <div className="max-w-md mx-auto mt-20 p-6 text-center space-y-4">
        <div className="text-destructive font-medium">{error || 'Session inaccessible'}</div>
        <Button variant="outline" onClick={() => router.push('/dashboard')}>
          Retour au tableau de bord
        </Button>
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-2">
            <Radio className="h-6 w-6 animate-pulse" />
          </div>
          <CardTitle className="text-2xl font-bold">{meeting.titre || 'Réunion en direct'}</CardTitle>
          <CardDescription>
            Une session audio est en cours. Cliquez ci-dessous pour vous y connecter.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="rounded-lg bg-secondary/50 p-4 text-xs text-muted-foreground space-y-1">
            <p><strong>ID de la salle :</strong> {meeting.id}</p>
            <p><strong>Statut :</strong> En direct</p>
          </div>

          <Button onClick={handleJoin} className="w-full" disabled={joining}>
            {joining ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <UserCheck className="h-4 w-4 mr-2" />
            )}
            Rejoindre la salle
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}