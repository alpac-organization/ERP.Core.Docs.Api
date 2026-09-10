---
title: "Actualizar Información de Colaborador"
module: "Collaborators"
---

## Actualizar Información de Colaborador

Endpoint para actualizar la información personal y laboral de un colaborador, buscando por su número de identificación.

## Información General

| Campo     | Valor |
|-----------|-------|
| **Método**      | `PATCH` |
| **Endpoint**    | `/api/v1/companies/{companie_id}/modules/{module_code}/collaborators/{identification_number}/details` |
| **Descripción** | Actualiza parcialmente los datos personales y laborales de un colaborador existente. |

---

## Parámetros de Ruta (Path Params)

| Parámetro                | Tipo     | Requerido | Descripción |
|:--------------------------:|:--------:|-----------|-------------|
| `companie_id`               | `guid`   | Sí        | Identificador único de la compañía. |
| `module_code`               | `string` | Sí        | Código del módulo dentro de la compañía. |
| `identification_number`     | `string` | Sí        | Número de identificación del colaborador a actualizar. |

---

## Headers

| Header          | Valor              | Requerido |
|-----------------|--------------------|-----------|
| `Authorization` | `Bearer {token}`   | Sí        |
| `Content-Type`  | `application/json` | Sí        |

> ℹ️ `UserId`, `CompanyId`, `ModuleCode` e `IdentificationNumber` no se envían en el body: el controller los sobrescribe con los valores de la ruta y del token de autenticación antes de enviar el command.

---

## Request Body

```json
{
  "first_name": "Juan",
  "second_name": "Carlos",
  "third_name": null,
  "first_surname": "Pérez",
  "second_surname": "Gómez",
  "code_collaborator": "COL-0001",

  "personal_information": {
    "personal_email": "juanperez@gmail.com",
    "personal_phone_number": "88887777",
    "address": "Barrio El Progreso, Managua",
    "departament_id": 3,
    "marital_status": 1
  },

  "working_information": {
    "work_phone_number": "22551234",
    "work_email": "juan.perez@empresa.com",
    "inss_number": "1234567",
    "bank_account_number": "1234567890",
    "daem": "DAEM-001",
    "area_id": "5f8d0d55-6c8a-4a2b-9d3f-000000000001",
    "work_position_id": 12,
    "branch_id": 4
  }
}
```

### Descripción de Campos

> ⚠️ No se proveyó un `Validator` (FluentValidation) para este command, así que **no hay confirmación de qué campos son obligatorios** más allá de lo inferido por los tipos (`string?`, `int?`, `Guid?` son nullable → opcionales). Todos los campos abajo se muestran como opcionales (actualización parcial tipo PATCH) hasta que se confirme lo contrario.

#### Nivel raíz

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `first_name` | `string` | No | Primer nombre. |
| `second_name` | `string` | No | Segundo nombre. |
| `third_name` | `string` | No | Tercer nombre. |
| `first_surname` | `string` | No | Primer apellido. |
| `second_surname` | `string` | No | Segundo apellido. |
| `code_collaborator` | `string` | No | Código interno del colaborador. |
| `personal_information` | `object` | No | Información personal a actualizar (ver detalle abajo). |
| `working_information` | `object` | No | Información laboral a actualizar (ver detalle abajo). |

#### `personal_information`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `personal_email` | `string` | No | Correo electrónico personal. |
| `personal_phone_number` | `string` | No | Teléfono personal. |
| `address` | `string` | No | Dirección de residencia. |
| `departament_id` | `integer` | No | Identificador del departamento (catálogo geográfico). |
| `marital_status` | `enum (MaritalStatus)` | No | Estado civil, valor **numérico**. |

#### `working_information`

| Campo | Tipo | Requerido | Descripción |
|---|---|---|---|
| `work_phone_number` | `string` | No | Teléfono de trabajo. |
| `work_email` | `string` | No | Correo electrónico laboral. |
| `inss_number` | `string` | No | Número de afiliación INSS. |
| `bank_account_number` | `string` | No | Número de cuenta bancaria. |
| `daem` | `string` | No | Código DAEM. |
| `area_id` | `guid` | No | Identificador del área (catálogo). ⚠️ Restringido — ver nota abajo. |
| `work_position_id` | `integer` | No | Identificador del cargo (catálogo). ⚠️ Restringido — ver nota abajo. |
| `branch_id` | `integer` | No | Identificador de la sucursal (catálogo). ⚠️ Restringido — ver nota abajo. **Nota de tipo:** aquí es `int?`, mientras que en el registro (`RegisterCollaboratorCommand.WorkingInformation.BranchId`) es `guid`. Confirmar si es una inconsistencia real del código o un catálogo distinto. |

> 🔒 **Campos restringidos por rol**: según el comentario del propio command (`"Solo por parte de administradores y manager pueden aplicar estos"`), `area_id`, `work_position_id` y `branch_id` solo deberían poder modificarse por usuarios con rol de **administrador** o **manager**. No queda claro en este código si la restricción se aplica a nivel de backend (rechazando el cambio) o si es solo una convención de negocio — falta confirmar el comportamiento exacto (¿error 400/403 si un usuario sin permisos los envía, o simplemente se ignoran?).

---

## Respuestas

### ✅ 200 OK

El endpoint responde con `200 OK` sin body (`return Ok();`).

```
HTTP/1.1 200 OK
```

### ❌ 400 Bad Request

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "El colaborador no existe o no pertenece a esta compañía"
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

---

## Códigos de Estado

| Código | Descripción |
|---|---|
| `200` | Colaborador actualizado exitosamente. Sin body. |
| `400` | Colaborador no encontrado o error de validación (`ErrorResponse`). |
| `500` | Error interno del servidor (`ErrorResponse`). |