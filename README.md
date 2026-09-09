# ERP API Docs

Sitio de documentación de la API del **ERP Grupo Vassalli** construido con **Astro + Starlight**,
publicado en **GitHub Pages**.

La fuente de la documentación es el directorio **`Docs`** del backend `ERP.Core.Manager.Api`:

```
Back-End/ERP.Core.Manager.Api/src/ERP.Core.Manager.Api/Docs/
└── <Módulo>/<Endpoint>Docs.md        # un .md por endpoint
```

El pipeline descarga **solo los `.md` que existen**, los sincroniza al sitio y lo publica.
Si no hay ningún Markdown, **no despliega nada**.

## Flujo

```
ERP.Core.Manager.Api (Docs/**/*.md)
        │  release → repository_dispatch
        ▼
erp-api-docs
  fetch-backend-docs.mjs  (descarga solo .md)  → ./backend-docs
  sync-docs.mjs           (inyecta title/module) → src/content/docs/api/**
  astro build                                     → dist/
  deploy-pages                                    → GitHub Pages
```

## Comandos

```bash
npm install
npm run dev                 # servidor de desarrollo (localhost:4321)

# Sincronizar desde el directorio Docs del backend (local)
node scripts/sync-docs.mjs --source="..\Back-End\ERP.Core.Manager.Api\src\ERP.Core.Manager.Api\Docs"

# Verificar que la documentación está al día (para CI)
npm run docs:sync:check

# Descargar Docs desde GitHub (CI)
node scripts/fetch-backend-docs.mjs --repo=alpac-organization/ERP.Core.Manager.Api \
  --path=src/ERP.Core.Manager.Api/Docs --ref=develop --token=$GITHUB_TOKEN

npm run build               # build de producción en dist/
npm run preview             # previsualizar el build
```

## Cómo documentar un endpoint

Crea un archivo `.md` en `Docs/<Módulo>/<Endpoint>Docs.md` dentro del repo del backend.
No requiere frontmatter (el título se deduce de la cabecera). Solo se publica si el archivo existe.

Ver [`/guides/add-documentation`](/guides/add-documentation).

## Despliegue

El workflow `.github/workflows/publish.yml` escucha el evento `repository_dispatch` (`api-released`)
del backend, descarga el directorio `Docs`, sincroniza y publica en **GitHub Pages**.

Configuración requerida en el repo:

| Nombre | Tipo | Uso |
|---|---|---|
| `BACKEND_REPO` | Variable | `alpac-organization/ERP.Core.Manager.Api` |
| `BACKEND_DOCS_PATH` | Variable | `src/ERP.Core.Manager.Api/Docs` |
| `BACKEND_REF` | Variable | `develop` |
| `BACKEND_READ_TOKEN` | Secret | Token de lectura del repo del backend |

Detalles en [`/guides/ci-workflow`](/guides/ci-workflow).

## Estructura

```
erp-api-docs/
├── astro.config.mjs               # Starlight, sidebar por directorio
├── src/
│   ├── content.config.ts          # docsSchema + campo extra 'module'
│   └── content/docs/
│       ├── index.mdx              # landing
│       ├── api/overview.mdx       # contrato, base URL, auth, convenciones
│       ├── api/**/*.md            # SINCRONIZADO desde Docs del backend (autogenerado)
│       └── guides/*.mdx           # guías de autoría y CI
├── scripts/
│   ├── fetch-backend-docs.mjs     # descarga Docs/**/*.md desde GitHub
│   └── sync-docs.mjs              # copia .md → src/content/docs/api/**
└── .github/workflows/publish.yml  # repo_dispatch → sync → build → GitHub Pages
```
