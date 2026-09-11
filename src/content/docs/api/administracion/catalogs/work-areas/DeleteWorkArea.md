---
title: "Eliminar Área de Trabajo"
module: "work-areas"
---


Endpoint para eliminar (baja lógica) un área de trabajo del catálogo de una compañía/módulo.

| Campo     | Valor |
|-----------|-------|
| **Método**      | `DELETE` |
| **Endpoint**    | `/api/v1/companies/{company_id}/modules/{module_code}/areas/{area_id}` |
| **Descripción** | Realiza la eliminación lógica de un área de trabajo específica, identificada por su `area_id`. |

---

## Parámetros de Ruta (Path Params)

| Parámetro     | Tipo     | Requerido | Descripción |
|:-------------:|:--------:|-----------|-------------|
| `company_id`  | `guid`   | Sí        | Identificador único de la compañía. |
| `module_code` | `string` | Sí        | Código del módulo dentro de la compañía. |
| `area_id`     | `guid`   | Sí        | Identificador único del área de trabajo a eliminar. |

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

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "Esta area no existe"
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

## Autorización

- Requiere token (`Authorization: Bearer {token}`).
- Solo usuarios con rol **`Administrator`** pueden eliminar áreas de trabajo. En caso contrario, la API responde `400` con `"Solo administradores pueden eliminar áreas de trabajo"`.
- El handler `DeleteWorkAreaHandler` invoca `ValidateAccessAsync` (usuario → perfil → módulo → rol).

---

## Notas de Implementación

- La búsqueda se hace por `Id` y `CompanyId`. A diferencia del listado, el handler **no** filtra por `IsActive`, por lo que también puede "eliminar" un área ya inactiva.

---

## Códigos de Estado

| Código | Descripción |
|---|---|
| `204` | Área de trabajo eliminada exitosamente. |
| `400` | Error de validación o área no encontrada (`ErrorResponse`). |
| `500` | Error interno del servidor (`ErrorResponse`). |
