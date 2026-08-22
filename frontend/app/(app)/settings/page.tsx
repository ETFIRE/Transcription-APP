'use client'

import { useState } from 'react'
import { PageHeader } from '@/components/page-header'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'

export default function SettingsPage() {
  const [notice, setNotice] = useState(true)
  const [autoDelete, setAutoDelete] = useState(true)
  const [anon, setAnon] = useState(false)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
      <PageHeader title="Settings" description="Profile, capture defaults, and data retention preferences." />

      <div className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold">Profile</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="Amelia Chen" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="amelia@acme.co" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="text-base font-semibold">Capture & privacy</h3>
          </CardHeader>
          <CardContent className="space-y-1">
            <SettingRow
              title="On-screen recording notice"
              body="Show a persistent recording indicator to all participants."
              checked={notice}
              onChange={setNotice}
            />
            <Separator />
            <div className="flex items-center justify-between gap-4 py-3">
              <div>
                <p className="text-sm font-medium">Default retention</p>
                <p className="text-xs text-muted-foreground">How long raw recordings are kept.</p>
              </div>
              <Select defaultValue="30">
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                  <SelectItem value="forever">Keep forever</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <SettingRow
              title="Auto-delete raw audio"
              body="Delete recordings after the retention window; keep only reports."
              checked={autoDelete}
              onChange={setAutoDelete}
            />
            <Separator />
            <SettingRow
              title="Anonymize transcripts"
              body="Replace speaker names with generic labels in stored transcripts."
              checked={anon}
              onChange={setAnon}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SettingRow({
  title,
  body,
  checked,
  onChange,
}: {
  title: string
  body: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{body}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} aria-label={title} />
    </div>
  )
}
