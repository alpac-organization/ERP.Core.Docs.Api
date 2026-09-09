#!/usr/bin/env node
/**
 * sync-docs.mjs
 * Sincroniza los Markdown del directorio `Docs/` del backend (ERP.Core.Manager.Api)
 * hacia el sitio Astro Starlight.
 *
 * Cada `.md` dentro de `Docs/` se convierte en una página. Se copia tal cual su
 * contenido, inyectando frontmatter `title` (y `module`) si el archivo no lo trae,
 * de modo que Starlight pueda renderizarlo.
 *
 * Regla importante: SOLO se cargan los Markdown que existen. Si el origen no tiene
 * ningún `.md`, el script termina con código de salida distinto de 0 para que el CI
 * NO despliegue nada.
 *
 * Uso:
 *   node scripts/sync-docs.mjs --source=./backend-docs [--dest=./src/content/docs] [--module-base=api]
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

/** Contenido de la primera cabecera de nivel indicado. */
function extractHeading(md, level) {
  const re = new RegExp(`^#{${level}}\\s+(.+)$`, 'm');
  const m = md.match(re);
  return m ? m[1].trim() : undefined;
}

/** Lee el frontmatter de un .md (si existe). */
function existingTitle(md) {
  const m = md.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
  if (!m) return undefined;
  const t = m[1].match(/^title:\s*(.+)$/m);
  return t ? t[1].trim().replace(/^['"]|['"]$/g, '') : undefined;
}

/** Compone el frontmatter a inyectar si el .md no tiene título. */
function buildFrontmatter(fileName, relDir, content) {
  const title =
    existingTitle(content) ||
    extractHeading(content, 2) ||
    extractHeading(content, 1) ||
    fileName.replace(/\.md$/i, '');
  const module = relDir.split(path.sep).filter(Boolean).slice(-1)[0] || MODULE_BASE;

  let fm = '';
  if (!existingTitle(content)) {
    fm = `---\ntitle: "${title.replace(/"/g, '\\"')}"\nmodule: "${module}"\n---\n\n`;
  }
  return fm + content;
}

/** Recursivamente lista los .md de un directorio. */
async function listMd(dir, base = dir) {
  const out = [];
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await listMd(full, base)));
    else if (entry.isFile() && /\.md$/i.test(entry.name)) out.push(full);
  }
  return out;
}

async function main() {
  const files = await listMd(SOURCE);
  if (files.length === 0) {
    console.error(
      `❌ No se encontró ningún Markdown en "${SOURCE}". Nada que publicar.`
    );
    process.exit(2);
  }

  let copied = 0;
  for (const file of files) {
    const rel = path.relative(SOURCE, file); // p. ej. "Collaborators\RegisterCollaboratorDocs.md"
    const parsed = path.parse(rel);
    const relDir = parsed.dir;
    const slug = kebab(parsed.name) || slugify(parsed.name);
    const raw = await fs.readFile(file, 'utf8');
    const content = buildFrontmatter(parsed.name, relDir, raw);

    const destDir = path.join(DEST, MODULE_BASE, ...relDir.split(/[\\/]+/).map((d) => kebab(d)));
    const destFile = path.join(destDir, `${slug}.md`);

    await fs.mkdir(destDir, { recursive: true });
    await fs.writeFile(destFile, content, 'utf8');
    copied++;
    console.log(`   ${path.relative(ROOT, file)} -> ${path.relative(ROOT, destFile)}`);
  }

  console.log(`✅ Sincronizados ${copied} documento(s) de documentación en ${path.relative(ROOT, DEST)}`);

  if (CHECK) {
    // Verifica que git no detecte cambios tras regenerar (docs desactualizadas = fallo de CI).
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

/** Fallback de slug si kebab deja el nombre vacío. */
function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'doc';
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
