'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'

export default function SettingsPage() {
  const [name, setName] = useState('Utilisateur')
  const [email, setEmail] = useState('')
  const [recordingNotice, setRecordingNotice] = useState(true)
  const [retention, setRetention] = useState('30')
  const [autoDelete, setAutoDelete] = useState(false)
  const [anonymize, setAnonymize] = useState(false)

  useEffect(() => {
    async function loadTenantData() {
      try {
        const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('scribe_email') : null

        let query = supabase.from('tenants').select('email, mis_a_jour_le')
        if (savedEmail) {
          query = query.eq('email', savedEmail)
        } else {
          query = query.order('mis_a_jour_le', { ascending: false }).limit(1)
        }

        const { data, error } = await query.single()

        if (data?.email) {
          setEmail(data.email)
          localStorage.setItem('scribe_email', data.email)
          const derivedName = data.email.split('@')[0]
          setName(derivedName.charAt(0).toUpperCase() + derivedName.slice(1))
        }
      } catch (err) {
        console.error('Erreur chargement profil settings:', err)
      }
    }

    loadTenantData()
  }, [])

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Profile, capture defaults, and data retention preferences.
        </p>
      </div>

      {/* Section Profile */}
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Manage your public profile and account details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                localStorage.setItem('scribe_email', e.target.value)
              }}
              placeholder="Your email address"
            />
          </div>
        </CardContent>
      </Card>

      {/* Section Capture & Privacy */}
      <Card>
        <CardHeader>
          <CardTitle>Capture & privacy</CardTitle>
          <CardDescription>Configure recording notifications and audio handling rules.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="recording-notice">On-screen recording notice</Label>
              <p className="text-sm text-muted-foreground">
                Show a persistent recording indicator to all participants.
              </p>
            </div>
            <Switch
              id="recording-notice"
              checked={recordingNotice}
              onCheckedChange={setRecordingNotice}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="retention">Default retention</Label>
              <p className="text-sm text-muted-foreground">
                How long raw recordings are kept (in days).
              </p>
            </div>
            <Select value={retention} onValueChange={setRetention}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Retention" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7</SelectItem>
                <SelectItem value="30">30</SelectItem>
                <SelectItem value="90">90</SelectItem>
                <SelectItem value="365">365</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-delete">Auto-delete raw audio</Label>
              <p className="text-sm text-muted-foreground">
                Delete recordings after the retention window; keep only reports.
              </p>
            </div>
            <Switch
              id="auto-delete"
              checked={autoDelete}
              onCheckedChange={setAutoDelete}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="anonymize">Anonymize transcripts</Label>
              <p className="text-sm text-muted-foreground">
                Automatically mask personal identifiers and speaker details.
              </p>
            </div>
            <Switch
              id="anonymize"
              checked={anonymize}
              onCheckedChange={setAnonymize}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}