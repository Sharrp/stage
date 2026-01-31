import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home Page', () => {
  it('renders the page without crashing', () => {
    render(<Home />)
    expect(screen.getByRole('heading')).toBeInTheDocument()
  })

  it('displays "Under construction" heading', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', { name: /under construction/i })
    expect(heading).toBeInTheDocument()
  })

  it('displays exact text "Under construction"', () => {
    render(<Home />)
    const heading = screen.getByRole('heading')
    expect(heading.textContent?.toLowerCase()).toBe('under construction')
  })

  it('applies correct styling classes', () => {
    render(<Home />)
    const heading = screen.getByRole('heading', { name: /under construction/i })
    expect(heading).toHaveClass('text-white')
    expect(heading).toHaveClass('uppercase')
  })

  it('has accessible heading structure', () => {
    render(<Home />)
    const headings = screen.getAllByRole('heading')
    expect(headings).toHaveLength(1)
  })
})
