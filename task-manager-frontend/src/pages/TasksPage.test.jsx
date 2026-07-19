import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { MemoryRouter, Routes, Route } from 'react-router-dom'

vi.mock('../services/taskService.ts', () => ({
  createTask: vi.fn(),
  getTasks: vi.fn(),
  deleteTask: vi.fn(),
  toggleTask: vi.fn(),
}))

import TasksPage from './TasksPage.tsx'
import { createTask, deleteTask, getTasks, toggleTask } from '../services/taskService.ts'

describe('TasksPage', () => {
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

  beforeEach(() => {
    localStorage.setItem('token', 'fake-token')
    localStorage.setItem('user', JSON.stringify({ name: 'Test User' }))
    vi.mocked(getTasks).mockResolvedValue({ data: tasks })
    vi.mocked(createTask).mockResolvedValue({ data: tasks[0] })
    vi.mocked(deleteTask).mockResolvedValue({})
    vi.mocked(toggleTask).mockResolvedValue({})
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    vi.resetAllMocks()
  })

  it('renders the user name and task list after fetching tasks', async () => {
    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <Routes>
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText(/Hola, Test User/i)).toBeVisible())
    expect(screen.getByText('Comprar pan')).toBeVisible()
    expect(screen.getByText('Llamar al banco')).toBeVisible()

    const pendingCard = screen.getByText('Tareas Pendientes').closest('div')
    expect(pendingCard).toBeTruthy()
    if (pendingCard) {
      expect(within(pendingCard).getByText('1')).toBeVisible()
    }
  })

  it('does not call createTask when the title is empty', async () => {
    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <Routes>
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </MemoryRouter>
    )

    const button = await screen.findByRole('button', { name: /Agregar Tarea/i })
    await userEvent.click(button)

    expect(createTask).not.toHaveBeenCalled()
  })

  it('adds a task when the form is submitted', async () => {
    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <Routes>
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText(/Hola, Test User/i)).toBeVisible())

    await userEvent.type(screen.getByLabelText('Nueva tarea'), '  Comprar pan  ')
    await userEvent.type(screen.getByPlaceholderText('Una breve descripción... (opcional)'), 'Leche y huevos')
    await userEvent.type(screen.getByPlaceholderText('Etiquetas (separadas por comas)...'), ' urgente , ')
    await userEvent.click(screen.getByRole('button', { name: /Agregar Tarea/i }))

    await waitFor(() => expect(createTask).toHaveBeenCalledWith('Comprar pan', 'Leche y huevos', ['urgente']))
  })

  it('filters tasks by tag and shows the clear filter button', async () => {
    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <Routes>
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Comprar pan')).toBeVisible())

    await userEvent.type(screen.getByPlaceholderText('ej. urgente, trabajo...'), 'banco')
    await waitFor(() => expect(screen.getByRole('button', { name: /Limpiar Filtro/i })).toBeVisible())
    expect(screen.getByText('Llamar al banco')).toBeVisible()
    expect(screen.queryByText('Comprar pan')).toBeNull()
  })

  it('toggles task completion when the complete button is clicked', async () => {
    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <Routes>
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Comprar pan')).toBeVisible())
    await userEvent.click(screen.getByRole('button', { name: /Completa/i }))

    expect(toggleTask).toHaveBeenCalledWith(1)
  })

  it('signs out and navigates to login', async () => {
    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <Routes>
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    )

    const signOutButton = await screen.findByRole('button', { name: /Cerrar Sesión/i })
    await userEvent.click(signOutButton)

    await waitFor(() => expect(screen.getByText('Login Page')).toBeVisible())
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('deletes a task when the user confirms deletion', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(
      <MemoryRouter initialEntries={['/tasks']}>
        <Routes>
          <Route path="/tasks" element={<TasksPage />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => expect(screen.getByText('Comprar pan')).toBeVisible())
    const deleteButtons = screen.getAllByRole('button', { name: /Eliminar/i })
    await userEvent.click(deleteButtons[0])

    await waitFor(() => expect(deleteTask).toHaveBeenCalledWith(1))
  })
})
