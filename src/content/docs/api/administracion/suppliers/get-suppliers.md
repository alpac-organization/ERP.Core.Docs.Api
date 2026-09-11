---
title: "Listar Proveedores"
module: "Suppliers"
---

## Listar Proveedores

Endpoint para listar con paginación y filtros los proveedores registrados dentro de una compañía y módulo.

| Campo | Valor |
|---|---|
| **Método** | `GET` |
| **Endpoint** | `/api/v1/companies/{companie_id}/modules/{module_code}/suppliers` |
| **Descripción** | Retorna un listado paginado de proveedores asociados a la compañía y módulo, con filtros opcionales de búsqueda. |

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

---

## Query Params

| Parámetro | Tipo | Requerido | Default | Descripción |
|---|---|:---:|:---:|---|
| `commercial_name` | `string` | No | `null` | Filtra por coincidencia parcial en el nombre comercial. |
| `identification_number` | `string` | No | `null` | Filtra por número de identificación exacto (RUC, Cédula). |
| `constitution_type` | `enum (ConstitutionType)` | No | `null` | Filtra por tipo de persona: `Natural`, `Legal`. |
| `page_size` | `integer` | No | `10` | Cantidad de registros por página. |
| `page_number` | `integer` | No | `1` | Número de página a consultar. |

---

## Respuestas

### ✅ 200 OK

Retorna un objeto `PagedResponse<SupplierDto>`:

```json
{
  "data": [
    {
      "supplier_id": "9b3c4371-a0a4-4f4c-bc6a-c21f925b4101",
      "supplier_legal_name": "Comercial del Valle S.A.",
      "commercial_name": "Comercial Valle",
      "identification_type": "Ruc",
      "identification_number": "0010909260001A",
      "constitution_type": "Legal",
      "user_information": {
        "user_id": "11111111-0000-0000-0000-000000000001",
        "email": "juan.perez@alpac.com",
        "user_fullname": "Juan Pérez",
        "area_information": {
          "area_id": "11111111-0000-0000-0000-000000000001",
          "work_area_name": "Tecnología de la Información",
          "area_code": 10
        }
      }
    }
  ],
  "page_number": 1,
  "page_size": 10,
  "total": 1
}
```

### ❌ 400 Bad Request

Usa la entidad `ErrorResponse` (`ERP.Core.Domain.Entities.Errors`):

```json
{
  "status": 400,
  "error": {
    "type_error": "ValidationError",
    "description": "No tienes acceso a este módulo"
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

## Catálogos de Enums Utilizados

### `ConstitutionType`
| Valor | Nombre | Descripción |
|:---:|---|---|
| `1` | `Natural` | Persona Natural |
| `2` | `Legal` | Persona Jurídica |

### `IdentificationType`
| Valor | Nombre | Descripción |
|:---:|---|---|
| `1` | `Cedula` | Cédula de Identidad |
| `2` | `Pasaporte` | Pasaporte |
| `3` | `CedulaResidencia` | Cédula de Residencia |
| `4` | `Ruc` | Registro Único del Contribuyente (RUC) |
