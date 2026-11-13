import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProjectDetail } from '@/components/projects/project-detail'
import { clips, projects, transcript } from '@/lib/mock-data'

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const project = projects.find((item) => item.id === params.id)
  return { title: project?.title ?? 'Project' }
}

export default function ProjectPage({ params }: { params: { id: string } }) {
  const project = projects.find((item) => item.id === params.id)
  if (!project) notFound()
  const projectClips = clips.filter((clip) => clip.projectId === project.id)
  return <ProjectDetail project={project} initialClips={projectClips} transcript={transcript} />
}
