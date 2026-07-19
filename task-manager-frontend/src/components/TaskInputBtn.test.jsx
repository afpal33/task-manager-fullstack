import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import TaskInputBtn from './TaskInputBtn'

describe('TaskInputBtn', () => {
  it('calls addTask when the button is clicked', async () => {
    const addTask = vi.fn()
    const user = userEvent.setup()

    render(<TaskInputBtn addTask={addTask} />)

    await user.click(screen.getByRole('button', { name: /Agregar Tarea/i }))

    expect(addTask).toHaveBeenCalledTimes(1)
  })
})
