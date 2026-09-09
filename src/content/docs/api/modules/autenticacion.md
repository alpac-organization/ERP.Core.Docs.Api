---
title: Autenticación
module: Autenticación
description: Endpoints del módulo Autenticación
sidebar:
  label: Autenticación
  order: 10
---


### `POST` `/api/v1/companies/{companie_id}/auth/login`

Inicia sesión con usuario o correo y contraseña.

Valida las credenciales, verifica el perfil del usuario en la compañía y devuelve los tokens de acceso y refresco junto con la información de la compañía.


### Parámetros

| Nombre | Ubicación | Tipo | Obligatorio | Descripción |
| --- | --- | --- | --- | --- |
| `companie_id` | PATH | string(uuid) | **sí** | Identificador único de la compañía (GUID). |


### Body de petición

Schema: `LoginWithUsernameAndPasswordCommand` (obligatorio)

```json
{
  "//": "cuerpo según el schema LoginWithUsernameAndPasswordCommand"
}
```


### Respuestas

| Código | Schema | Descripción |
| --- | --- | --- |
| **200** | LoginDto | Autenticación exitosa. |
| **400** | ErrorResponse | Credenciales inválidas o usuario sin perfil. |
| **404** | ErrorResponse | Usuario no encontrado. |


