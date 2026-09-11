---
title: "Listar Colaboradores Disponibles"
module: "Collaborators"
---

## Listar Colaboradores Disponibles

Endpoint para listar (con paginación y filtros) los colaboradores registrados dentro de un módulo de una compañía.

| Campo     | Valor |
|-----------|-------|
| **Método**      | `GET` |
| **Endpoint**    | `/api/v1/companies/{companie_id}/modules/{module_code}/collaborators` |
| **Descripción** | Retorna un listado paginado de colaboradores de una compañía/módulo, con contadores por estado y filtros opcionales. |

---

## Parámetros de Ruta (Path Params)

| Parámetro     | Tipo     | Requerido | Descripción |
|:-------------:|:--------:|-----------|-------------|
| `companie_id` | `guid`   | Sí        | Identificador único de la compañía. |
| `module_code` | `string` | Sí        | Código del módulo dentro de la compañía. |

---

## Headers

| Header          | Valor              | Requerido |
|-----------------|--------------------|-----------|
| `Authorization` | `Bearer {token}`   | Sí        |

---

## Query Params

| Parámetro                | Tipo                        | Requerido | Default | Descripción |
|---------------------------|-----------------------------|-----------|---------|-------------|
| `area_id`                 | `guid`                      | No        | `null`  | Filtra colaboradores por área de trabajo. |
| `branch_id`                | `guid`                      | No        | `null`  | Filtra colaboradores por sucursal. |
| `status`                   | `enum (CollaboratorStatus)` | No        | `null`  | Filtra colaboradores por estado. |
| `identification_number`    | `string`                    | No        | `null`  | Filtra por número de identificación exacto. |
| `page_size`                | `integer`                   | No        | `10`    | Cantidad de registros por página. |
| `page_number`              | `integer`                   | No        | `1`     | Número de página a consultar. |

---


## Respuestas

### ✅ 200 OK

Retorna un `PagedResponse<CollaboratorDto>`.

```json
{
  "data": [
    {
      "collaborator_id": "ee702059-9d26-4464-9900-c95b616d55c9",
      "full_name": "Juan Ramon Calero Velazquez",
      "first_name": "Juan",
      "first_lastname": "Calero",
      "branch_name": "Almacenadora del Pacífico S.A.",
      "work_area": "DEPOSITO PUBLICO",
      "vacations": 14.64,
      "work_position": "Jefe de almacen",
      "collaborator_code": "TXX-SFWD",
      "identification_number": "0012708810028T",
      "status": "Active"
    }
  ],
  "page_size": 116,
  "page_number": 1,
  "total_records": 1,
  "total_active": 113,
  "total_on_vacation": 0,
  "total_on_subsidy": 0,
  "total_collaborators": 116
}
```

### Notas sobre los contadores

| Campo (inferido) | Descripción |
|---|---|
| `total_collaborators` | Total de colaboradores de la compañía, sin aplicar filtros de query. |
| `total_active` | Total de colaboradores con `status = Active`, sin aplicar filtros de query. |
| `total_on_vacation` | Total de colaboradores con `status = Vacation`, sin aplicar filtros de query. |
| `total_on_subsidy` | Total de colaboradores con `status = Subsidy`, sin aplicar filtros de query. |
| `total_records` | Total de registros que cumplen los filtros de query (`area_id`, `branch_id`, `status`, `identification_number`), antes de paginar. |

> Estos contadores confirman 3 de los valores conocidos de `CollaboratorStatus`: `Active`, `Vacation` y `Subsidy`. Aún falta el catálogo completo del enum.

### ❌ 400 Bad Request

Usa la entidad `ErrorResponse` (`ERP.Core.Domain.Entities.Errors`):

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "El usuario no tiene acceso a esta compañía o módulo"
  },
  "created_at": "2026-09-09 10:00:00"
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
  "created_at": "2026-09-09 10:00:00"
}
```

---

## Códigos de Estado

| Código | Descripción |
|---|---|
| `200` | Listado paginado de colaboradores obtenido exitosamente. |
| `400` | Error de validación o de acceso del usuario a la compañía/módulo (`ErrorResponse`). |
| `500` | Error interno del servidor (`ErrorResponse`). |