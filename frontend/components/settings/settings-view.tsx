'use client'

import * as React from 'react'
import {
  Bell,
  Check,
  Copy,
  CreditCard,
  Cpu,
  Download,
  ExternalLink,
  KeyRound,
  LogOut,
  Mail,
  Save,
  Settings as SettingsIcon,
  Shield,
  Sparkles,
  Trash2,
  User,
  Zap,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog } from '@/components/ui/dialog'
import { useToast } from '@/components/ui/toast'
import { subtitleLanguages } from '@/lib/caption-presets'
import { cn } from '@/lib/utils'

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string
  hint?: string
  htmlFor?: string
  children: React.ReactNode
}) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start sm:gap-4">
      <div className="sm:pt-2.5">
        <label htmlFor={htmlFor} className="text-xs font-medium">
          {label}
        </label>
        {hint ? <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{hint}</p> : null}
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  )
}

function SectionCard({
  title,
  description,
  icon: Icon,
  children,
  footer,
}: {
  title: string
  description?: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/70 bg-card/60 shadow-soft">
      <div className="flex items-start gap-3 border-b border-border/60 px-4 py-3.5 sm:px-5">
        <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/12 text-primary">
          <Icon className="h-4 w-4" />
        </span>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          {description ? <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{description}</p> : null}
        </div>
      </div>
      <div className="space-y-4 px-4 py-4 sm:px-5">{children}</div>
      {footer ? <div className="border-t border-border/60 bg-secondary/20 px-4 py-2.5 sm:px-5">{footer}</div> : null}
    </section>
  )
}

function ToggleRow({
  title,
  description,
  checked,
  onCheckedChange,
}: {
  title: string
  description: string
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-border/60 bg-background/30 px-3 py-2.5">
      <div className="min-w-0">
        <p className="text-xs font-medium">{title}</p>
        <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} label={title} />
    </div>
  )
}

const plans = [
  { name: 'Free', clips: 20, price: '$0' },
  { name: 'Pro', clips: 200, price: '$19' },
  { name: 'Studio', clips: 1000, price: '$49' },
]

export function SettingsView() {
  const { toast } = useToast()
  const [tab, setTab] = React.useState('profile')
  const [dirty, setDirty] = React.useState(false)
  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [confirmText, setConfirmText] = React.useState('')
  const [showKey, setShowKey] = React.useState(false)

  const [profile, setProfile] = React.useState({
    name: 'Alex Chen',
    email: 'alex@studio.co',
    handle: '@alexcreates',
    timezone: 'Asia/Kolkata',
  })
  const [workspace, setWorkspace] = React.useState({
    name: "Alex's Studio",
    language: 'auto',
    aspect: '9:16',
    clipLength: 30,
    brandKit: 'studio',
    autoApplyBrand: true,
  })
  const [processing, setProcessing] = React.useState({
    model: 'whisper-large-v3',
    aggressiveness: 62,
    faceTracking: true,
    removeSilences: true,
    autoCaptions: true,
    hardware: 'auto',
  })
  const [notifications, setNotifications] = React.useState({
    clipReady: true,
    weeklyDigest: true,
    productUpdates: false,
    billing: true,
    marketing: false,
  })

  function markDirty() {
    setDirty(true)
  }

  function handleSave() {
    setDirty(false)
    toast({
      title: 'Settings saved',
      description: 'Your preferences are stored locally for this demo session.',
      variant: 'success',
    })
  }

  async function copyKey() {
    try {
      await navigator.clipboard.writeText('cf_live_9f2a7c41d8e34b6a')
      toast({ title: 'API key copied', variant: 'success' })
    } catch {
      toast({ title: 'Could not access clipboard', variant: 'error' })
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-primary/12 text-primary">
              <SettingsIcon className="h-3.5 w-3.5" />
            </span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">Studio</span>
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Manage your account, processing defaults, notifications and plan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dirty ? <span className="text-[10px] text-muted-foreground">Unsaved changes</span> : null}
          <Button size="sm" onClick={handleSave} disabled={!dirty}>
            <Save className="h-3.5 w-3.5" /> Save changes
          </Button>
        </div>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList aria-label="Settings sections" className="w-full justify-start overflow-x-auto scrollbar-none">
          <TabsTrigger value="profile">
            <User className="h-3.5 w-3.5" /> Profile
          </TabsTrigger>
          <TabsTrigger value="workspace">
            <Sparkles className="h-3.5 w-3.5" /> Workspace
          </TabsTrigger>
          <TabsTrigger value="processing">
            <Cpu className="h-3.5 w-3.5" /> Processing
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-3.5 w-3.5" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-3.5 w-3.5" /> Billing
          </TabsTrigger>
          <TabsTrigger value="advanced">
            <Shield className="h-3.5 w-3.5" /> Advanced
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-4 space-y-4">
          <SectionCard
            title="Your profile"
            description="This is how you appear across the workspace and in shared clips."
            icon={User}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-fuchsia-500 via-violet-500 to-blue-500 text-lg font-bold text-white shadow-glow-sm ring-4 ring-background">
                {profile.name
                  .split(' ')
                  .map((part) => part[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toast({ title: 'Avatar upload lands in Phase 2', description: 'Storage service not connected yet.' })}
                  >
                    Change avatar
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toast({ title: 'Avatar removed' })}>
                    Remove
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground">JPG or PNG, at least 256×256px.</p>
              </div>
            </div>

            <div className="space-y-4 border-t border-border/60 pt-4">
              <Field label="Full name" htmlFor="profile-name">
                <Input
                  id="profile-name"
                  value={profile.name}
                  onChange={(event) => {
                    setProfile((current) => ({ ...current, name: event.target.value }))
                    markDirty()
                  }}
                />
              </Field>
              <Field label="Email" hint="Used for sign-in and receipts." htmlFor="profile-email">
                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="profile-email"
                    type="email"
                    value={profile.email}
                    onChange={(event) => {
                      setProfile((current) => ({ ...current, email: event.target.value }))
                      markDirty()
                    }}
                    className="pl-9"
                  />
                </div>
              </Field>
              <Field label="Handle" hint="Shown on shared preview links." htmlFor="profile-handle">
                <Input
                  id="profile-handle"
                  value={profile.handle}
                  onChange={(event) => {
                    setProfile((current) => ({ ...current, handle: event.target.value }))
                    markDirty()
                  }}
                />
              </Field>
              <Field label="Timezone" hint="Used for scheduling and reports." htmlFor="profile-timezone">
                <select
                  id="profile-timezone"
                  value={profile.timezone}
                  onChange={(event) => {
                    setProfile((current) => ({ ...current, timezone: event.target.value }))
                    markDirty()
                  }}
                  className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                  <option value="America/New_York">America/New_York (ET)</option>
                  <option value="America/Los_Angeles">America/Los_Angeles (PT)</option>
                </select>
              </Field>
            </div>
          </SectionCard>

          <SectionCard
            title="Security"
            description="Keep your account protected."
            icon={Shield}
            footer={
              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                <LogOut className="h-3.5 w-3.5" /> Sign out of all devices
              </Button>
            }
          >
            <ToggleRow
              title="Two-factor authentication"
              description="Require a one-time code when signing in from a new device."
              checked
              onCheckedChange={() => toast({ title: '2FA setup arrives with auth in Phase 2' })}
            />
            <ToggleRow
              title="Session alerts"
              description="Email me when a new device signs in to my account."
              checked
              onCheckedChange={() => toast({ title: 'Session alerts are enabled in this demo' })}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="workspace" className="mt-4 space-y-4">
          <SectionCard
            title="Workspace defaults"
            description="Applied to every new project unless you override them."
            icon={Sparkles}
          >
            <Field label="Workspace name" htmlFor="workspace-name">
              <Input
                id="workspace-name"
                value={workspace.name}
                onChange={(event) => {
                  setWorkspace((current) => ({ ...current, name: event.target.value }))
                  markDirty()
                }}
              />
            </Field>
            <Field label="Default language" hint="Auto-detect handles Hindi, English and Hinglish." htmlFor="workspace-language">
              <select
                id="workspace-language"
                value={workspace.language}
                onChange={(event) => {
                  setWorkspace((current) => ({ ...current, language: event.target.value }))
                  markDirty()
                }}
                className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25"
              >
                <option value="auto">Auto-detect</option>
                {subtitleLanguages.map((language) => (
                  <option key={language.code} value={language.code}>
                    {language.label} · {language.native}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Default aspect ratio">
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { value: '9:16', label: '9:16', hint: 'Reels · Shorts' },
                  { value: '1:1', label: '1:1', hint: 'Feed' },
                  { value: '16:9', label: '16:9', hint: 'YouTube' },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setWorkspace((current) => ({ ...current, aspect: option.value }))
                      markDirty()
                    }}
                    className={cn(
                      'rounded-xl border px-2 py-2 text-center transition-colors',
                      workspace.aspect === option.value
                        ? 'border-primary/40 bg-primary/10 text-foreground'
                        : 'border-border/70 text-muted-foreground hover:bg-secondary/60',
                    )}
                  >
                    <span className="block text-xs font-semibold">{option.label}</span>
                    <span className="block text-[9px] text-muted-foreground">{option.hint}</span>
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Target clip length" hint="Highlights will be scored within this window.">
              <div className="flex items-center gap-3">
                <Slider
                  value={workspace.clipLength}
                  min={15}
                  max={60}
                  step={5}
                  onValueChange={(value) => {
                    setWorkspace((current) => ({ ...current, clipLength: value }))
                    markDirty()
                  }}
                  label="Target clip length"
                  className="flex-1"
                />
                <span className="w-14 shrink-0 rounded-lg bg-secondary px-2 py-1 text-center text-[11px] tabular-nums">
                  {workspace.clipLength}s
                </span>
              </div>
            </Field>
            <Field label="Default brand kit" hint="Colors, logo and caption style for new clips." htmlFor="workspace-brand">
              <select
                id="workspace-brand"
                value={workspace.brandKit}
                onChange={(event) => {
                  setWorkspace((current) => ({ ...current, brandKit: event.target.value }))
                  markDirty()
                }}
                className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25"
              >
                <option value="studio">Alex&apos;s Studio</option>
                <option value="podcast">Deep Dive Podcast</option>
              </select>
            </Field>
            <ToggleRow
              title="Auto-apply brand kit"
              description="Use the selected kit on new projects without asking."
              checked={workspace.autoApplyBrand}
              onCheckedChange={(checked) => {
                setWorkspace((current) => ({ ...current, autoApplyBrand: checked }))
                markDirty()
              }}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="processing" className="mt-4 space-y-4">
          <SectionCard
            title="Transcription & AI"
            description="Tune how ClipForge listens, scores and cuts your footage."
            icon={Cpu}
          >
            <Field label="Whisper model" hint="Larger models are slower but more accurate for Hinglish." htmlFor="processing-model">
              <select
                id="processing-model"
                value={processing.model}
                onChange={(event) => {
                  setProcessing((current) => ({ ...current, model: event.target.value }))
                  markDirty()
                }}
                className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25"
              >
                <option value="whisper-large-v3">Whisper large-v3 · best quality</option>
                <option value="whisper-medium">Whisper medium · balanced</option>
                <option value="whisper-small">Whisper small · fastest</option>
              </select>
            </Field>
            <Field label="Highlight aggressiveness" hint="Higher values pick bolder, more opinionated moments.">
              <div className="flex items-center gap-3">
                <Slider
                  value={processing.aggressiveness}
                  min={0}
                  max={100}
                  onValueChange={(value) => {
                    setProcessing((current) => ({ ...current, aggressiveness: value }))
                    markDirty()
                  }}
                  label="Highlight aggressiveness"
                  className="flex-1"
                />
                <span className="w-14 shrink-0 rounded-lg bg-secondary px-2 py-1 text-center text-[11px] tabular-nums">
                  {processing.aggressiveness}%
                </span>
              </div>
            </Field>
            <Field label="Hardware acceleration" hint="Auto picks the best encoder available on the worker." htmlFor="processing-hardware">
              <select
                id="processing-hardware"
                value={processing.hardware}
                onChange={(event) => {
                  setProcessing((current) => ({ ...current, hardware: event.target.value }))
                  markDirty()
                }}
                className="h-10 w-full rounded-xl border border-input bg-background/60 px-3 text-sm outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/25"
              >
                <option value="auto">Auto-detect</option>
                <option value="nvenc">NVIDIA NVENC</option>
                <option value="videotoolbox">Apple VideoToolbox</option>
                <option value="cpu">CPU (x264)</option>
              </select>
            </Field>
            <div className="space-y-2 border-t border-border/60 pt-4">
              <ToggleRow
                title="Face tracking crop"
                description="Keep the active speaker centered when converting to 9:16."
                checked={processing.faceTracking}
                onCheckedChange={(checked) => {
                  setProcessing((current) => ({ ...current, faceTracking: checked }))
                  markDirty()
                }}
              />
              <ToggleRow
                title="Remove silences"
                description="Tighten pacing by trimming dead air and long pauses."
                checked={processing.removeSilences}
                onCheckedChange={(checked) => {
                  setProcessing((current) => ({ ...current, removeSilences: checked }))
                  markDirty()
                }}
              />
              <ToggleRow
                title="Generate captions automatically"
                description="Create word-level captions for every detected clip."
                checked={processing.autoCaptions}
                onCheckedChange={(checked) => {
                  setProcessing((current) => ({ ...current, autoCaptions: checked }))
                  markDirty()
                }}
              />
            </div>
          </SectionCard>

          <div className="rounded-2xl border border-warning/25 bg-warning/[0.06] p-3.5">
            <div className="flex items-start gap-2.5">
              <Zap className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
              <div>
                <p className="text-xs font-medium">Processing runs on the Celery worker</p>
                <p className="mt-0.5 text-[10px] leading-relaxed text-muted-foreground">
                  These settings are stored per workspace and passed to the job queue when Phase 2 connects the backend.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 space-y-4">
          <SectionCard title="Email notifications" description="Choose what lands in your inbox." icon={Bell}>
            <ToggleRow
              title="Clip ready"
              description="Notify me when a project finishes processing and clips are ready to review."
              checked={notifications.clipReady}
              onCheckedChange={(checked) => {
                setNotifications((current) => ({ ...current, clipReady: checked }))
                markDirty()
              }}
            />
            <ToggleRow
              title="Weekly performance digest"
              description="A Monday summary of clips generated, exports and credits used."
              checked={notifications.weeklyDigest}
              onCheckedChange={(checked) => {
                setNotifications((current) => ({ ...current, weeklyDigest: checked }))
                markDirty()
              }}
            />
            <ToggleRow
              title="Product updates"
              description="Occasional notes about new caption presets, models and integrations."
              checked={notifications.productUpdates}
              onCheckedChange={(checked) => {
                setNotifications((current) => ({ ...current, productUpdates: checked }))
                markDirty()
              }}
            />
            <ToggleRow
              title="Billing & usage alerts"
              description="Warn me at 80% and 100% of my monthly AI credits."
              checked={notifications.billing}
              onCheckedChange={(checked) => {
                setNotifications((current) => ({ ...current, billing: checked }))
                markDirty()
              }}
            />
            <ToggleRow
              title="Marketing"
              description="Tips, case studies and offers from the ClipForge team."
              checked={notifications.marketing}
              onCheckedChange={(checked) => {
                setNotifications((current) => ({ ...current, marketing: checked }))
                markDirty()
              }}
            />
          </SectionCard>
        </TabsContent>

        <TabsContent value="billing" className="mt-4 space-y-4">
          <section className="overflow-hidden rounded-2xl border border-primary/25 bg-gradient-to-br from-primary/12 via-card/70 to-accent/12 shadow-glow-sm">
            <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-semibold">Pro plan</h2>
                  <Badge variant="gradient">Current</Badge>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Renews on 1 Dec 2026 · $19/month · 2,000 AI credits
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => toast({ title: 'Billing portal arrives in Phase 2' })}>
                  Manage plan
                </Button>
                <Button size="sm" onClick={() => toast({ title: 'Upgrade flow is a Phase 1 placeholder' })}>
                  <Sparkles className="h-3.5 w-3.5" /> Upgrade
                </Button>
              </div>
            </div>
            <div className="border-t border-primary/15 bg-background/30 px-4 py-3 sm:px-5">
              <div className="mb-1.5 flex items-center justify-between text-[11px]">
                <span className="text-muted-foreground">AI credits this month</span>
                <span className="tabular-nums">760 / 2,000</span>
              </div>
              <Progress value={38} label="AI credits used" />
            </div>
          </section>

          <div className="grid gap-3 sm:grid-cols-3">
            {plans.map((plan) => {
              const current = plan.name === 'Pro'
              return (
                <div
                  key={plan.name}
                  className={cn(
                    'rounded-2xl border p-4',
                    current ? 'border-primary/35 bg-primary/[0.06]' : 'border-border/70 bg-card/50',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold">{plan.name}</h3>
                    {current ? <Check className="h-3.5 w-3.5 text-primary" /> : null}
                  </div>
                  <p className="mt-1 text-xl font-semibold tracking-tight">
                    {plan.price}
                    <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
                  </p>
                  <p className="mt-1 text-[10px] text-muted-foreground">{plan.clips} clips / month</p>
                  <Button
                    variant={current ? 'secondary' : 'outline'}
                    size="sm"
                    className="mt-3 w-full"
                    disabled={current}
                    onClick={() => toast({ title: `Switch to ${plan.name}`, description: 'Plan changes are disabled in this demo.' })}
                  >
                    {current ? 'Current plan' : 'Choose plan'}
                  </Button>
                </div>
              )
            })}
          </div>

          <SectionCard
            title="Invoices"
            description="Download receipts for your records."
            icon={CreditCard}
            footer={<span className="text-[10px] text-muted-foreground">Need a VAT invoice? Contact billing@clipforge.app</span>}
          >
            <div className="divide-y divide-border/60">
              {[
                { id: 'INV-2026-011', date: '1 Nov 2026', amount: '$19.00', status: 'Paid' },
                { id: 'INV-2026-010', date: '1 Oct 2026', amount: '$19.00', status: 'Paid' },
                { id: 'INV-2026-009', date: '1 Sep 2026', amount: '$19.00', status: 'Paid' },
              ].map((invoice) => (
                <div key={invoice.id} className="flex items-center gap-3 py-2.5 text-[11px]">
                  <span className="w-24 shrink-0 font-mono text-[10px] text-muted-foreground">{invoice.id}</span>
                  <span className="hidden flex-1 text-muted-foreground sm:block">{invoice.date}</span>
                  <span className="flex-1 tabular-nums sm:flex-none">{invoice.amount}</span>
                  <Badge variant="success" className="text-[9px]">{invoice.status}</Badge>
                  <Button variant="ghost" size="icon-sm" aria-label={`Download ${invoice.id}`} onClick={() => toast({ title: 'Invoice download is mocked' })}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </SectionCard>
        </TabsContent>

        <TabsContent value="advanced" className="mt-4 space-y-4">
          <SectionCard
            title="API access"
            description="Use the REST API to create projects and fetch clips from your own tools."
            icon={KeyRound}
            footer={
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-muted-foreground">Last used 2 days ago · never expires</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => toast({ title: 'API key rotation is a Phase 2 task' })}
                >
                  Rotate key
                </Button>
              </div>
            }
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Input
                  readOnly
                  value={showKey ? 'cf_live_9f2a7c41d8e34b6a' : 'cf_live_••••••••••••••••'}
                  aria-label="API key"
                  className="pr-20 font-mono text-[11px]"
                />
                <div className="absolute right-1 top-1 flex items-center">
                  <Button variant="ghost" size="icon-sm" onClick={() => setShowKey((value) => !value)} aria-label={showKey ? 'Hide API key' : 'Show API key'}>
                    {showKey ? <Shield className="h-3.5 w-3.5" /> : <KeyRound className="h-3.5 w-3.5" />}
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={copyKey} aria-label="Copy API key">
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => toast({ title: 'Docs open in Phase 2' })}>
                <ExternalLink className="h-3.5 w-3.5" /> API docs
              </Button>
            </div>
            <Field label="Webhook URL" hint="We POST job and render events to this endpoint." htmlFor="webhook-url">
              <Input id="webhook-url" placeholder="https://your-app.com/api/clipforge/webhook" className="font-mono text-[11px]" />
            </Field>
          </SectionCard>

          <SectionCard title="Data & storage" description="Where your source files and renders live." icon={Shield}>
            <div className="grid gap-2 sm:grid-cols-3">
              {[
                { label: 'Storage backend', value: 'Local /storage' },
                { label: 'Used', value: '412 MB of 2 GB' },
                { label: 'Retention', value: '30 days' },
              ].map((item) => (
                <div key={item.label} className="rounded-xl border border-border/60 bg-background/30 px-3 py-2">
                  <p className="text-[9px] uppercase tracking-wide text-muted-foreground">{item.label}</p>
                  <p className="mt-0.5 text-xs font-medium">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => toast({ title: 'Cache cleared', description: '0 temporary renders were removed.' })}>
                Clear render cache
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toast({ title: 'Export requested', description: 'You will receive a download link by email.' })}>
                Export all project data
              </Button>
            </div>
          </SectionCard>

          <section className="rounded-2xl border border-destructive/30 bg-destructive/[0.05] p-4">
            <h2 className="text-sm font-semibold text-destructive">Danger zone</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
              Deleting the workspace permanently removes projects, clips, transcripts and renders. This cannot be undone.
            </p>
            <Button variant="destructive" size="sm" className="mt-3" onClick={() => setDeleteOpen(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete workspace
            </Button>
          </section>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen} labelledBy="delete-workspace-title">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-destructive/12 text-destructive">
              <Trash2 className="h-4 w-4" />
            </span>
            <div>
              <h2 id="delete-workspace-title" className="text-sm font-semibold">
                Delete workspace?
              </h2>
              <p className="text-[11px] text-muted-foreground">This action is permanent.</p>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            All 6 projects, 48 clips and stored media for <span className="font-medium text-foreground">{workspace.name}</span> will be
            deleted. Type <span className="font-mono text-foreground">delete</span> to confirm.
          </p>
          <Input
            value={confirmText}
            onChange={(event) => setConfirmText(event.target.value)}
            placeholder="delete"
            aria-label="Type delete to confirm"
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              disabled={confirmText.trim().toLowerCase() !== 'delete'}
              onClick={() => {
                setDeleteOpen(false)
                setConfirmText('')
                toast({ title: 'Workspace deletion is disabled', description: 'Connect the backend in Phase 2 to enable it.', variant: 'error' })
              }}
            >
              Delete workspace
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
