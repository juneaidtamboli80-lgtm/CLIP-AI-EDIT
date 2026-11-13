import type { AspectRatio, Clip, Project, TranscriptCue } from '@/lib/types'

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000').replace(/\/$/, '')
export const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK !== 'false'

export class ApiError extends Error {
  status: number
  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      ...(init?.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
      ...init?.headers,
    },
  })
  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = (await response.json()) as { detail?: string; error?: string }
      message = body.detail || body.error || message
    } catch {
      /* noop */
    }
    throw new ApiError(message, response.status)
  }
  return (await response.json()) as T
}

export const api = {
  health: () => apiFetch<{ status: string; version: string }>('/api/health'),

  listProjects: () => apiFetch<{ projects: Project[] }>('/api/projects'),

  getProject: (id: string) => apiFetch<{ project: Project; clips: Clip[]; transcript: TranscriptCue[] }>(`/api/projects/${id}`),

  createFromYouTube: (url: string, options?: Record<string, unknown>) =>
    apiFetch<{ project: Project }>('/api/projects/youtube', {
      method: 'POST',
      body: JSON.stringify({ url, ...options }),
    }),

  createFromUpload: (file: File, onProgress?: (percent: number) => void) =>
    uploadInChunks(file, onProgress),

  getClip: (id: string) => apiFetch<{ clip: Clip }>(`/api/clips/${id}`),

  updateClip: (id: string, patch: Record<string, unknown>) =>
    apiFetch<{ clip: Clip }>(`/api/clips/${id}/edit`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    }),

  renderClip: (id: string, settings: Record<string, unknown>) =>
    apiFetch<{ jobId: string }>(`/api/clips/${id}/render`, {
      method: 'POST',
      body: JSON.stringify(settings),
    }),

  downloadClip: (id: string, resolution: string) =>
    `${API_URL}/api/clips/${id}/download?resolution=${encodeURIComponent(resolution)}`,

  translateSubtitles: (payload: { clipId: string; target: string; source?: string }) =>
    apiFetch<{ srt: string; vtt: string }>('/api/subtitles/translate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  setAspectRatio: (id: string, aspectRatio: AspectRatio) =>
    apiFetch<{ clip: Clip }>(`/api/clips/${id}/edit`, {
      method: 'PATCH',
      body: JSON.stringify({ aspectRatio }),
    }),
}

/**
 * Chunked upload (5 MB chunks). The FastAPI upload endpoint is added in Phase 2;
 * this client already speaks the intended protocol so the UI can be wired without rework.
 */
async function uploadInChunks(file: File, onProgress?: (percent: number) => void) {
  const CHUNK_SIZE = 5 * 1024 * 1024
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
  const uploadId = crypto.randomUUID()

  for (let index = 0; index < totalChunks; index += 1) {
    const chunk = file.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE)
    const form = new FormData()
    form.append('uploadId', uploadId)
    form.append('chunkIndex', String(index))
    form.append('totalChunks', String(totalChunks))
    form.append('filename', file.name)
    form.append('chunk', chunk)

    const response = await fetch(`${API_URL}/api/projects/upload`, {
      method: 'POST',
      body: form,
    })
    if (!response.ok) throw new ApiError('Chunk upload failed', response.status)
    onProgress?.(Math.round(((index + 1) / totalChunks) * 100))
  }

  const finalize = new FormData()
  finalize.append('uploadId', uploadId)
  finalize.append('filename', file.name)
  finalize.append('totalChunks', String(totalChunks))
  finalize.append('complete', 'true')
  const response = await fetch(`${API_URL}/api/projects/upload`, { method: 'POST', body: finalize })
  if (!response.ok) throw new ApiError('Could not finalize upload', response.status)
  return (await response.json()) as { project: Project }
}
