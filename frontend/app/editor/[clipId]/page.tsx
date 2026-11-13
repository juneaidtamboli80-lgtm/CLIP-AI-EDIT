import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { EditorShell } from '@/components/editor/editor-shell'
import { clips, projects } from '@/lib/mock-data'

export function generateMetadata({ params }: { params: { clipId: string } }): Metadata {
  const clip = clips.find((item) => item.id === params.clipId)
  return { title: clip ? `Edit · ${clip.title}` : 'Clip editor' }
}

export default function EditorPage({ params }: { params: { clipId: string } }) {
  const clip = clips.find((item) => item.id === params.clipId)
  if (!clip) notFound()
  const project = projects.find((item) => item.id === clip.projectId) ?? projects[0]
  return <EditorShell clip={clip} project={project} />
}
