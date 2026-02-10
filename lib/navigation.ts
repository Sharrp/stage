import { ScreenType } from './types'

const stepSequence: ScreenType[] = [
  'intake',
  'checklist',
  'plan',
  'workspace',
  'checkpoint',
  'escalation',
  'final',
]

export function getPreviousScreen(currentScreen: ScreenType): ScreenType | null {
  const currentIndex = stepSequence.indexOf(currentScreen)
  if (currentIndex <= 0) return null
  return stepSequence[currentIndex - 1]
}

export function getNextScreen(currentScreen: ScreenType): ScreenType | null {
  const currentIndex = stepSequence.indexOf(currentScreen)
  if (currentIndex >= stepSequence.length - 1) return null
  return stepSequence[currentIndex + 1]
}

export function isFirstScreen(currentScreen: ScreenType): boolean {
  return currentScreen === stepSequence[0]
}

export function isLastScreen(currentScreen: ScreenType): boolean {
  return currentScreen === stepSequence[stepSequence.length - 1]
}
