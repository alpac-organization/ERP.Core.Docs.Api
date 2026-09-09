#!/usr/bin/env node
/**
 * sync-docs.mjs
 * Sincroniza los Markdown de uno o varios directorios `Docs/` del backend hacia el sitio
 * Astro Starlight. Cada archivo `.md` se convierte en una página, inyectando frontmatter
 * `title` (y `module`) si no lo trae. Se omiten los `README*`.
 *
 * - Modo multi-fuente (recomendado): --config=docs.config.json  ("apis": [...])
 *   Cada fuente se copia a src/content/docs/api/<slug>/.
 * - Modo simple (compatibilidad):    --source=<dir> [--dest=...] [--module-base=api]
 *
 * Regla: SOLO se cargan los Markdown que existen. Si en total no hay ninguno, el proceso
 * sale con código distinto de 0 para que el CI NO despliegue nada.
 *
 * Uso:
 *   node scripts/sync-docs.mjs --config=./docs.config.json
 *   node scripts/sync-docs.mjs --source=./backend-docs --dest=./src/content/docs
 *   node scripts/sync-docs.mjs --config=./docs.config.json --check
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const args = process.argv.slice(2);
const getArg = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.slice(`--${name}=`.length) : undefined;
};
const CHECK = args.includes('--check');
const CONFIG = getArg('config');
const SOURCE = path.resolve(ROOT, getArg('source') || './backend-docs');
const DEST = path.resolve(ROOT, getArg('dest') || './src/content/docs');
const MODULE_BASE = (getArg('module-base') || 'api').replace(/^\/+|\/+$/g, '');

/** Kebab-case a partir de un nombre (p. ej. "RegisterCollaboratorDocs" -> "register-collaborator"). */
function kebab(value) {
  return String(value)
    .replace(/Docs$/i, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .replace(/[^a-z0-9-]/gi, '')
    .toLowerCase()
    .replace(/^-+|-+$/g, '');
}

function slugify(value) {
  return (
    value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'doc'
  );
}

function isEndpointDoc(name) {
  return /\.md$/i.test(name) && !/^readme/i.test(name);
}

function extractHeading(md, level) {
  const re = new RegExp(`^#{${level}}\\s+(.+)$`, 'm');
  const m = md.match(re);
  return m ? m[1].trim() : undefined;
}

function existingTitle(md) {
  const m = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!m) return undefined;
  const t = m[1].match(/^title:\s*(.+)$/m);
  return t ? t[1].trim().replace(/^['"]|['"]$/g, '') : undefined;
}

function buildContent(fileName, relDir, content) {
  const title =
    existingTitle(content) ||
    extractHeading(content, 2) ||
    extractHeading(content, 1) ||
    fileName.replace(/\.md$/i, '');
  const module = relDir.split(path.sep).filter(Boolean).slice(-1)[0] || 'API';

  let fm = '';
  if (!existingTitle(content)) {
    fm = `---\ntitle: "${title.replace(/"/g, '\\"')}"\nmodule: "${module}"\n---\n\n`;
  }
  return fm + content;
}

async function listMd(dir) {
  const out = [];
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listMd(full)));
    else if (entry.isFile() && isEndpointDoc(entry.name)) out.push(full);
  }
  return out;
}

/** Sincroniza un directorio fuente hacia src/content/docs/api/<slug>/ */
async function syncSource(srcDir, slug) {
  const files = await listMd(srcDir);
  let copied = 0;
  for (const file of files) {
    const rel = path.relative(srcDir, file);
    const parsed = path.parse(rel);
    const relDir = parsed.dir;
    const slugName = kebab(parsed.name) || slugify(parsed.name);
    const raw = await fs.readFile(file, 'utf8');
    const content = buildContent(parsed.name, relDir, raw);

    const destDir = path.join(DEST, MODULE_BASE, slug, ...relDir.split(/[\\/]+/).map((d) => kebab(d)));
    const destFile = path.join(destDir, `${slugName}.md`);
    await fs.mkdir(destDir, { recursive: true });
    await fs.writeFile(destFile, content, 'utf8');
    copied++;
  }
  return copied;
}

async function loadConfig() {
  const raw = await fs.readFile(path.resolve(ROOT, CONFIG), 'utf8');
  return JSON.parse(raw).apis || [];
}

async function cleanApiSlug(slug) {
  const dir = path.join(DEST, MODULE_BASE, slug);
  await fs.rm(dir, { recursive: true, force: true }).catch(() => {});
}

async function main() {
  let total = 0;

  if (CONFIG) {
    const apis = await loadConfig();
    for (const api of apis) {
      const srcDir = path.join(ROOT, 'backend-docs', api.slug);
      // limpiar la carpeta destino de esta API para reflejar exactamente lo existente
      await cleanApiSlug(api.slug);
      const n = await syncSource(srcDir, api.slug);
      total += n;
      console.log(`   [${api.slug}] ${n} documento(s)`);
    }
  } else {
    await syncSource(SOURCE, 'api');
    total = (await listMd(SOURCE)).length;
  }

  if (total === 0) {
    console.error(`❌ No se encontró ningún Markdown que sincronizar. Nada que publicar.`);
    process.exit(2);
  }

  console.log(`✅ Sincronizados ${total} documento(s) en ${path.relative(ROOT, DEST)}`);

  if (CHECK) {
    const { execSync } = await import('node:child_process');
    try {
      execSync('git diff --quiet -- src/content/docs', { stdio: 'pipe', cwd: ROOT });
      console.log('✅ La documentación está actualizada.');
    } catch {
      console.error('❌ La documentación está desactualizada. Ejecuta "npm run docs:sync".');
      process.exit(1);
    }
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
