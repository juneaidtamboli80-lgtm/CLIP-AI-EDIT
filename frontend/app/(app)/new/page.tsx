import type { Metadata } from 'next'
import { NewProjectFlow } from '@/components/new/new-project-flow'

export const metadata: Metadata = { title: 'New project' }

export default function NewProjectPage({
  searchParams,
}: {
  searchParams: { tab?: string; url?: string; name?: string; size?: string }
}) {
  return (
    <NewProjectFlow
      initialTab={searchParams.tab}
      initialUrl={searchParams.url ?? ''}
      initialName={searchParams.name ?? ''}
      initialSize={searchParams.size ?? ''}
    />
  )
}
