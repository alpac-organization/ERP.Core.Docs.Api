---
title: "Actualizar Información de Proveedor"
module: "Suppliers"
---

## Actualizar Información de Proveedor

Endpoint para actualizar de manera parcial los datos generales y detalles de crédito o fiscales de un proveedor existente.

## Información General

| Campo | Valor |
|---|---|
| **Método** | `PATCH` |
| **Endpoint** | `/api/v1/companies/{companie_id}/modules/{module_code}/suppliers/{supplier_id}` |
| **Descripción** | Permite actualizar selectivamente cualquier campo del proveedor (`Suppliers`) y sus detalles asociados (`SuppliersDetails`). |

---

## Parámetros de Ruta (Path Params)

| Parámetro | Tipo | Requerido | Descripción |
|:---:|:---:|:---:|---|
| `companie_id` | `guid` | Sí | Identificador único de la compañía. |
| `module_code` | `string` | Sí | Código del módulo (ej. `PURCHASING`). |
| `supplier_id` | `guid` | Sí | Identificador único del proveedor a modificar. |

---

## Headers

| Header | Valor | Requerido |
|---|---|:---:|
| `Authorization` | `Bearer {token}` | Sí |
| `Content-Type` | `application/json` | Sí |

---

## Request Body

Todos los campos son opcionales (`null`); solo se envían los valores que se deseen modificar:

```json
{
  "suppliers_legal_name": "Comercial del Valle S.A.",
  "commercial_name": "Nuevo Nombre Comercial",
  "identification_type": "Ruc",
  "identification_number": "0010909260001A",
  "constitution_type": "Legal",
  "supplier_details": {
    "address": "Nueva Dirección, Km 7 Carretera Norte",
    "email_support": "nuevo_soporte@valle.com",
    "contact_name": "María López",
    "contact_email": "mlopez@valle.com",
    "contact_phone_number": "+505 8765-4321",
    "has_credit": true,
    "credit_days": 45,
    "credit_limit": 75000.00,
    "credit_currency": "USD",
    "alert_days_before_due": 7,
    "preferred_payment_method": "ACH",
    "is_exclusive": false,
    "exclusive_brands_or_parts": null,
    "apply_ir_retention": true,
    "apply_municipal_retention": true,
    "is_tax_exempt": false
  }
}
```

### Reglas de Validación
- El usuario autenticado debe poseer rol `Administrator` o `Manager` en el módulo.
- Si se envía `commercial_name`, no puede exceder 200 caracteres.
- Si se envía `contact_email` o `email_support`, deben tener formato de correo válido.
- Si se envía `credit_limit`, no puede ser un número negativo.

---

## Respuestas

### ✅ 200 OK

Retorna `200 OK` vacío (sin contenido en el body):

```text
HTTP/1.1 200 OK
```

### ❌ 400 Bad Request

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "El registro de este proveedor no existe"
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
