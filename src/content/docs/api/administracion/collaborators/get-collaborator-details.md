---
title: "Obtener Detalle de Colaborador"
module: "Collaborators"
---

Endpoint para obtener el detalle completo de un colaborador específico, buscando por su número de identificación.

| Campo     | Valor |
|-----------|-------|
| **Método**      | `GET` |
| **Endpoint**    | `/api/v1/companies/{companie_id}/modules/{module_code}/collaborators/{identification_number}/details` |
| **Descripción** | Retorna la información detallada de un colaborador: datos personales, laborales, salariales, centros de costo y vacaciones disponibles. |

---

## Parámetros de Ruta (Path Params)

| Parámetro                | Tipo     | Requerido | Descripción |
|:--------------------------:|:--------:|-----------|-------------|
| `companie_id`               | `guid`   | Sí        | Identificador único de la compañía. |
| `module_code`               | `string` | Sí        | Código del módulo dentro de la compañía. |
| `identification_number`     | `string` | Sí        | Número de identificación del colaborador a consultar. |

---

## Headers

| Header          | Valor              | Requerido |
|-----------------|--------------------|-----------|
| `Authorization` | `Bearer {token}`   | Sí        |

---

## Respuestas

### ✅ 200 OK

Retorna un `CollaboratorDetailsDto`.

```json
{
  "collaborator_id": "e6ee56aa-185d-42fe-9deb-e83aedacfed7",
  "collaborator_code": "VXX-H38W",
  "full_name": "Angel Abraham Lopez Delgado",
  "work_position": "Desarrollador",
  "status": "Active",
  "profile_picture_url": null,

  "cost_centers": [
    {
      "area_id": "f006b2d8-af3f-4c8b-b59c-a08b677b66ca",
      "cost_center_id": "8d8c47fd-337c-41b7-8156-eac944027ff7",
      "descripcion": null,
      "cost_center_name": "GERENCIA DE INFORMATICA"
    }
  ],

  "personal_information": {
    "gender": "Man",
    "identification_number": "0012103011052V",
    "address": null,
    "personal_email": null,
    "personal_phone_number": null,
    "departament": null,
    "marital_status": "Single",
    "birthdate": "2001-03-21T06:00:00Z"
  },

  "working_information": {
    "inss_number": "44487722",
    "work_phone_number": null,
    "work_email": "",
    "bank_account_number": "373733476",
    "bank_name": null,
    "work_area": "INFORMÁTICA",
    "work_position": "Desarrollador",
    "branch_name": "Almacenadora del Pacífico S.A.",
    "entry_date": "2026-03-05"
  },

  "salary_information": {
    "salary": 32961.87,
    "currency": "NIO",
    "salary_type": "Fixed"
  },

  "vacation_information": {
    "available_vacations": 3.42
  }
}
```

### Descripción de Campos

#### Nivel raíz

| Campo | Tipo | Descripción |
|---|---|---|
| `collaborator_id` | `guid` | Identificador único del colaborador. |
| `collaborator_code` | `string` | Código interno del colaborador. |
| `full_name` | `string` | Nombre completo del colaborador. |
| `work_position` | `string` | Cargo del colaborador (texto ya resuelto, no id de catálogo). |
| `status` | `string` | Estado del colaborador, como **texto** del enum `CollaboratorStatus` (ej. `"Active"`). |
| `profile_picture_url` | `string \| null` | URL de la foto de perfil. Puede venir `null`. |
| `cost_centers` | `array (CostCenterDto)` | Centros de costo asociados al colaborador. |
| `personal_information` | `object` | Información personal (ver detalle abajo). |
| `working_information` | `object` | Información laboral (ver detalle abajo). |
| `salary_information` | `object` | Información salarial (ver detalle abajo). |
| `vacation_information` | `object` | Información de vacaciones (ver detalle abajo). |

#### `cost_centers[]`

| Campo | Tipo | Descripción |
|---|---|---|
| `area_id` | `guid` | Identificador del área asociada al centro de costo. |
| `cost_center_id` | `guid` | Identificador único del centro de costo. |
| `descripcion` | `string \| null` | Descripción del centro de costo. Puede venir `null`. |
| `cost_center_name` | `string` | Nombre del centro de costo. |

#### `personal_information`

| Campo | Tipo | Descripción |
|---|---|---|
| `gender` | `string` | Género del colaborador, como **texto** del enum `GenderType` (ej. `"Man"`, `"Women"`). |
| `identification_number` | `string` | Número de identificación. |
| `address` | `string \| null` | Dirección de residencia. |
| `personal_email` | `string \| null` | Correo electrónico personal. |
| `personal_phone_number` | `string \| null` | Teléfono personal. |
| `departament` | `string \| null` | Nombre del departamento (texto ya resuelto, no id). |
| `marital_status` | `string` | Estado civil, como **texto** del enum `MaritalStatus` (ej. `"Single"`). |
| `birthdate` | `datetime (ISO 8601)` | Fecha de nacimiento, en UTC (sufijo `Z`). |

#### `working_information`

| Campo | Tipo | Descripción |
|---|---|---|
| `inss_number` | `string \| null` | Número de afiliación INSS. |
| `work_phone_number` | `string \| null` | Teléfono de trabajo. |
| `work_email` | `string` | Correo electrónico laboral. Puede venir como `""` (string vacío) en vez de `null`. |
| `bank_account_number` | `string \| null` | Número de cuenta bancaria. |
| `bank_name` | `string \| null` | Nombre del banco (texto ya resuelto, no id de catálogo). |
| `work_area` | `string` | Nombre del área de trabajo (texto ya resuelto, no id). |
| `work_position` | `string` | Nombre del cargo (texto ya resuelto, no id). Duplica el `work_position` de nivel raíz. |
| `branch_name` | `string` | Nombre de la sucursal (texto ya resuelto, no id). |
| `entry_date` | `date (YYYY-MM-DD)` | Fecha de ingreso. |

#### `salary_information`

| Campo | Tipo | Descripción |
|---|---|---|
| `salary` | `decimal` | Monto del salario. |
| `currency` | `string` | Moneda, como **texto** del enum `Currency` (ej. `"NIO"`, `"USD"`). |
| `salary_type` | `string` | Tipo de salario, como **texto** del enum `SalaryType` (ej. `"Fixed"`). |

#### `vacation_information`

| Campo | Tipo | Descripción |
|---|---|---|
| `available_vacations` | `decimal` | Días de vacaciones disponibles. |

> ℹ️ A diferencia del **registro** de colaborador (donde `gender`, `identification_type`, `currency`, `salary_type`, `marital_status` se envían como el **valor numérico** del enum), en este endpoint de **detalle** todos los enums (`status`, `gender`, `marital_status`, `currency`, `salary_type`) vienen ya resueltos como **texto** (el nombre del enum). Ten esto en cuenta al consumir la respuesta.

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
| `200` | Detalle del colaborador obtenido exitosamente. |
| `400` | Colaborador no encontrado o error de validación (`ErrorResponse`). |
| `500` | Error interno del servidor (`ErrorResponse`). |