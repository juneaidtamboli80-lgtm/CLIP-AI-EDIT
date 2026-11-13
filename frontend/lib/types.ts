export type AspectRatio = '9:16' | '1:1' | '16:9'
export type ProjectStatus = 'ready' | 'processing' | 'draft' | 'failed'
export type ProjectSource = 'youtube' | 'upload'
export type PipelineStep = 'download' | 'transcribe' | 'highlights' | 'render'
export type ClipStatus = 'ready' | 'rendering' | 'draft'
export type CaptionPosition = 'top' | 'middle' | 'bottom'
export type CaptionAnimation = 'pop' | 'fade' | 'bounce' | 'none'
export type SubtitleMode = 'burned' | 'soft'

export interface Project {
  id: string
  title: string
  source: ProjectSource
  sourceUrl?: string
  thumbnail: string
  duration: number
  createdAt: string
  status: ProjectStatus
  clipsCount: number
  language: string
  aspectRatio: AspectRatio
  progress?: number
  step?: PipelineStep
  resolution?: string
  fileSize?: number
}

export interface Clip {
  id: string
  projectId: string
  title: string
  start: number
  end: number
  score: number
  reason: string
  thumbnail: string
  status: ClipStatus
  aspectRatio: AspectRatio
  captions: boolean
  words?: number
}

export interface TranscriptWord {
  text: string
  start: number
  end: number
}

export interface TranscriptCue {
  id: string
  start: number
  end: number
  speaker: string
  text: string
  words: TranscriptWord[]
}

export interface CaptionSettings {
  presetId: string
  font: string
  size: number
  weight: number
  color: string
  highlightColor: string
  outlineColor: string
  outlineWidth: number
  shadow: boolean
  background: boolean
  backgroundColor: string
  position: CaptionPosition
  animation: CaptionAnimation
  uppercase: boolean
  emoji: boolean
}

export interface CaptionPreset {
  id: string
  name: string
  description: string
  settings: CaptionSettings
}

export interface SubtitleLanguage {
  code: string
  label: string
  native: string
  rtl?: boolean
}

export interface BrandKit {
  name: string
  primaryColor: string
  secondaryColor: string
  font: string
  logo?: string
}

export interface EditorSnapshot {
  inPoint: number
  outPoint: number
  captionSettings: CaptionSettings
  captionText: string
  subtitleLanguage: string
  dualSubtitles: boolean
  speed: number
  removeSilences: boolean
}
