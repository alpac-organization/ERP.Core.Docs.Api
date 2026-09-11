---
title: "Listar Centros de Costo por Área"
module: "cost-centers"
---


Endpoint para listar los centros de costo activos asociados a un área de trabajo específica dentro de una compañía/módulo.

| Campo     | Valor |
|-----------|-------|
| **Método**      | `GET` |
| **Endpoint**    | `/api/v1/companies/{company_id}/modules/{module_code}/areas/{area_id}/cost-centers` |
| **Descripción** | Retorna el listado de centros de costo activos que pertenecen al área indicada. |

---

## Parámetros de Ruta (Path Params)

| Parámetro     | Tipo     | Requerido | Descripción |
|:-------------:|:--------:|-----------|-------------|
| `company_id`  | `guid`   | Sí        | Identificador único de la compañía. |
| `module_code` | `string` | Sí        | Código del módulo dentro de la compañía. |
| `area_id`     | `guid`   | Sí        | Identificador único del área de trabajo. |

---

## Headers

| Header          | Valor              | Requerido |
|-----------------|--------------------|-----------|
| `Authorization` | `Bearer {token}`   | Sí        |

---

## Query Params

> Este endpoint no recibe query params ni paginación; `GetCostCentersByAreaQuery` solo hereda `CompanyId`, `ModuleCode` y `UserId` de `BaseRequest`, más `AreaId`.

---

## Respuestas

### ✅ 200 OK

Retorna un `List<CostCenterDto>` (`CostCenterDto` hereda de `CostCenterInformation`).

```json
[
  {
    "cost_center_id": "3fa85f64-5717-4562-b3fc-2c963f66afa8",
    "description": "Centro de costos para operaciones logísticas y almacenamiento.",
    "cost_center_name": "Centro de Costo - Almacén Central",
    "coil_code": 101,
    "cost_center_code": 1
  }
]
```

### Descripción de Campos

| Campo              | Tipo             | Descripción |
|--------------------|------------------|-------------|
| `cost_center_id`   | `guid`           | Identificador único del centro de costo. |
| `description`      | `string \| null` | Descripción del centro de costo. |
| `cost_center_name` | `string \| null` | Nombre del centro de costo. |
| `coil_code`        | `integer`        | Código numérico (`CoilCode`) del centro de costo. |
| `cost_center_code` | `integer`        | Código consecutivo del centro de costo. |

> ℹ️ La respuesta **no** incluye `company_id` ni `work_area_id`, ya que `CostCenterDto` solo hereda las propiedades de `CostCenterInformation`.

### ❌ 400 Bad Request

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "El area seleccionada no existe"
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

## Reglas de Validación

- `company_id` es requerido (no vacío).
- `area_id` es requerido (no vacío).

---

## Notas de Implementación

- El handler `GetCostCenterByAreaHandler` invoca `ValidateAccessAsync`, por lo que valida usuario, perfil, acceso al módulo y rol.
- Primero verifica que el área exista, esté activa y pertenezca a la compañía; luego retorna los centros de costo con `IsActive = true` asociados a esa área.

---

## Códigos de Estado

| Código | Descripción |
|---|---|
| `200` | Listado de centros de costo obtenido exitosamente. |
| `400` | Error de validación, acceso denegado o área no encontrada (`ErrorResponse`). |
| `500` | Error interno del servidor (`ErrorResponse`). |
