---
title: "Listar Áreas de Trabajo"
module: "work-areas"
---


Endpoint para listar todas las áreas de trabajo activas registradas dentro de un módulo de una compañía.

| Campo     | Valor |
|-----------|-------|
| **Método**      | `GET` |
| **Endpoint**    | `/api/v1/companies/{company_id}/modules/{module_code}/areas` |
| **Descripción** | Retorna el listado de áreas de trabajo activas de una compañía, ordenadas por fecha de creación descendente. |

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

> Este endpoint no recibe query params ni paginación; `GetWorkAreasQuery` solo hereda `CompanyId`, `ModuleCode` y `UserId` de `BaseRequest`.

---

## Respuestas

### ✅ 200 OK

Retorna un `List<WorkAreaDto>`.

```json
[
  {
    "work_area_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "work_area_code": 1,
    "company_id": "7708d447-1b6a-4194-a877-7e6f49cd80b4",
    "work_area_name": "DEPOSITO PUBLICO",
    "description": "Área encargada del resguardo y despacho de mercancía."
  }
]
```

### Descripción de Campos

| Campo            | Tipo                     | Descripción |
|------------------|--------------------------|-------------|
| `work_area_id`   | `guid`                   | Identificador único del área de trabajo. |
| `work_area_code` | `integer`                | Código consecutivo del área dentro de la compañía. |
| `company_id`     | `guid`                   | Identificador de la compañía. |
| `work_area_name` | `string \| null`         | Nombre del área de trabajo. |
| `description`    | `string \| null`         | Descripción del área. |

> ℹ️ Para obtener los centros de costo de un área usa el endpoint [Listar Centros de Costo](../CostCenters/get-cost-centers.md); este listado de áreas no los incluye.

### ❌ 400 Bad Request

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "El id de la empresa es requerido"
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

## Notas de Implementación

- Solo se devuelven áreas con `IsActive = true` y `CompanyId` igual al de la ruta.
- El handler `GetWorkAreaHandler` **no** invoca `ValidateAccessAsync`.

---

## Códigos de Estado

| Código | Descripción |
|---|---|
| `200` | Listado de áreas de trabajo obtenido exitosamente. |
| `400` | Error de validación (`ErrorResponse`). |
| `500` | Error interno del servidor (`ErrorResponse`). |
