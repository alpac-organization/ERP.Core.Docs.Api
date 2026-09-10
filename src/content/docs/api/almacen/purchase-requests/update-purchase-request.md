---
title: "Actualizar Solicitud de Compra"
module: "PurchaseRequests"
---

# Solicitudes de compras

## Actualizar Solicitud de Compra

Endpoint para actualizar de forma parcial una solicitud de compra y/o sus ítems existentes dentro de el módulo de purchase.

## Información General

| Campo | Valor |
|-------|-------|
| **Método**      | `PATCH` |
| **Endpoint**    | `/api/v1/companies/{company_id}/modules/{module_code}/purchase-requests/{purchase_request_id}` |
| **Descripción** | Actualiza parcialmente la cabecera de una solicitud de compra (`observations`, `priority_level`, `destination_request`) y/o propiedades de ítems ya existentes. **No crea ni elimina ítems.** Solo aplica si la solicitud está activa y en estado `Pending`. |

---

## Parámetros de Ruta 

| Parámetro             | Tipo     | Requerido | Descripción |
|:---------------------:|:--------:|-----------|-------------|
| `company_id`          | `guid`   | Sí        | Identificador único de la compañía. |
| `module_code`         | `string` | Sí        | Código del módulo dentro de la compañía. |
| `purchase_request_id` | `guid`   | Sí        | Identificador de la solicitud de compra a actualizar. Debe existir y estar activa. |

---

## Headers

| Header          | Valor              | Requerido |
|-----------------|--------------------|-----------|
| `Authorization` | `Bearer {token}`   | Sí        |

---

## Request Body

`user_id`, `company_id`, `module_code` y `purchase_request_id` no forman parte del JSON: se toman del token y de la ruta (`[JsonIgnore]` / route).

Todas las propiedades del body son **opcionales** (PATCH parcial). Solo se actualiza lo que se envía con valor.

| Parámetro                | Tipo                                      | Requerido | Descripción |
|--------------------------|-------------------------------------------|-----------|-------------|
| `observations`           | `string`                                  | No        | Observaciones / concepto de la solicitud. Máximo 1000 caracteres. Se mapea a `Concept`. |
| `priority_level`         | `integer (enum PriorityLevel)`            | No        | Nivel de prioridad. Se envía como **número**. Si el tipo de solicitud es Requisición, no puede ser `None`. En otros tipos solo puede ser `None`. |
| `destination_request`    | `integer (enum DestinationRequest)`       | No        | Destino de la solicitud. Se envía como **número**. |
| `purchase_request_items` | `array`                                   | No        | Lista de ítems a actualizar. Si se omite o viene vacía, solo se actualiza la cabecera. |

### Ítems (`purchase_request_items[]`)

| Parámetro         | Tipo      | Requerido | Descripción |
|-------------------|-----------|-----------|-------------|
| `id`              | `guid`    | Sí*       | Identificador del ítem existente. *Sin `id`, el ítem se ignora (este endpoint no crea ítems). |
| `quantity`        | `integer` | No        | Cantidad. Si se envía, debe ser mayor a cero. |
| `quantity_unit`   | `integer` | No        | Cantidad por unidad. Si se envía, debe ser mayor a cero. |
| `product_id`      | `guid`    | No        | Producto asociado. No puede ser `Guid.Empty`. |
| `unit_measure_id` | `guid`    | No        | Unidad de medida. No puede ser `Guid.Empty`. |
| `description`     | `string`  | No        | Descripción del ítem. |
| `justification`   | `string`  | No        | Justificación del ítem. |
| `additional_data` | `string`  | No        | Datos adicionales en JSON. Se guarda tal cual; no se procesan imágenes. |

```json
{
  "observations": "Actualización de la solicitud",
  "priority_level": 1,
  "destination_request": 1,
  "purchase_request_items": [
    {
      "id": "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
      "quantity": 10,
      "quantity_unit": 2,
      "product_id": "11111111-1111-1111-1111-111111111111",
      "unit_measure_id": "22222222-2222-2222-2222-222222222222",
      "description": "Producto editado",
      "justification": "Justificación actualizada",
      "additional_data": null
    }
  ]
}
```

---

## Respuestas

### ✅ 200 OK

La solicitud se actualizó correctamente. El cuerpo de la respuesta puede ir vacío.

### Notas

| Campo / regla | Descripción |
|---|---|
| PATCH parcial | Solo se sobrescriben propiedades enviadas con valor (`HasValue` / `!= null`). |
| Estado | Solo se actualizan solicitudes con `RequestStatus = Pending`. |
| Activa | La solicitud debe existir y tener `IsActive = true`. |
| Ítems | Solo se actualizan ítems existentes por `id`. No hay insert ni delete. |
| `purchase_request_items` vacío / ausente | Solo se actualiza la cabecera (si vino algún campo). |
| Rol `Supervisor` | Recibe 400: `No tienes permiso para realizar esta acción`. |
| Prioridad inválida | Recibe 400: reglas de prioridad según el tipo de solicitud (`ERP:INVALID_PRIORITY`). |
| Solicitud no pendiente | Recibe 400: `Solo se pueden actualizar solicitudes en estado pendiente.` |
| Solicitud no encontrada | Recibe error desde el handler cuando no existe o está inactiva. |
| Ítem no encontrado | Recibe error: `Uno de los productos de la solicitud no existe.` |
| Enums (`priority_level`, `destination_request`) | Se envían como **enteros**. FluentValidation valida con `IsInEnum` cuando vienen con valor. |

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

Si un enum se envía con tipo incorrecto (por ejemplo string), la respuesta puede venir en el formato de model binding de ASP.NET (no `ErrorResponse`), por ejemplo:

```json
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "$.priority_level": [
      "The JSON value could not be converted to ERP.Core.Database.Domain.Enums.PriorityLevel."
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
| `200` | Solicitud de compra actualizada exitosamente. |
| `400` | Error de validación, acceso, permisos, reglas de negocio (`ErrorResponse`) o fallo de deserialización del body (model binding). |
| `500` | Error interno del servidor (`ErrorResponse`). |
