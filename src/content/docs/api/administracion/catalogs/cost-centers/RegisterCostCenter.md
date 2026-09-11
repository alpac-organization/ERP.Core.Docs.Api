---
title: "Registrar Centro de Costos"
module: "cost-centers"
---


Endpoint para registrar un nuevo centro de costos dentro del área de un módulo y compañía especificados.

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **Endpoint** | `/api/v1/companies/{company_id}/modules/{module_code}/areas/{area_id}/cost-centers` |
| **Descripción** | Permite registrar un nuevo centro de costos asociado a un área específica. |

---

## Parámetros de Ruta (Path Params)

| Parámetro | Tipo | Requerido | Descripción |
|:---:|:---:|-----------|-------------|
| `company_id` | `guid` | Sí | Identificador único de la compañía. |
| `module_code` | `string` | Sí | Código del módulo dentro de la compañía. |
| `area_id` | `guid` | Sí | Identificador único del área a la que pertenecerá el centro de costos. |

---

## Headers

| Header | Valor | Requerido |
|---|---|---|
| `Authorization` | `Bearer {token}` | Sí |

---

## Body (Request Body)

```json
{
  "coil_code": 101,
  "cost_center_name": "Centro de Costo - Almacén Central",
  "description": "Centro de costos para operaciones logísticas y almacenamiento."
}
```

---

| Campo | Tipo | Requerido | Descripción |
|---|:---:|:---:|---|
| `coil_code` | `integer` | **No** | Código numérico del centro de costo (`CoilCode`). |
| `cost_center_name` | `string` | **Si** | Nombre opcional del centro de costo (`CostCenterName`). |
| `description` | `string` | **No** | Descripción general opcional del centro de costo. |

---

## Autorización

- Requiere token (`Authorization: Bearer {token}`).
- Solo usuarios con rol **`Administrator`** pueden registrar centros de costo. En caso contrario, la API responde `400` con `"Solo administradores pueden registrar centros de costo"`.
- El handler `RegisterCostCenterHandler` invoca `ValidateAccessAsync` (usuario → perfil → módulo → rol) usando `company_id`, `module_code` y el `UserId` del token.

---

## Respuestas

### ✅ 201 Created

No retorna cuerpo (`CreatedResult`).

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
| `201` | Centro de costo registrado exitosamente. |
| `400` | Error de validación, de acceso o rol no autorizado (`ErrorResponse`). |
| `500` | Error interno del servidor (`ErrorResponse`). |