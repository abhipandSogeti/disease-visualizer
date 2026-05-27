import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { PlainEnglishBlock } from './PlainEnglishBlock'

describe('PlainEnglishBlock', () => {
  it('renders the heading', () => {
    render(
      <PlainEnglishBlock
        drugName="Artemisinin"
        text="Artemisinin is a medicine used to treat malaria."
      />,
    )
    expect(screen.getByText(/what is artemisinin/i)).toBeInTheDocument()
  })
  it('renders the plain-english text', () => {
    render(
      <PlainEnglishBlock
        drugName="Artemisinin"
        text="Artemisinin is a medicine used to treat malaria."
      />,
    )
    expect(screen.getByText(/artemisinin is a medicine used to treat malaria/i)).toBeInTheDocument()
  })
  it('can be collapsed after reading', async () => {
    const user = userEvent.setup()
    render(
      <PlainEnglishBlock
        drugName="Artemisinin"
        text="Artemisinin is a medicine used to treat malaria."
      />,
    )
    const toggle = screen.getByRole('button', { name: /collapse/i })
    await user.click(toggle)
    expect(
      screen.queryByText(/artemisinin is a medicine used to treat malaria/i),
    ).not.toBeInTheDocument()
  })
})
