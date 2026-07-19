/** @vitest-environment jsdom */

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../services/taskService.ts', () => ({
  createTask: vi.fn(() => Promise.resolve({ data: {} })),
  getTasks: vi.fn(() => Promise.resolve({ data: [] })),
  deleteTask: vi.fn(),
  toggleTask: vi.fn(),
}))

import TasksPage from '../pages/TasksPage.tsx'
import { createTask } from '../services/taskService.ts'

describe('Formulario de tareas', () => {
  it('no envía una tarea cuando el título está vacío o solo espacios', async () => {
    window.localStorage.setItem('user', JSON.stringify({ name: 'Test User' }))

    render(
      <MemoryRouter>
        <TasksPage />
      </MemoryRouter>
    )

    const button = await screen.findByRole('button', { name: /Agregar Tarea/i })
    const titleInput = screen.getByPlaceholderText(/Escribe el nombre de la tarea/)

    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, '   ')
    await userEvent.click(button)

    expect(createTask).not.toHaveBeenCalled()
  })
})
