// src/components/FormularioTarea.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import FormularioTarea from './FormularioTarea'
 
describe('FormularioTarea', () => {
  it('llama a onAgregar con el texto escrito por el usuario', async () => {
    // Arrange
    const onAgregar = vi.fn()
    render(<FormularioTarea onAgregar={onAgregar} />)
    const usuario = userEvent.setup()
 
    // Act
    const input = screen.getByLabelText('Nueva tarea')
    await usuario.type(input, 'Comprar pan')
    await usuario.click(screen.getByText('Agregar'))
 
    // Assert
    expect(onAgregar).toHaveBeenCalledWith('Comprar pan')
  })
 
  it('no llama a onAgregar si el campo está vacío', async () => {
    const onAgregar = vi.fn()
    render(<FormularioTarea onAgregar={onAgregar} />)
    const usuario = userEvent.setup()
 
    await usuario.click(screen.getByText('Agregar'))
 
    expect(onAgregar).not.toHaveBeenCalled()
  })
})