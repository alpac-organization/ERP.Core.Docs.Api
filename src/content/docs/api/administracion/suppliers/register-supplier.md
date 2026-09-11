---
title: "Registrar Proveedor"
module: "Suppliers"
---

Endpoint para registrar un nuevo proveedor con sus datos fiscales, comerciales, condiciones crediticias y cuentas bancarias asociadas.

| Campo | Valor |
|---|---|
| **Método** | `POST` |
| **Endpoint** | `/api/v1/companies/{companie_id}/modules/{module_code}/suppliers` |
| **Descripción** | Registra la ficha del proveedor en `suppliers`, sus configuraciones de crédito en `suppliers_details` y opcionalmente sus cuentas bancarias en `supplier_bank_accounts`. |

---

## Parámetros de Ruta (Path Params)

| Parámetro | Tipo | Requerido | Descripción |
|:---:|:---:|:---:|---|
| `companie_id` | `guid` | Sí | Identificador único de la compañía. |
| `module_code` | `string` | Sí | Código del módulo (ej. `PURCHASING`). |

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
  "suppliers_legal_name": "Comercial del Valle S.A.",
  "commercial_name": "Comercial Valle",
  "identification_type": "Ruc",
  "identification_number": "0010909260001A",
  "constitution_type": "Legal",
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

### Descripción de Campos

#### Nivel Raíz (`RegisterSupplierCommand`)

| Campo | Tipo | Requerido | Restricciones / Reglas | Descripción |
|---|---|:---:|---|---|
| `suppliers_legal_name` | `string` | **Sí** | Máx. 200 caracteres | Razón social o nombre legal completo. |
| `commercial_name` | `string` | No | Máx. 200 caracteres | Nombre comercial o de fantasía. |
| `identification_type` | `enum (IdentificationType)` | **Sí** | `Cedula`, `Pasaporte`, `CedulaResidencia`, `Ruc` | Tipo de identificación tributaria. |
| `identification_number` | `string` | **Sí** | Máx. 50 caracteres | Número oficial del documento. |
| `constitution_type` | `enum (ConstitutionType)` | **Sí** | `Natural`, `Legal` | Tipo de personería jurídica. |
| `supplier_details` | `object` | **Sí** | No nulo | Objeto con detalles comerciales y crédito. |
| `bank_accounts` | `array` | No | Máx. 1 cuenta con `is_primary: true` | Lista de cuentas bancarias iniciales. |

#### `supplier_details`

| Campo | Tipo | Requerido | Restricciones / Reglas | Descripción |
|---|---|:---:|---|---|
| `address` | `string` | No | Máx. 500 caracteres | Dirección física del proveedor. |
| `email_support` | `string` | No | Formato email válido | Correo general de atención o soporte. |
| `contact_name` | `string` | No | Máx. 200 caracteres | Nombre de la persona de contacto. |
| `contact_email` | `string` | No | Formato email válido | Correo directo de contacto. |
| `contact_phone_number` | `string` | No | Formato 8 dígitos, opcional `+505` | Teléfono de contacto. |
| `has_credit` | `boolean` | **Sí** | Booleano | Indica si el proveedor nos otorga línea de crédito. |
| `credit_days` | `integer` | **Sí** | $\ge 0$. Si `has_credit = true`, debe ser $\ge 1$ | Plazo en días del crédito. |
| `credit_limit` | `decimal` | No | $\ge 0$ | Límite máximo del crédito. |
| `credit_currency` | `enum (Currency)` | No | `NIO`, `USD` | Moneda en la que está pactado el crédito. |
| `alert_days_before_due` | `integer` | No | $\ge 0$ | Días previos al vencimiento para notificaciones. |
| `preferred_payment_method`| `enum (PaymentMethodType)` | **Sí** | `ACH`, `LocalTransfer`, `Check`, `Cash`, `InternationalWire` | Forma de pago acordada por defecto. |
| `is_exclusive` | `boolean` | No | Booleano | Indica si es distribuidor exclusivo. |
| `exclusive_brands_or_parts` | `string` | No | Máx. 500 caracteres | Detalle de líneas o marcas exclusivas. |
| `apply_ir_retention` | `boolean` | No | Booleano | Aplica retención del Impuesto sobre la Renta. |
| `apply_municipal_retention`| `boolean` | No | Booleano | Aplica retención municipal. |
| `is_tax_exempt` | `boolean` | No | Booleano | Exento de impuestos. |

#### `bank_accounts[]`

| Campo | Tipo | Requerido | Restricciones / Reglas | Descripción |
|---|---|:---:|---|---|
| `bank_name` | `string` | **Sí** | Máx. 100 caracteres | Nombre de la institución bancaria. |
| `account_number` | `string` | **Sí** | Máx. 50 caracteres | Número de la cuenta bancaria. |
| `account_type` | `enum (BankAccountType)` | **Sí** | `Savings`, `Checking` | Tipo de cuenta bancaria. |
| `currency` | `enum (Currency)` | **Sí** | `NIO`, `USD` | Moneda de la cuenta bancaria. |
| `account_holder_name` | `string` | **Sí** | Máx. 200 caracteres | Nombre del titular de la cuenta. |
| `account_holder_identification` | `string` | No | Máx. 50 caracteres | Identificación tributaria o cédula del titular. |
| `is_primary` | `boolean` | **Sí** | Máx. 1 cuenta `true` por registro | Define si es la cuenta principal para desembolsos. |

---

## Respuestas

### ✅ 200 OK

Retorna `RegisterSupplierDto`:

```json
{
  "supplier_id": "9b3c4371-a0a4-4f4c-bc6a-c21f925b4101"
}
```

### ❌ 400 Bad Request

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "Los dias de creditos deben contener almenos un dia"
  },
  "created_at": "2026-09-09 10:00:00"
}
```

---

## Catálogos de Enums Utilizados

### `PaymentMethodType`
| Valor | Nombre | Descripción |
|:---:|---|---|
| `1` | `ACH` | Transferencia interbancaria ACH |
| `2` | `LocalTransfer` | Transferencia mismo banco |
| `3` | `Check` | Cheque |
| `4` | `Cash` | Efectivo |
| `5` | `InternationalWire` | Transferencia internacional |

### `BankAccountType`
| Valor | Nombre | Descripción |
|:---:|---|---|
| `1` | `Savings` | Cuenta de Ahorro |
| `2` | `Checking` | Cuenta Corriente |

### `Currency`
| Valor | Nombre | Descripción |
|:---:|---|---|
| `1` | `NIO` | Córdobas (Nicaragua) |
| `2` | `USD` | Dólares Estadounidenses |
