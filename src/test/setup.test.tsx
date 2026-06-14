import { describe, it, expect } from 'vitest'
import { render, screen } from '@/test/utils'

// Simple component for testing setup
const TestComponent = () => {
  return <div>Test Setup Working</div>
}

describe('Vitest Setup', () => {
  it('should render test component', () => {
    render(<TestComponent />)
    expect(screen.getByText('Test Setup Working')).toBeInTheDocument()
  })

  it('should perform basic assertions', () => {
    expect(true).toBe(true)
    expect(1 + 1).toBe(2)
  })
})
