import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import TaskList from './TaskList'

describe('TaskList', () => {
  it('shows the empty state when there are no tasks', () => {
    render(
      <TaskList
        title="To Do"
        tasks={[]}
        deleteTask={vi.fn()}
        toggleTask={vi.fn()}
        emptyMessage="No hay tareas pendientes."
      />
    )

    expect(screen.getByText('To Do')).toBeVisible()
    expect(screen.getByText('No hay tareas pendientes.')).toBeVisible()
  })

  it('renders task cards and displays the total count', async () => {
    const user = userEvent.setup()
    const deleteTask = vi.fn()
    const toggleTask = vi.fn()

    const tasks = [
      {
        id: 1,
        title: 'Comprar pan',
        description: 'Leche y huevos',
        completed: false,
        tags: [{ id: 1, name: 'urgente' }],
      },
      {
        id: 2,
        title: 'Llamar al banco',
        description: 'Confirmar cita',
        completed: true,
        tags: [{ id: 2, name: 'banco' }],
      },
    ]

    render(
      <TaskList
        title="To Do"
        tasks={tasks}
        deleteTask={deleteTask}
        toggleTask={toggleTask}
        emptyMessage="No hay tareas pendientes."
      />
    )

    expect(screen.getByText('To Do')).toBeVisible()
    expect(screen.getByText('2')).toBeVisible()
    expect(screen.getByText('Comprar pan')).toBeVisible()
    expect(screen.getByText('Llamar al banco')).toBeVisible()

    await user.click(screen.getAllByRole('button', { name: /Completa|Deshacer/i })[0])
    expect(toggleTask).toHaveBeenCalledTimes(1)
  })
})
