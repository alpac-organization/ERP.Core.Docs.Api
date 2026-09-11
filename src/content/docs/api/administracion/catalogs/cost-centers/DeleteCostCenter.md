---
title: "Eliminar Centro de Costo"
module: "cost-centers"
---


Endpoint para eliminar (baja lógica) un centro de costo asociado a un área de trabajo dentro de una compañía/módulo.

| Campo     | Valor |
|-----------|-------|
| **Método**      | `DELETE` |
| **Endpoint**    | `/api/v1/companies/{company_id}/modules/{module_code}/areas/{area_id}/cost-centers/{cost_center_id}` |
| **Descripción** | Realiza la eliminación lógica de un centro de costo específico, identificado por su `cost_center_id`. |

---

## Parámetros de Ruta (Path Params)

| Parámetro        | Tipo     | Requerido | Descripción |
|:----------------:|:--------:|-----------|-------------|
| `company_id`     | `guid`   | Sí        | Identificador único de la compañía. |
| `module_code`    | `string` | Sí        | Código del módulo dentro de la compañía. |
| `area_id`        | `guid`   | Sí        | Identificador único del área de trabajo a la que pertenece el centro de costo. |
| `cost_center_id` | `guid`   | Sí        | Identificador único del centro de costo a eliminar. |

---

## Headers

| Header          | Valor              | Requerido |
|-----------------|--------------------|-----------|
| `Authorization` | `Bearer {token}`   | Sí        |

---

## Respuestas

### ✅ 204 No Content

No retorna cuerpo. La eliminación es **lógica**: se establece `IsActive = false` y `DeletedAt` con la fecha/hora actual.

### ❌ 400 Bad Request

Área no encontrada:

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "Esta area de trabajo no existe, porfavor seleccionar un area correcta"
  },
  "created_at": "2026-09-11 10:00:00"
}
```

Centro de costo no encontrado:

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "Este centro de costo no existe"
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
- `cost_center_id` es requerido (no vacío).

---

## Autorización

- Requiere token (`Authorization: Bearer {token}`).
- Solo usuarios con rol **`Administrator`** pueden eliminar centros de costo. En caso contrario, la API responde `400` con `"Solo administradores pueden eliminar un centro de costo"`.
- El handler `DeleteCostCenterHandler` hereda de `BaseValidatorHandler` e invoca `ValidateAccessAsync` (usuario → perfil → módulo → rol).

---

## Notas de Implementación

- Valida que el área exista, esté activa y pertenezca a la compañía, y que el centro de costo exista, esté activo y pertenezca a esa área antes de aplicar la baja lógica.

---

## Códigos de Estado

| Código | Descripción |
|---|---|
| `204` | Centro de costo eliminado exitosamente. |
| `400` | Error de validación, área no encontrada o centro de costo no encontrado (`ErrorResponse`). |
| `500` | Error interno del servidor (`ErrorResponse`). |
