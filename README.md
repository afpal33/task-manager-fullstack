# Task Manager Fullstack

Aplicación fullstack de gestión de tareas con:
- Frontend en React + Vite + TypeScript
- Backend en Express + TypeScript + Prisma + PostgreSQL
- CI/CD con GitHub Actions
- Despliegue orientado a contenedores y Docker

## Estructura del proyecto

- [task-manager-frontend](task-manager-frontend): interfaz web
- [task-manager-backend](task-manager-backend): API y lógica de negocio
- [docker-compose.yml](docker-compose.yml): entorno local con PostgreSQL, backend y frontend
- [.github/workflows/ci.yml](.github/workflows/ci.yml): pipeline de CI/CD

## Requisitos

- Docker
- Docker Compose

## Ejecutar localmente

```bash
docker compose up --build
```

Esto levanta:
- PostgreSQL
- backend en http://localhost:4000
- frontend en http://localhost:5173

## Ejecutar pruebas con Docker

```bash
docker compose run --rm --no-deps backend-tests
docker compose run --rm --no-deps frontend-tests
```

## Pipeline

El workflow ejecuta en cada push/PR:
- lint y build del frontend
- pruebas del frontend
- migraciones y seed del backend
- lint y typecheck del backend
- pruebas del backend

## Variables de entorno

El backend espera variables como:
- `DATABASE_URL`
- `JWT_SECRET`
- `PORT`

El frontend espera:
- `VITE_API_URL`
