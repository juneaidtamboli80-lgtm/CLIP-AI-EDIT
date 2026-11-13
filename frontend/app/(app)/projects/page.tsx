import type { Metadata } from 'next'
import { ProjectsGrid } from '@/components/projects/projects-grid'

export const metadata: Metadata = { title: 'My projects' }

export default function ProjectsPage() {
  return <ProjectsGrid />
}
