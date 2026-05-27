import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TimeScrubber } from './TimeScrubber'

describe('TimeScrubber', () => {
  it('renders the current year label', () => {
    render(<TimeScrubber value={2020} min={1900} max={2024} onChange={() => undefined} />)
    expect(screen.getByText('2020')).toBeInTheDocument()
  })
  it('renders min and max year labels', () => {
    render(<TimeScrubber value={2020} min={1900} max={2024} onChange={() => undefined} />)
    expect(screen.getByText('1900')).toBeInTheDocument()
    expect(screen.getByText('2024')).toBeInTheDocument()
  })
  it('calls onChange when slider moves', async () => {
    const onChange = vi.fn()
    render(<TimeScrubber value={2020} min={1900} max={2024} onChange={onChange} />)
    const slider = screen.getByRole('slider')
    await userEvent.type(slider, '{arrowright}')
    expect(onChange).toHaveBeenCalled()
  })
})
