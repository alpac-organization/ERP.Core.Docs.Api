---
title: "Eliminar Puesto de Trabajo"
module: "job-positions"
---


Endpoint para eliminar un puesto de trabajo del catálogo de una compañía/módulo.

| Campo     | Valor |
|-----------|-------|
| **Método**      | `DELETE` |
| **Endpoint**    | `/api/v1/companies/{company_id}/modules/{module_code}/job-positions/{job_position_id}` |
| **Descripción** | Elimina un puesto de trabajo específico, identificado por su `job_position_id`. |

---

## Parámetros de Ruta (Path Params)

| Parámetro          | Tipo     | Requerido | Descripción |
|:-------------------:|:--------:|-----------|-------------|
| `company_id`        | `guid`   | Sí        | Identificador único de la compañía. |
| `module_code`       | `string` | Sí        | Código del módulo dentro de la compañía. |
| `job_position_id`   | `guid`   | Sí        | Identificador único del puesto de trabajo a eliminar. |

---

## Headers

| Header          | Valor              | Requerido |
|-----------------|--------------------|-----------|
| `Authorization` | `Bearer {token}`   | Sí        |

---

## Autorización

- Requiere token (`Authorization: Bearer {token}`).
- Solo usuarios con rol **`Administrator`** pueden eliminar puestos de trabajo. En caso contrario, la API responde `400` con `"Solo administradores puede eliminar un dato del catalogo"`.
- El handler invoca `ValidateAccessAsync` (usuario → perfil → módulo → rol).

---

## Respuestas

### ✅ 204 No Content

No retorna cuerpo. El `DeleteJobPositionCommand` responde `bool` internamente (`IRequest<bool>`), pero el controlador no valida ese resultado antes de retornar `NoContent()`.

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
| `204` | Puesto de trabajo eliminado exitosamente. |
| `400` | Error de validación o de acceso del usuario a la compañía/módulo (`ErrorResponse`). |
| `500` | Error interno del servidor (`ErrorResponse`). |