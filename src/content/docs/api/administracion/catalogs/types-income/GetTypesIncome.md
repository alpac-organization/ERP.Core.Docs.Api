---
title: "Listar Tipos de Ingreso"
module: "types-income"
---


Endpoint para listar los tipos de ingreso activos disponibles en el sistema.

> 🔗 Este catálogo es **requerido al registrar un colaborador**: su endpoint permite definir el `type_income_id` de cada viático (`travel_expenses[]`) que se le asigna. Ver [Registrar Colaborador](../../../collaborators/register-collaborator.md).

| Campo     | Valor |
|-----------|-------|
| **Método**      | `GET` |
| **Endpoint**    | `/api/v1/companies/{companie_id}/types-income` |
| **Descripción** | Retorna el listado de tipos de ingreso activos. Se usa para definir el tipo de ingreso al momento de asignar un viático a un colaborador. |

---

## Parámetros de Ruta (Path Params)

| Parámetro      | Tipo     | Requerido | Descripción |
|:--------------:|:--------:|-----------|-------------|
| `companie_id`  | `guid`   | Sí        | Identificador único de la compañía. |

---

## Headers

| Header          | Valor              | Requerido |
|-----------------|--------------------|-----------|
| `x-api-key`     | `{api_key}`        | Sí        |
| `Authorization` | `Bearer {token}`   | No        |

> ℹ️ El controlador `TypesIncomeController` **no** está decorado con `[HasToken]`, por lo que este endpoint no exige token de autenticación (a diferencia de WorkAreas/JobPositions/CostCenters). La API Key (`x-api-key`) sí es validada de forma global por `ApiKeyMiddleware`.

---

## Query Params

> Este endpoint no recibe query params ni paginación; `GetTypesIncomeAvailableQuery` solo hereda `CompanyId`, `ModuleCode` y `UserId` de `BaseRequest`.

---

## Respuestas

### ✅ 200 OK

Retorna un `List<TypesIncomeDto>`.

```json
[
  {
    "type_income_id": "3fa85f64-5717-4562-b3fc-2c963f66afb0",
    "income_title": "Viático de alimentación",
    "income_description": "Pago de alimentación por viaje.",
    "income_code": "ALW_MEAL"
  },
  {
    "type_income_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "income_title": "Viático de transporte",
    "income_description": "Pago de transporte por viaje.",
    "income_code": "ALW_TRANSPORT"
  }
]
```

### Descripción de Campos

| Campo                | Tipo             | Descripción |
|----------------------|------------------|-------------|
| `type_income_id`     | `guid`           | Identificador del tipo de ingreso. Es el valor que se envía en `travel_expenses[].type_income_id` al registrar un colaborador. |
| `income_title`       | `string \| null` | Nombre o título del tipo de ingreso. |
| `income_description` | `string \| null` | Descripción del tipo de ingreso. |
| `income_code`        | `string \| null` | Código del tipo de ingreso (ej. `ALW_MEAL`, `ALW_TRANSPORT`, `ALW_HOUSING`). |

### ❌ 400 Bad Request

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "El id de la empresa es requerido"
  },
  "created_at": "2026-09-11 10:00:00"
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
  "created_at": "2026-09-11 10:00:00"
}
```

---

## Reglas de Validación

- `companie_id` es requerido (no vacío).

---

## Códigos de Estado

| Código | Descripción |
|---|---|
| `200` | Listado de tipos de ingreso obtenido exitosamente. |
| `400` | Error de validación (`ErrorResponse`). |
| `500` | Error interno del servidor (`ErrorResponse`). |
