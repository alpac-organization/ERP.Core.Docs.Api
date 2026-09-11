---
title: "Registrar Colaboradores"
module: "Collaborators"
---

Endpoint para registrar colaborador dentro del modulo de nomina.

| Campo | Valor     |
|-------|-----------|
| **Método**        | `POST` |
| **Endpoint**      | `/api/v1/companies/{company_id}/modules/{module_code}/collaborators` |
| **Descripción**   | Registra un nuevo colaborador asociado a una compañía y a un módulo específico. |
---

## Catálogos requeridos

Para poder registrar un colaborador es obligatorio que existan previamente los siguientes registros de catálogo. Sus identificadores se envían dentro de `working_information`:

| Campo en `working_information` | Catálogo | Documentación |
|---|---|---|
| `area_id`        | Área de trabajo  | [Registrar](../../catalogs/work-areas/register-work-area.md) · [Listar](../../catalogs/work-areas/get-work-areas.md) |
| `job_position_id`| Puesto de trabajo| [Registrar](../../catalogs/job-positions/register-job-position.md) · [Listar](../../catalogs/job-positions/get-job-positions.md) |
| `cost_center_id` | Centro de costo  | [Registrar](../../catalogs/cost-centers/register-cost-center.md) · [Listar](../../catalogs/cost-centers/get-cost-centers.md) |
| `branch_id`      | Sucursal         | *Documentación pendiente* |

Para asignar viáticos (`travel_expenses[]`) se requiere además el catálogo de tipos de ingreso:

| Campo en `travel_expenses[]` | Catálogo         | Documentación |
|---|---|---|
| `type_income_id`             | Tipo de ingreso  | [Listar](../../catalogs/types-income/get-types-income.md) |

> 🔗 El centro de costo (`cost_center_id`) pertenece a un área de trabajo (`area_id`), por lo que primero debe registrarse el área y luego el centro de costo.
>
> 🔗 El endpoint de **tipos de ingreso** es necesario para poder definir el tipo de ingreso al momento de asignarle un viático al colaborador.

---

## Parámetros de Ruta (Path Params)

| Parámetro     | Tipo       | Requerido | Descripción |
|:-------------:|:----------:|-----------|-------------|
| `company_id`  | `string`   | Sí        | Identificador único de la compañía. |
| `module_code` | `string`   | Sí        | Código del módulo dentro de la compañía (ej. `NMI-43GW`). |

---

## Headers

| Header           | Valor              | Requerido |
|------------------|--------------------|-----------|
| `Authorization`  | `Bearer {token}`   | Sí        |
| `Content-Type`   | `application/json` | Sí        |

---

## Request Body
 
```json
{
  "first_name": "Juan",
  "second_name": "Carlos",
  "third_name": null,
  "first_lastname": "Pérez",
  "second_lastname": "Gómez",
  "identification_number": "001-090926-0001A",
  "identification_type": 1,
  "gender": 1,
  "status": "Active",
  "does_work_saturday": false,
  "registered_by": "admin@empresa.com",
 
  "working_information": {
    "bank_account_number": "1234567890",
    "work_phone_number": "22551234",
    "work_email": "juan.perez@empresa.com",
    "inss_number": "1234567",
    "daem": "DAEM-001",
    "area_id": "5f8d0d55-6c8a-4a2b-9d3f-000000000001",
    "work_position_id": 12,
    "branch_id": "5f8d0d55-6c8a-4a2b-9d3f-000000000002",
    "entry_date": "2026-09-09"
  },
 
  "personal_information": {
    "personal_email": "juanperez@gmail.com",
    "personal_phone_number": "88887777",
    "address": "Barrio El Progreso, Managua",
    "departament_id": 3,
    "birthdate": "1995-04-12T00:00:00",
    "marital_status": 1
  },
 
  "salary_information": {
    "currency": 1,
    "salary_type": 1,
    "salary": 15000.00,
    "sub_catalog_bank_id": 4
  },
 
  "travel_expenses": [
    {
      "type_income_id": "5f8d0d55-6c8a-4a2b-9d3f-000000000003",
      "income_amount": 500.00
    }
  ]
}
```
 
### Descripción de Campos
 
#### Nivel raíz
 
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `code` | `string` | No | Código interno del colaborador. |
| `first_name` | `string` | No* | Primer nombre. |
| `second_name` | `string` | No | Segundo nombre. |
| `third_name` | `string` | No | Tercer nombre. |
| `first_lastname` | `string` | No* | Primer apellido. |
| `second_lastname` | `string` | No | Segundo apellido. |
| `identification_number` | `string` | No* | Número de identificación. |
| `identification_type` | `enum (IdentificationType)` | Sí | Tipo de identificación. |
| `gender` | `enum (GenderType)` | Sí | Género del colaborador. |
| `status` | `enum (CollaboratorStatus)` | Sí | Estado del colaborador. |
| `does_work_saturday` | `boolean` | No | Indica si el colaborador trabaja los sábados. Default: `false`. |
| `registered_by` | `string` | No | Identificador de quién registró al colaborador. |
| `working_information` | `object` | No | Información laboral (ver detalle abajo). |
| `personal_information` | `object` | No | Información personal (ver detalle abajo). |
| `salary_information` | `object` | **Sí** | Información salarial (ver detalle abajo). |
| `travel_expenses` | `array` | No | Lista de viáticos/ingresos adicionales. Default: `[]`. |
 
\* Aunque son `string?` (nullable) en el command, en la práctica suelen ser obligatorios para poder identificar al colaborador; se recomienda validarlos en backend.
 
#### `working_information`
 
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `bank_account_number` | `string` | No | Número de cuenta bancaria. |
| `work_phone_number` | `string` | No | Teléfono de trabajo. |
| `work_email` | `string` | No | Correo electrónico laboral. |
| `inss_number` | `string` | No | Número de afiliación INSS. |
| `daem` | `string` | No | Código DAEM. |
| `area_id` | `guid` | Sí | Identificador del área (catálogo). |
| `work_position_id` | `integer` | Sí | Identificador del cargo (catálogo). |
| `branch_id` | `guid` | Sí | Identificador de la sucursal (catálogo). |
| `entry_date` | `date (YYYY-MM-DD)` | Sí | Fecha de ingreso. |
 
#### `personal_information`
 
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `personal_email` | `string` | No | Correo electrónico personal. |
| `personal_phone_number` | `string` | No | Teléfono personal. |
| `address` | `string` | No | Dirección de residencia. |
| `departament_id` | `integer` | No | Identificador del departamento (catálogo geográfico). |
| `birthdate` | `datetime (ISO 8601)` | Sí | Fecha de nacimiento. |
| `marital_status` | `enum (MaritalStatus)` | Sí | Estado civil. |
 
#### `salary_information` (obligatorio)
 
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `currency` | `enum (Currency)` | Sí | Moneda del salario. |
| `salary_type` | `enum (SalaryType)` | Sí | Tipo de salario (mensual, quincenal, etc.). |
| `salary` | `decimal` | Sí | Monto del salario. |
| `sub_catalog_bank_id` | `integer` | Sí | Identificador del banco (catálogo). |
 
#### `travel_expenses[]`
 
| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `type_income_id` | `guid` | Sí | Identificador del tipo de ingreso/viático (catálogo). |
| `income_amount` | `decimal` | Sí | Monto del ingreso/viático. |


#### Catálogo de Enums
 
Todos los enums se envían como su valor **numérico** (`int`), no como string, según `ERP.Core.Database.Domain.Enums`.
 
**`GenderType`**
 
| Valor | Nombre | Traducción |
|---|---|---|
| `1` | Man | Hombre |
| `2` | Women | Mujer |
 
**`Currency`**
 
| Valor | Nombre | Traducción |
|---|---|---|
| `1` | NIO | Córdoba nicaragüense |
| `2` | USD | Dólar estadounidense |
 
**`SalaryType`**
 
| Valor | Nombre | Traducción |
|---|---|---|
| `1` | Fixed | Fijo |
| `2` | Variable | Variable |
| `3` | ProfessionalServices | Servicios profesionales |
 
**`MaritalStatus`**
 
| Valor | Nombre | Traducción |
|---|---|---|
| `0` | None | Ninguno |
| `1` | Single | Soltero(a) |
| `2` | Married | Casado(a) |
| `3` | Divorced | Divorciado(a) |
| `4` | Widowed | Viudo(a) |
| `5` | DomesticPartner | Unión libre |
| `6` | Separated | Separado(a) |
| `7` | Other | Otro |
 
**`IdentificationType`**
 
| Valor | Nombre | Traducción |
|---|---|---|
| `1` | Cedula | Cédula de identidad |
| `2` | Pasaporte | Pasaporte |
| `3` | CedulaResidencia | Cédula de residencia |
| `4` | Ruc | RUC (Registro Único de Contribuyente) | 

## Respuestas
 
### ✅ 201 Created
 
Al crear exitosamente, el endpoint responde únicamente con el código **`201 Created`**, sin body.
 
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
    "description": "El primer nombre es obligatorio."
  },
  "created_at": "2026-09-09 10:00:00"
}
```

### ❌ 401 Unauthorized
 
```json
{
  "status": 401,
  "error": {
    "type_error": "Unauthorized",
    "description": "Token de autenticación inválido o expirado"
  },
  "created_at": "2026-09-09 10:00:00"
}
```