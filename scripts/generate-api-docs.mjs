#!/usr/bin/env node
/**
 * generate-api-docs.mjs
 * Genera la documentación (Markdown) del sitio Astro Starlight a partir del
 * OpenAPI Spec del backend ERP.Core.Manager.Api.
 *
 * Uso:
 *   node scripts/generate-api-docs.mjs                    # usa ./swagger.json
 *   node scripts/generate-api-docs.mjs --spec=spec.json   # archivo concreto
 *   node scripts/generate-api-docs.mjs --spec-url=https://.../swagger/v1/swagger.json
 *   node scripts/generate-api-docs.mjs --check            # solo verifica (exit 1 si hay cambios)
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'src', 'content', 'docs', 'api', 'modules');

const args = process.argv.slice(2);
const getArg = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(`--${name}=`.length) : undefined;
};
const CHECK = args.includes('--check');

/** Normaliza un tag ("Deducciones") a un slug de archivo ("deducciones"). */
function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'modulo';
}

/** Sanea texto de cualquier carácter que rompa frontmatter (ej. `:`). */
function frontmatterSafe(value) {
  return String(value ?? '').replace(/:/g, '\\:').trim();
}

/** Clasifica un parámetro por ubicación. */
function paramLocation(param) {
  const label = (param.in ?? '').toUpperCase();
  return label === 'QUERY' || label === 'PATH' || label === 'HEADER' || label === 'COOKIE'
    ? label
    : 'QUERY';
}

/** Convierte una referencia $ref a un texto legible. */
function resolveRef(ref) {
  return ref ? ref.replace('#/components/schemas/', '') : '';
}

/** Describe un esquema de forma compacta. */
function describeSchema(schema) {
  if (!schema) return '';
  if (schema.$ref) return resolveRef(schema.$ref);
  if (schema.type === 'array' && schema.items) return `${describeSchema(schema.items)}[]`;
  if (schema.type === 'object') return 'object';
  if (schema.type === 'string') return schema.format ? `string(${schema.format})` : 'string';
  if (schema.type === 'integer') return 'integer';
  if (schema.type === 'number') return 'number';
  if (schema.type === 'boolean') return 'boolean';
  if (schema.enum) return schema.enum.join(' | ');
  return schema.type || 'any';
}

/** Devuelve el summary/description con fallback a la operationId. */
function endpointSummary(operation) {
  return operation.summary || operation.description || operation.operationId || '';
}

/** Genera el contenido Markdown de un bloque de parámetros. */
function paramsSection(parameters) {
  const list = (parameters ?? []).filter((p) => ['path', 'query', 'header'].includes(p.in));
  if (list.length === 0) return '';

  const rows = list
    .map((p) => {
      const required = p.required ? '**sí**' : 'no';
      const type = describeSchema(p.schema);
      const desc = (p.description ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
      return `| \`${p.name}\` | ${paramLocation(p)} | ${type} | ${required} | ${desc} |`;
    })
    .join('\n');

  return `
### Parámetros

| Nombre | Ubicación | Tipo | Obligatorio | Descripción |
| --- | --- | --- | --- | --- |
${rows}
`;
}

/** Genera el bloque de body de petición. */
function bodySection(operation) {
  const body = operation.requestBody;
  if (!body) return '';
  const content = body.content?.['application/json'] ?? body.content?.['application/*+json'];
  if (!content) return '';

  const name = describeSchema(content.schema);
  const required = body.required ? ' (obligatorio)' : '';
  return `
### Body de petición

Schema: \`${name}\`${required}

\`\`\`json
{
  "//": "cuerpo según el schema ${name}"
}
\`\`\`
`;
}

/** Genera el bloque de respuestas. */
function responsesSection(operation) {
  const responses = operation.responses ?? {};
  if (Object.keys(responses).length === 0) return '';

  const rows = Object.entries(responses)
    .map(([code, resp]) => {
      const name = resp.content?.['application/json']
        ? resolveRef(resp.content['application/json'].schema?.$ref) ||
          describeSchema(resp.content['application/json'].schema)
        : '';
      const desc = (resp.description ?? '').replace(/\|/g, '\\|').replace(/\n/g, ' ');
      return `| **${code}** | ${name || '—'} | ${desc} |`;
    })
    .join('\n');

  return `
### Respuestas

| Código | Schema | Descripción |
| --- | --- | --- |
${rows}
`;
}

/** Genera el documento Markdown completo para un endpoint. */
function renderEndpoint(operation, tag, httpMethod, pathTemplate) {
  const summary = endpointSummary(operation);
  const description = operation.description && operation.description !== summary
    ? operation.description
    : '';
  const body = description ? `\n${description}\n` : '\n';

  return `
### \`${httpMethod.toUpperCase()}\` \`${pathTemplate}\`

${summary}
${body}
${paramsSection(operation.parameters)}
${bodySection(operation)}
${responsesSection(operation)}
`;
}

/**
 * Agrupa todos los endpoints por su primer tag y genera un .md por módulo.
 * Devuelve un mapa { slug: { title, description, md } }.
 */
function groupByTag(spec) {
  const groups = new Map();

  for (const [pathTemplate, pathItem] of Object.entries(spec.paths ?? {})) {
    for (const method of ['get', 'post', 'put', 'patch', 'delete']) {
      const operation = pathItem[method];
      if (!operation) continue;

      const tags = operation.tags && operation.tags.length ? operation.tags : ['General'];
      const tag = tags[0];

      if (!groups.has(tag)) {
        groups.set(tag, { title: tag, description: '', endpoints: [] });
      }
      groups.get(tag).endpoints.push({ operation, method, pathTemplate });
    }
  }

  return groups;
}

/** Escribe todos los módulos y devuelve la lista de rutas escritas. */
async function writeModules(spec) {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const groups = groupByTag(spec);
  const written = [];

  for (const [tag, group] of groups) {
    group.endpoints.sort((a, b) => a.operation.operationId?.localeCompare(b.operation.operationId ?? '') || 0);

    const globalDesc = spec.tags?.find((t) => t.name === tag)?.description ?? '';
    const slug = slugify(tag);
    const filePath = path.join(OUTPUT_DIR, `${slug}.md`);

    const section = group.endpoints
      .map(({ operation, method, pathTemplate }) =>
        renderEndpoint(operation, tag, method, pathTemplate)
      )
      .join('');

    const fallbackDesc = 'Endpoints del módulo ' + tag;
    const desc = frontmatterSafe(globalDesc || fallbackDesc);
    const md = `---
title: ${frontmatterSafe(tag)}
module: ${frontmatterSafe(tag)}
description: ${desc}
sidebar:
  label: ${frontmatterSafe(tag)}
  order: 10
---

${globalDesc ? `> ${globalDesc}\n` : ''}${section}
`;

    await fs.writeFile(filePath, md, 'utf8');
    written.push(filePath);
  }

  return written;
}

/** Carga el spec desde archivo o URL. */
async function loadSpec() {
  const specArg = getArg('spec');
  const url = getArg('spec-url');
  let specPath = specArg || './swagger.json';

  if (url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`No se pudo descargar el spec (${url}): ${res.status}`);
    return res.json();
  }

  // Si usamos un spec local indicado con --spec=...
  const candidate = specArg ? specArg : './swagger.local.json';
  const exists = await fs.access(path.resolve(ROOT, candidate)).then(() => true).catch(() => false);
  if (exists) specPath = candidate;

  try {
    const raw = await fs.readFile(path.resolve(ROOT, specPath), 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(
      `No se encontró el spec en "${specPath}". ` +
        `Descárgalo con "curl -s http://localhost:5038/swagger/v1/swagger.json -o swagger.json".\n${err.message}`
    );
  }
}

async function main() {
  const spec = await loadSpec();

  // Ruta de la operación a incluir en el sidebar para "Módulos"
  const written = await writeModules(spec);

  const outFiles = written.map((f) => path.relative(ROOT, f));

  if (CHECK) {
    // Verificar que git no detecte cambios tras regenerar.
    try {
      const { execSync } = await import('node:child_process');
      execSync('git diff --quiet -- src/content/docs/api/modules', { stdio: 'pipe', cwd: ROOT });
      console.log('✅ La documentación está actualizada.');
    } catch {
      console.error('❌ La documentación generada está desactualizada. Ejecuta "pnpm generate:docs".');
      process.exit(1);
    }
  } else {
    console.log(`✅ Generados ${written.length} archivo(s) de documentación:`);
    outFiles.forEach((f) => console.log(`   - ${f}`));
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
