---
title: "Listar Puestos de Trabajo"
module: "job-positions"
---


Endpoint para listar todos los puestos de trabajo registrados dentro de un módulo de una compañía.

| Campo     | Valor |
|-----------|-------|
| **Método**      | `GET` |
| **Endpoint**    | `/api/v1/companies/{company_id}/modules/{module_code}/job-positions` |
| **Descripción** | Retorna el listado completo de puestos de trabajo de una compañía/módulo. |

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

## Query Params

> Este endpoint no recibe query params ni paginación; `GetJobPositionsQuery` solo hereda `CompanyId`, `ModuleCode` y `UserId` de `BaseRequest`.

---

## Respuestas

### ✅ 200 OK

Retorna un `List<JobPositionDto>`.

```json
[
  {
    "company_id": "7708d447-1b6a-4194-a877-7e6f49cd80b4",
    "job_position_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "job_position_name": "Jefe de Almacén",
    "description": "Responsable de la gestión operativa y supervisión del almacén."
  },
  {
    "company_id": "7708d447-1b6a-4194-a877-7e6f49cd80b4",
    "job_position_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "job_position_name": "Conductor - Motorizado",
    "description": "Encargado del transporte y entrega de mercancía."
  }
]
```

### ❌ 400 Bad Request

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
| `200` | Listado de puestos de trabajo obtenido exitosamente. |
| `400` | Error de validación o de acceso del usuario a la compañía/módulo (`ErrorResponse`). |
| `500` | Error interno del servidor (`ErrorResponse`). |