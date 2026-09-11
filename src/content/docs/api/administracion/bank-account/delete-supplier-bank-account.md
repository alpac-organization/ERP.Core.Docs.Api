---
title: "Eliminar Cuenta Bancaria de Proveedor"
module: "BankAccount"
---

## Eliminar Cuenta Bancaria de Proveedor

Endpoint para eliminación lógica (`soft delete`) de una cuenta bancaria asignada a un proveedor.

| Campo | Valor |
|---|---|
| **Método** | `DELETE` |
| **Endpoint** | `/api/v1/companies/{companie_id}/modules/{module_code}/suppliers/{supplier_id}/bank-accounts/{bank_account_id}` |
| **Descripción** | Aplica eliminación lógica sobre la cuenta (`deleted_at = UtcNow`, `is_primary = false`). Si la cuenta eliminada era la principal, reasigna automáticamente como principal a otra cuenta activa. |

---

## Parámetros de Ruta (Path Params)

| Parámetro | Tipo | Requerido | Descripción |
|:---:|:---:|:---:|---|
| `companie_id` | `guid` | Sí | Identificador único de la compañía. |
| `module_code` | `string` | Sí | Código del módulo (ej. `PURCHASING`). |
| `supplier_id` | `guid` | Sí | Identificador único del proveedor. |
| `bank_account_id` | `guid` | Sí | Identificador único de la cuenta bancaria a eliminar. |

---

## Headers

| Header | Valor | Requerido |
|---|---|:---:|
| `Authorization` | `Bearer {token}` | Sí |

---

## Reglas de Negocio

1. **Eliminación Lógica (`Soft Delete`)**:
   - La cuenta no se elimina físicamente de la base de datos.
   - Se establece `deleted_at = DateTime.UtcNow`.
   - Se desmarca `is_primary = false`.
2. **Reasignación Automática de Cuenta Principal**:
   - Si la cuenta eliminada era la cuenta principal (`is_primary: true` antes de la eliminación), el backend busca la siguiente cuenta activa restante del proveedor (`deleted_at == null`) y le asigna `is_primary = true` de forma automática.
   - Si no quedan cuentas activas, el proveedor simplemente queda sin cuentas bancarias.

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
