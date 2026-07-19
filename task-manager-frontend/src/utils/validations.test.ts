// src/utils/validations.test.ts
 
import { describe, it, expect } from 'vitest'
import { esCorreoValido, contarTareasPendientes } from './validations'
 
describe('esCorreoValido', () => {
  it('acepta un correo con formato válido', () => {
    // Arrange
    const correo = 'ana@ejemplo.com'
    // Act
    const resultado = esCorreoValido(correo)
    // Assert
    expect(resultado).toBe(true)
  })
 
  it('rechaza un correo sin arroba', () => {
    const correo = 'ana-ejemplo.com'
    const resultado = esCorreoValido(correo)
    expect(resultado).toBe(false)
  })
})
 
describe('contarTareasPendientes', () => {
  it('cuenta solo las tareas no completadas', () => {
    const tareas = [
      { completada: true },
      { completada: false },
      { completada: false },
    ]
    expect(contarTareasPendientes(tareas)).toBe(2)
  })
 
  it('devuelve 0 cuando la lista está vacía', () => {
    expect(contarTareasPendientes([])).toBe(0)
  })
})