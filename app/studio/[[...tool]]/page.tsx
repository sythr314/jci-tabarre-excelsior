'use client'

import { Studio } from 'sanity'
import config from '@/sanity.config'

export default function StudioPage() {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 50 }}>
      <Studio config={config} />
    </div>
  )
}
