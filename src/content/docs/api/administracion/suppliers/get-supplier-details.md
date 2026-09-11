---
title: "Obtener Detalles de Proveedor"
module: "Suppliers"
---

Endpoint para consultar la ficha completa de un proveedor, incluyendo sus datos comerciales, detalles de crédito, información del usuario registrador y lista de cuentas bancarias activas.

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **Endpoint** | `/api/v1/companies/{companie_id}/modules/{module_code}/suppliers/{supplier_id}/details` |
| **Descripción** | Retorna la ficha completa del proveedor con sus detalles fiscales, comerciales y cuentas bancarias vigentes. |

---

## Parámetros de Ruta (Path Params)

| Parámetro | Tipo | Requerido | Descripción |
|:---:|:---:|:---:|---|
| `companie_id` | `guid` | Sí | Identificador único de la compañía. |
| `module_code` | `string` | Sí | Código del módulo (ej. `PURCHASING`). |
| `supplier_id` | `guid` | Sí | Identificador único del proveedor. |

---

## Headers

| Header | Valor | Requerido |
|---|---|:---:|
| `Authorization` | `Bearer {token}` | Sí |

---

## Respuestas

### ✅ 200 OK

Retorna `SupplierInformationDto`:

```json
{
  "supplier_id": "9b3c4371-a0a4-4f4c-bc6a-c21f925b4101",
  "supplier_legal_name": "Comercial del Valle S.A.",
  "commercial_name": "Comercial Valle",
  "identification_type": "Ruc",
  "identification_number": "0010909260001A",
  "constitution_type": "Legal",
  "user_information": {
    "user_id": "11111111-0000-0000-0000-000000000001",
    "email": "juan.perez@alpac.com",
    "user_fullname": "Juan Pérez",
    "area_information": {
      "area_id": "11111111-0000-0000-0000-000000000001",
      "work_area_name": "Tecnología de la Información",
      "area_code": 10
    }
  },
  "supplier_details": {
    "address": "Km 5 Carretera Norte, Managua",
    "email_support": "soporte@valle.com",
    "contact_name": "Juan Pérez",
    "contact_email": "juan.perez@valle.com",
    "contact_phone_number": "+505 8888-9999",
    "has_credit": true,
    "credit_days": 30,
    "credit_limit": 50000.00,
    "credit_currency": "USD",
    "alert_days_before_due": 5,
    "preferred_payment_method": "ACH",
    "is_exclusive": true,
    "exclusive_brands_or_parts": "Filtros y Lubricantes Industriales",
    "apply_ir_retention": true,
    "apply_municipal_retention": true,
    "is_tax_exempt": false
  },
  "bank_accounts": [
    {
      "id": "e4a7c1b2-1111-2222-3333-444455556666",
      "bank_name": "BAC Credomatic",
      "account_number": "9988776655",
      "account_type": "Checking",
      "currency": "USD",
      "account_holder_name": "Comercial del Valle S.A.",
      "account_holder_identification": "0010909260001A",
      "is_primary": true
    }
  ]
}
```

### ❌ 400 Bad Request

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "No se encontro registro de este proveedor"
  },
  "created_at": "2026-09-09 10:00:00"
}
```
