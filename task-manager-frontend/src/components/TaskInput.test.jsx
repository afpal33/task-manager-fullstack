import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { TaskInput } from './TaskInput'

describe('TaskInput', () => {
  it('calls the provided setters when the user types', async () => {
    const setText = vi.fn()
    const setDescription = vi.fn()
    const setTags = vi.fn()
    const user = userEvent.setup()

    render(
      <TaskInput
        text=""
        setText={setText}
        description=""
        setDescription={setDescription}
        tags=""
        setTags={setTags}
      />
    )

    await user.type(screen.getByLabelText('Nueva tarea'), 'Comprar pan')
    await user.type(screen.getByPlaceholderText('Una breve descripción... (opcional)'), 'Leche')
    await user.type(screen.getByPlaceholderText('Etiquetas (separadas por comas)...'), 'urgente')

    expect(setText).toHaveBeenCalled()
    expect(setDescription).toHaveBeenCalled()
    expect(setTags).toHaveBeenCalled()
  })
})
