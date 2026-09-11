---
title: "Listar Cuentas Bancarias del Proveedor"
module: "BankAccount"
---

Endpoint para consultar todas las cuentas bancarias activas pertenecientes a un proveedor específico.

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **Endpoint** | `/api/v1/companies/{companie_id}/modules/{module_code}/suppliers/{supplier_id}/bank-accounts` |
| **Descripción** | Retorna la lista de cuentas bancarias vigentes (excluye las cuentas con eliminación lógica / `soft delete`). |

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

Retorna una lista de `SupplierBankAccountDto`:

```json
[
  {
    "id": "e4a7c1b2-1111-2222-3333-444455556666",
    "bank_name": "BAC Credomatic",
    "account_number": "9988776655",
    "account_type": "Checking",
    "currency": "USD",
    "account_holder_name": "Comercial del Valle S.A.",
    "account_holder_identification": "0010909260001A",
    "is_primary": true
  },
  {
    "id": "f5b8d2c3-2222-3333-4444-555566667777",
    "bank_name": "Banco LAFISE",
    "account_number": "1122334455",
    "account_type": "Savings",
    "currency": "NIO",
    "account_holder_name": "Comercial del Valle S.A.",
    "account_holder_identification": "0010909260001A",
    "is_primary": false
  }
]
```

### ❌ 400 Bad Request

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "No se encontró registro de este proveedor"
  },
  "created_at": "2026-09-09 10:00:00"
}
```
