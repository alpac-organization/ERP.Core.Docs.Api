---
title: "Registrar Área de Trabajo"
module: "work-areas"
---


Endpoint para registrar una nueva área de trabajo dentro de un módulo de una compañía.

| Campo     | Valor |
|-----------|-------|
| **Método**      | `POST` |
| **Endpoint**    | `/api/v1/companies/{company_id}/modules/{module_code}/areas` |
| **Descripción** | Registra una nueva área de trabajo asociada a una compañía. El `work_area_code` se genera automáticamente por compañía. |

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
| `Content-Type`  | `application/json` | Sí        |

> ℹ️ `company_id`, `module_code` y `user_id` no se envían en el body: el controller los sobrescribe con los valores de la ruta y del token de autenticación antes de enviar el command (`WorkAreasController.RegisterWorkAreaAsync`).

---

## Request Body

```json
{
  "work_area_name": "DEPOSITO PUBLICO",
  "description": "Área encargada del resguardo y despacho de mercancía."
}
```

### Descripción de Campos

| Campo            | Tipo     | Requerido | Descripción |
|------------------|----------|:---------:|-------------|
| `work_area_name` | `string` | **Sí**    | Nombre del área de trabajo. |
| `description`    | `string` | No        | Descripción general del área. Si se omite, se guarda `"Sin Descripción"`. |

---

## Respuestas

### ✅ 201 Created

No retorna cuerpo (`CreatedResult`).

```
HTTP/1.1 201 Created
```

### ❌ 400 Bad Request

Usa la entidad `ErrorResponse` (`ERP.Core.Domain.Entities.Errors`):

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "El nombre del area de trabajo es requerido."
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
- `work_area_name` es requerido (no vacío).

---

## Autorización

- Requiere token (`Authorization: Bearer {token}`).
- Solo usuarios con rol **`Administrator`** pueden registrar áreas de trabajo. En caso contrario, la API responde `400` con `"Solo administradores pueden registrar áreas de trabajo"`.
- El handler `RegisterWorkAreaHandler` invoca `ValidateAccessAsync` (usuario → perfil → módulo → rol) usando `company_id`, `module_code` y el `UserId` del token.

---

## Notas de Implementación

- El `work_area_code` se calcula como `max(work_area_code) + 1` tomando **todas** las áreas de la compañía (incluidas las inactivas). Se almacena con `IsActive = true`.

---

## Códigos de Estado

| Código | Descripción |
|---|---|
| `201` | Área de trabajo registrada exitosamente. |
| `400` | Error de validación (`ErrorResponse`). |
| `500` | Error interno del servidor (`ErrorResponse`). |
