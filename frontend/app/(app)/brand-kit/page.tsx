import type { Metadata } from 'next'
import { BrandKitEditor } from '@/components/brand-kit/brand-kit-editor'

export const metadata: Metadata = { title: 'Brand kit' }

export default function BrandKitPage() {
  return <BrandKitEditor />
}
