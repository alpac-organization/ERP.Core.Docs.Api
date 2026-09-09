---
title: Deducciones
module: Deducciones
description: Endpoints del módulo Deducciones
sidebar:
  label: Deducciones
  order: 10
---


### `GET` `/api/v1/companies/{companie_id}/modules/{module_code}/deductions`

Obtiene las deducciones registradas.



### Parámetros

| Nombre | Ubicación | Tipo | Obligatorio | Descripción |
| --- | --- | --- | --- | --- |
| `companie_id` | PATH | string(uuid) | **sí** | Identificador único de la compañía. |
| `module_code` | PATH | string | **sí** | Código del módulo. |
| `type` | QUERY | string | no | Tipo de deducción (e.g. DeductionType). |
| `status` | QUERY | string | no | Estado de la deducción (DeductionStatus). |
| `page_number` | QUERY | integer | no | Número de página. |
| `page_size` | QUERY | integer | no | Tamaño de página. |



### Respuestas

| Código | Schema | Descripción |
| --- | --- | --- |
| **200** | PagedResponseDeduction | Lista paginada de deducciones. |
| **400** | ErrorResponse | Solicitud inválida. |


### `POST` `/api/v1/companies/{companie_id}/modules/{module_code}/deductions`

Registra una nueva deducción aplicada a un colaborador.

Valida el acceso del usuario al módulo y crea la deducción en el proceso de nómina activo.


### Parámetros

| Nombre | Ubicación | Tipo | Obligatorio | Descripción |
| --- | --- | --- | --- | --- |
| `companie_id` | PATH | string(uuid) | **sí** | Identificador único de la compañía. |
| `module_code` | PATH | string | **sí** | Código del módulo donde se registra la deducción. |


### Body de petición

Schema: `RegisterDeductionCommand` (obligatorio)

```json
{
  "//": "cuerpo según el schema RegisterDeductionCommand"
}
```


### Respuestas

| Código | Schema | Descripción |
| --- | --- | --- |
| **201** | — | Deducción creada correctamente. |
| **400** | ErrorResponse | Solicitud inválida o deducción no permitida. |
| **500** | ErrorResponse | Error interno del servidor. |


