'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { ShieldCheck, Clock, Trash2, Users, ArrowLeft, User } from 'lucide-react'
import type { CaptureMode } from '@/lib/types'

export function ConsentScreen({
  mode,
  onBack,
  onConfirm,
}: {
  mode: CaptureMode
  onBack: () => void
  onConfirm: (title: string, hostName: string) => void
}) {
  const [title, setTitle] = useState('')
  const [hostName, setHostName] = useState('')
  const [consent, setConsent] = useState(false)
  const [notify, setNotify] = useState(true)
  const [retention, setRetention] = useState(true)

  useEffect(() => {
    const savedName = localStorage.getItem('scribe_display_name')
    if (savedName) {
      setHostName(savedName)
    } else {
      const email = localStorage.getItem('scribe_email') || localStorage.getItem('email') || ''
      if (email) {
        const defaultName = email.split('@')[0].replace(/[._-]/g, ' ')
        setHostName(defaultName.charAt(0).toUpperCase() + defaultName.slice(1))
      }
    }
  }, [])

  const handleProceed = () => {
    const finalName = hostName.trim() || 'Hôte'
    localStorage.setItem('scribe_display_name', finalName)
    onConfirm(title.trim() || 'Untitled meeting', finalName)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-4 gap-1.5">
        <ArrowLeft className="h-4 w-4" />
        Back to modes
      </Button>

      <Card>
        <CardHeader>
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 text-brand">
            <ShieldCheck className="h-5 w-5" />
          </span>
          <h2 className="mt-4 text-xl font-semibold">Participant consent</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            A meeting recording contains voices — considered personal, potentially biometric data. Before
            capturing, confirm that participants have been informed and consent to being recorded.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="host-name" className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Your name (Speaker)
              </Label>
              <Input
                id="host-name"
                placeholder="e.g. Alexandre Dupont"
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="meeting-title">Meeting title</Label>
              <Input
                id="meeting-title"
                placeholder="e.g. Q3 Product Roadmap Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-secondary/40 p-4">
            <ConsentRow
              icon={Users}
              title="Recording consent"
              body="All participants are aware this meeting is being recorded and transcribed."
              checked={consent}
              onChange={setConsent}
            />
            <ConsentRow
              icon={ShieldCheck}
              title="On-screen notice"
              body="Show a visible recording indicator to everyone for the whole session."
              checked={notify}
              onChange={setNotify}
            />
            <ConsentRow
              icon={Clock}
              title="30-day retention"
              body="Automatically delete the raw recording after 30 days; keep the report only."
              checked={retention}
              onChange={setRetention}
            />
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <Trash2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Any participant may request erasure of their data at any time. This prototype uses sample data
            and does not record real audio to a server.
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={onBack}>
              Cancel
            </Button>
            <Button disabled={!consent} onClick={handleProceed}>
              {consent ? `Continue to ${mode === 'video' ? 'video room' : 'recorder'}` : 'Confirm consent to continue'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function ConsentRow({
  icon: Icon,
  title,
  body,
  checked,
  onChange,
}: {
  icon: React.ElementType
  title: string
  body: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{body}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={title} />
    </div>
  )
}