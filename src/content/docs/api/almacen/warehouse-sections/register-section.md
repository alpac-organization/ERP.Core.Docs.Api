---
title: "Registrar Sección"
module: "WarehouseSections"
---

# Almacén

Endpoint para registrar una sección dentro de un almacén de una compañía/módulo.

| Campo | Valor |
|-------|-------|
| **Método**      | `POST` |
| **Endpoint**    | `/api/v1/companies/{company_id}/modules/{module_code}/warehouse/{warehouse_id}/sections` |
| **Descripción** | Registra una sección activa en el almacén, calcula y persiste su capacidad (`section_capacity`) y actualiza la capacidad existente del almacén (`warehouse_capacity`) con el resultado del cálculo. |

---

## Parámetros de Ruta (Path Params)

| Parámetro      | Tipo     | Requerido | Descripción |
|:--------------:|:--------:|-----------|-------------|
| `company_id`   | `guid`   | Sí        | Identificador único de la compañía. |
| `module_code`  | `string` | Sí        | Código del módulo dentro de la compañía. |
| `warehouse_id` | `guid`   | Sí        | Identificador del almacén donde se registra la sección. Debe existir y estar activo. |

---

## Headers

| Header          | Valor              | Requerido |
|-----------------|--------------------|-----------|
| `Authorization` | `Bearer {token}`   | Sí        |

---

## Request Body

`user_id`, `company_id`, `module_code` y `warehouse_id` no forman parte del JSON: se toman del token y de la ruta (`[JsonIgnore]`).

| Parámetro      | Tipo                         | Requerido | Descripción |
|----------------|------------------------------|-----------|-------------|
| `code`         | `string`                     | Sí        | Código de la sección. Máximo 50 caracteres. Debe ser único dentro del almacén. |
| `section_type` | `integer (enum SectionType)` | Sí        | Tipo de sección. Se envía como **número** (no como string). Debe ser un valor definido del enum. Interviene en el cálculo de capacidad. |
| `width`        | `decimal`                    | Sí        | Ancho de la sección (metros). Debe ser mayor a cero. Admite máximo 2 decimales. |
| `length`       | `decimal`                    | Sí        | Largo de la sección (metros). Debe ser mayor a cero. Admite máximo 2 decimales. |

```json
{
  "code": "SEC-A2",
  "section_type": 1,
  "width": 20.00,
  "length": 25.00
}
```

---

## Respuestas

### ✅ 201 Created

El recurso se creó correctamente. El cuerpo de la respuesta puede ir vacío.

### Notas

| Campo / regla | Descripción |
|---|---|
| Sección | Se crea con `is_active = true`. |
| Capacidad de sección | Se calcula con `width`, `length` y `section_type` sobre el almacén y se persiste en `section_capacity` (campos de área M2; la capacidad de sección no maneja M3). |
| Capacidad de almacén | El almacén **debe** tener ya un registro en `warehouse_capacity`. Tras el cálculo, se actualizan sobre ese registro los valores recalculados (áreas y volúmenes), sin cambiar `capacity_id` ni `warehouse_id`. |
| `SectionType` | Enum de `ERP.Core.Database.Domain.Enums`. En este endpoint se envía como **entero** mediante `JsonNumberEnumConverter<SectionType>`. FluentValidation valida con `IsInEnum` (`El tipo de sección no es válido.`). El catálogo completo de valores no está definido en este repositorio. |
| `section_type` con tipo incorrecto | Si se envía como string (por ejemplo `"Storage"`) u otro tipo distinto a número, falla la deserialización del body **antes** del validator (model binding de ASP.NET). |
| Rol `Supervisor` | Recibe 400: `No tienes permiso para realizar esta acción`. |
| Cálculo fallido | Recibe 400: `No se pudo calcular la capacidad de la sección.` |
| Sin capacidad de almacén | Recibe 400: `El almacén no tiene capacidad registrada`. |
| Código duplicado | Recibe 400 desde el handler: `Ya existe una sección con ese código en el almacén.` |
| Almacén inválido | Recibe 400 desde el handler: `El almacén indicado no existe o no está activo.` |

### ❌ 400 Bad Request

Usa la entidad `ErrorResponse` (`ERP.Core.Domain.Entities.Errors`) en errores de validación FluentValidation, acceso y reglas de negocio:

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "El usuario no tiene acceso a esta compañía o módulo"
  },
  "created_at": "2026-09-10 08:00:00"
}
```

Si `section_type` no es un número válido en el JSON, la respuesta puede venir en el formato de model binding de ASP.NET (no `ErrorResponse`), por ejemplo:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "$.section_type": [
      "The JSON value could not be converted to ERP.Core.Database.Domain.Enums.SectionType."
    ]
  }
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
  "created_at": "2026-09-10 08:00:00"
}
```

---

## Códigos de Estado

| Código | Descripción |
|---|---|
| `201` | Sección registrada exitosamente. |
| `400` | Error de validación, acceso, permisos, reglas de negocio (`ErrorResponse`) o fallo de deserialización del body (model binding). |
| `500` | Error interno del servidor (`ErrorResponse`). |
