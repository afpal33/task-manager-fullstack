// e2e/flujo-tareas.spec.js
import { test, expect } from '@playwright/test'

test('un usuario puede registrarse, loguarse y crear una tarea', async ({ page }) => {
  const tasks = []
  const testUser = {
    name: 'Test User',
    email: 'test@example.com',
    password: 'password123',
  }

  // Mockear APIs de autenticación y tareas
  await page.route('**/api/v1/auth/register', async route => {
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    })
  })

  await page.route('**/api/v1/auth/login', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'fake-jwt-token',
        user: { name: testUser.name, email: testUser.email },
      }),
    })
  })

  await page.route('**/api/v1/tasks*', async route => {
    const request = route.request()

    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(tasks),
      })
      return
    }

    if (request.method() === 'POST') {
      const body = request.postDataJSON()
      const newTask = {
        id: Date.now(),
        title: body.title,
        description: body.description ?? '',
        tags: (body.tags ?? []).map((name) => ({ name })),
        completed: false,
      }

      tasks.push(newTask)
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify(newTask),
      })
      return
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({}),
    })
  })

 // 1. Ir a registro (esperar a que la ruta y el DOM estén listos)
await page.goto('/register', { waitUntil: 'networkidle' }) // helps with SPAs
await expect(page).toHaveURL(/\/register/) // confirm navigation

// match multiple possible headings and allow more time for render
await expect(
  page.getByRole('heading', { name: /(Reg[ií]strate|Registrarse|Crear cuenta)/i })
).toBeVisible({ timeout: 10000 })

// as a fallback, ensure the name input exists before interacting
await page.waitForSelector('input[placeholder="Nombre"]', { timeout: 10000 })

  // 2. Llenar formulario de registro
  await page.getByPlaceholder('Nombre').fill(testUser.name)
  await page.getByPlaceholder('Email').fill(testUser.email)
  await page.getByPlaceholder('Contraseña').fill(testUser.password)
  await page.getByRole('button', { name: /Crear cuenta/i }).click()

  // 3. Esperar a que navegue a login
  await expect(page).toHaveURL('/login')
  await expect(page.getByRole('heading', { name: /Login/i })).toBeVisible()

  // 4. Llenar formulario de login
  await page.getByPlaceholder('Email').fill(testUser.email)
  await page.getByPlaceholder('Contraseña').fill(testUser.password)
  await page.getByRole('button', { name: /Iniciar Sesión/i }).click()

  // 5. Esperar a que navegue a tareas
  await expect(page).toHaveURL('/tasks')
  await expect(page.getByRole('heading', { name: /Hola, Test User/i })).toBeVisible()

  // 6. Crear una tarea
  await page.getByLabel('Nueva tarea').fill('Comprar pan')
  await page.getByRole('button', { name: /Agregar Tarea/i }).click()

  // 7. Verificar que la tarea se creó y aparece en la lista
  await expect(page.getByText('Comprar pan')).toBeVisible()
})