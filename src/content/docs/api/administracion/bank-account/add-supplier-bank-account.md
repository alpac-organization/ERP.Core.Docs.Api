---
title: "Agregar Cuenta Bancaria a Proveedor"
module: "BankAccount"
---

## Agregar Cuenta Bancaria a Proveedor

Endpoint para registrar una nueva cuenta bancaria a un proveedor existente.

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **Endpoint** | `/api/v1/companies/{companie_id}/modules/{module_code}/suppliers/{supplier_id}/bank-accounts` |
| **Descripción** | Agrega una cuenta bancaria a la entidad del proveedor. Maneja la exclusividad de la cuenta principal de forma automática. |

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
| `Content-Type` | `application/json` | Sí |

---

## Request Body

```json
{
  "bank_name": "Banco LAFISE",
  "account_number": "5544332211",
  "account_type": "Savings",
  "currency": "NIO",
  "account_holder_name": "Comercial del Valle S.A.",
  "account_holder_identification": "0010909260001A",
  "is_primary": true
}
```

### Reglas de Negocio Automáticas
1. **Primera Cuenta Automática**: Si el proveedor no cuenta con ninguna cuenta bancaria activa previa, la nueva cuenta se guardará automáticamente como principal (`is_primary: true`), aun si en el body se envió `is_primary: false`.
2. **Exclusividad de Principal**: Si se envía `is_primary: true` y el proveedor ya posee otras cuentas activas, el sistema automáticamente desmarca las anteriores a `is_primary: false`.

### Descripción de Campos

| Campo | Tipo | Requerido | Restricciones / Reglas | Descripción |
|---|---|:---:|---|---|
| `bank_name` | `string` | **Sí** | Máx. 100 caracteres | Nombre de la entidad bancaria. |
| `account_number` | `string` | **Sí** | Máx. 50 caracteres | Número oficial de cuenta bancaria. |
| `account_type` | `enum (BankAccountType)` | **Sí** | `Savings`, `Checking` | Tipo de cuenta bancaria. |
| `currency` | `enum (Currency)` | **Sí** | `NIO`, `USD` | Moneda de la cuenta. |
| `account_holder_name` | `string` | **Sí** | Máx. 200 caracteres | Nombre completo del titular. |
| `account_holder_identification` | `string` | No | Máx. 50 caracteres | Cédula o RUC del titular. |
| `is_primary` | `boolean` | **Sí** | Booleano | Si es la cuenta principal del proveedor. |

---

## Respuestas

### ✅ 200 OK

Retorna el DTO de la cuenta recién creada (`SupplierBankAccountDto`):

```json
{
  "id": "a8f3b2c1-3333-4444-5555-666677778888",
  "bank_name": "Banco LAFISE",
  "account_number": "5544332211",
  "account_type": "Savings",
  "currency": "NIO",
  "account_holder_name": "Comercial del Valle S.A.",
  "account_holder_identification": "0010909260001A",
  "is_primary": true
}
```

### ❌ 400 Bad Request

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "El proveedor especificado no existe"
  },
  "created_at": "2026-09-09 10:00:00"
}
```
