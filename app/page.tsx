'use client'

import { ScreenRouter } from '@/components/ScreenRouter'
import { ContextAskWrapper } from '@/components/ContextAskWrapper'

export default function Home() {
  return (
    <ContextAskWrapper>
      <ScreenRouter />
    </ContextAskWrapper>
  )
}
