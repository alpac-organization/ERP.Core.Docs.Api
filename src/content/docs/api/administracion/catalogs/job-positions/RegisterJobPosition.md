---
title: "Registrar Puesto de Trabajo"
module: "job-positions"
---


Endpoint para registrar un nuevo puesto de trabajo (cargo) dentro de un módulo de una compañía.

| Campo     | Valor |
|-----------|-------|
| **Método**      | `POST` |
| **Endpoint**    | `/api/v1/companies/{company_id}/modules/{module_code}/job-positions` |
| **Descripción** | Registra un nuevo puesto de trabajo en el catálogo de la compañía/módulo. |

---

## Parámetros de Ruta (Path Params)

| Parámetro     | Tipo     | Requerido | Descripción |
|:-------------:|:--------:|-----------|-------------|
| `company_id`  | `guid`   | Sí        | Identificador único de la compañía. |
| `module_code` | `string` | Sí        | Código del módulo dentro de la compañía. |

---

## Headers

| Header          | Valor              | Requerido |
|-----------------|--------------------|-----------|
| `Authorization` | `Bearer {token}`   | Sí        |

---

## Body (Request)

```json
{
  "job_position_name": "Jefe de Almacén",
  "description": "Responsable de la gestión operativa y supervisión del almacén."
}
```

| Campo                | Tipo     | Requerido | Descripción |
|-----------------------|----------|:---------:|-------------|
| `job_position_name`   | `string` | **Si**       | Nombre del puesto de trabajo. |
| `description`         | `string` | **No**      | Descripción del puesto de trabajo. |

---

## Autorización

- Requiere token (`Authorization: Bearer {token}`).
- Solo usuarios con rol **`Administrator`** pueden registrar puestos de trabajo. En caso contrario, la API responde `400` con `"No tienes permiso para registrar un cargo de trabajo"`.
- El handler invoca `ValidateAccessAsync` (usuario → perfil → módulo → rol).

---

## Respuestas

### ✅ 201 Created

No retorna cuerpo (`CreatedResult`).

### ❌ 400 Bad Request

Usa la entidad `ErrorResponse` (`ERP.Core.Domain.Entities.Errors`):

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "El usuario no tiene acceso a esta compañía o módulo"
  },
  "created_at": "2026-09-11 10:00:00"
}
```

### ❌ 500 Internal Server Error

```json
{
  "status": 500,
  "error": {
    "type_error": "InternalServerError",
    "description": "Ocurrió un error inesperado al procesar la solicitud"
  },
  "created_at": "2026-09-11 10:00:00"
}
```

---

## Códigos de Estado

| Código | Descripción |
|---|---|
| `201` | Puesto de trabajo registrado exitosamente. |
| `400` | Error de validación o de acceso del usuario a la compañía/módulo (`ErrorResponse`). |
| `500` | Error interno del servidor (`ErrorResponse`). |