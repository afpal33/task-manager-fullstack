// src/utils/validations.ts

export function esCorreoValido(correo: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(correo);
}

export function contarTareasPendientes(tareas: { completada: boolean }[]): number {
  return tareas.filter((t) => !t.completada).length
}
