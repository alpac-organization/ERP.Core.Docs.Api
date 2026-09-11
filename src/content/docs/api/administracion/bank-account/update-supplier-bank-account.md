---
title: "Modificar Cuenta Bancaria de Proveedor"
module: "BankAccount"
---

Endpoint para actualizar parcialmente los datos de una cuenta bancaria o cambiar el estado de cuenta principal.

| Campo | Valor |
|---|---|
| **Método** | `PATCH` |
| **Endpoint** | `/api/v1/companies/{companie_id}/modules/{module_code}/suppliers/{supplier_id}/bank-accounts/{bank_account_id}` |
| **Descripción** | Permite modificar campos individuales de la cuenta bancaria. Si se actualiza a `is_primary: true`, el sistema garantiza la exclusividad desmarcando cualquier otra cuenta principal activa. |

---

## Parámetros de Ruta (Path Params)

| Parámetro | Tipo | Requerido | Descripción |
|:---:|:---:|:---:|---|
| `companie_id` | `guid` | Sí | Identificador único de la compañía. |
| `module_code` | `string` | Sí | Código del módulo (ej. `PURCHASING`). |
| `supplier_id` | `guid` | Sí | Identificador único del proveedor. |
| `bank_account_id` | `guid` | Sí | Identificador único de la cuenta bancaria a modificar. |

---

## Headers

| Header | Valor | Requerido |
|---|---|:---:|
| `Authorization` | `Bearer {token}` | Sí |
| `Content-Type` | `application/json` | Sí |

---

## Request Body

Todos los campos son opcionales (`null`); solo se envían las propiedades a cambiar:

```json
{
  "bank_name": "BAC Credomatic Actualizado",
  "account_number": "999888777",
  "account_type": "Checking",
  "currency": "NIO",
  "account_holder_name": "Comercial del Valle S.A.",
  "account_holder_identification": "0010909260001A",
  "is_primary": true
}
```

### Reglas de Negocio
- Si se envía `is_primary: true`, todas las demás cuentas bancarias activas del proveedor pasan automáticamente a `is_primary: false`.

---

## Respuestas

### ✅ 200 OK

Retorna `200 OK` vacío:

```text
HTTP/1.1 200 OK
```

### ❌ 400 Bad Request

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "La cuenta bancaria especificada no existe"
  },
  "created_at": "2026-09-09 10:00:00"
}
```
