# ERP API Docs

Documentación de la API del **ERP Grupo Vassalli** construida con **Astro + Starlight**.

La documentación se **genera automáticamente** desde el OpenAPI Spec del backend
`ERP.Core.Manager.Api`. No hay que escribir la documentación a mano: se escribe **una vez**
en el código (comentarios XML `///`) y se refleja aquí y en Swagger.

## Flujo

```
Backend controllers (/// XML)
       │ Swashbuckle
       ▼
 OpenAPI Spec  /swagger/v1/swagger.json
       │ scripts/generate-api-docs.mjs
       ▼
 src/content/docs/api/modules/*.md
       │ Astro Starlight
       ▼
 Sitio estático (GitHub Pages)
```

## Comandos

```bash
npm install
npm run dev                 # servidor de desarrollo en localhost:4321
npm run generate:docs       # regenera el Markdown desde ./swagger.local.json
npm run build               # build de producción en dist/
npm run preview             # previsualizar el build
```

### Generar documentación con un spec concreto

```bash
# Opción 1: descargar el spec real del backend
curl -s http://localhost:5038/swagger/v1/swagger.json -o swagger.local.json
npm run generate:docs -- --spec=./swagger.local.json

# Opción 2: desde una URL remota (CI)
npm run generate:docs -- --spec-url=https://.../swagger/v1/swagger.json

# Opción 3: verificar si la doc está actualizada (falla si no)
npm run generate:docs:check
```

## Cómo documentar un endpoint

1. Habilitar `<GenerateDocumentationFile>` en el `.csproj` del backend.
2. Enlazar los comentarios con `IncludeXmlComments` en `Program.cs`.
3. Escribir comentarios XML `/// <summary>` + `<param>` + `<response>` sobre cada action.

Ver la guía completa en [`/guides/add-documentation`](/guides/add-documentation).

## Despliegue

El workflow `.github/workflows/publish.yml` escucha el evento `repository_dispatch` (`api-released`)
que dispara el backend en cada release, descarga el spec, regenera el Markdown y despliega en
**GitHub Pages**.

Detalles en [`/guides/ci-workflow`](/guides/ci-workflow).

## Estructura

```
erp-api-docs/
├── astro.config.mjs
├── src/
│   ├── content.config.ts            # schema de la colección de docs
│   └── content/docs/
│       ├── index.mdx                # landing
│       ├── api/overview.mdx         # contrato, base URL, auth, convenciones
│       ├── api/modules/*.md         # GENERADO por el script
│       └── guides/*.mdx             # guías de autoría y CI
├── scripts/generate-api-docs.mjs    # generador OpenAPI => Markdown
├── swagger.sample.json              # ejemplo de spec para probar
└── .github/workflows/publish.yml
```
