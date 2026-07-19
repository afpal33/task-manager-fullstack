import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import TaskCard from './TaskCard'

describe('TaskCard', () => {
  const task = {
    id: 1,
    title: 'Comprar pan',
    description: 'Leche y huevos',
    completed: false,
    tags: [{ id: 1, name: 'urgente' }],
  }

  it('renders task details and triggers actions', async () => {
    const deleteTask = vi.fn()
    const toggleTask = vi.fn()
    const user = userEvent.setup()

    render(<TaskCard task={task} deleteTask={deleteTask} toggleTask={toggleTask} />)

    expect(screen.getByRole('heading', { name: /Comprar pan/i })).toBeVisible()
    expect(screen.getByText('Leche y huevos')).toBeVisible()
    expect(screen.getByText('#urgente')).toBeVisible()

    await user.click(screen.getByRole('button', { name: /Completa/i }))
    expect(toggleTask).toHaveBeenCalledWith(task)

    await user.click(screen.getByRole('button', { name: /Eliminar/i }))
    expect(deleteTask).toHaveBeenCalledWith(task)
  })

  it('renders the completed action label when the task is done', () => {
    const completedTask = { ...task, completed: true }
    render(<TaskCard task={completedTask} deleteTask={vi.fn()} toggleTask={vi.fn()} />)

    expect(screen.getByRole('button', { name: /Deshacer/i })).toBeVisible()
  })
})
