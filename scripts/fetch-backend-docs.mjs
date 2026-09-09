#!/usr/bin/env node
/**
 * fetch-backend-docs.mjs
 * Descarga los directorios `Docs/` de uno o varios repositorios del backend desde GitHub,
 * copiando SOLO los archivos `.md` que existen. Se omiten los archivos `README*`.
 *
 * - Modo multi-fuente (recomendado): --config=docs.config.json  (json con "apis": [...])
 * - Modo simple (compatibilidad):    --repo=/ --path=/ --ref=/ --slug=/ --out=/
 *
 * Regla importante: si NO se descarga ningún `.md` en total, el proceso sale con código
 * distinto de 0 para que el CI no despliegue nada.
 *
 * Uso:
 *   node scripts/fetch-backend-docs.mjs --config=./docs.config.json \
 *     --token=$GITHUB_TOKEN --out=./backend-docs \
 *     --repo-ref-overrides='{"owner/repo":"v1.2.0"}'
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

const CONFIG = getArg('config');
const TOKEN = getArg('token') || process.env.BACKEND_READ_TOKEN || process.env.GITHUB_TOKEN || '';
const OUT = path.resolve(ROOT, getArg('out') || './backend-docs');
const DEFAULT_REF = getArg('ref') || 'develop';

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'erp-api-docs-sync',
};
if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

let downloaded = 0;

async function fetchJson(url) {
  const res = await fetch(url, { headers });
  if (!res.ok) {
    throw new Error(`GitHub API falló (${res.status}) en ${url}\n${await res.text()}`);
  }
  return res.json();
}

async function download(entry) {
  if (entry.download_url) {
    const res = await fetch(entry.download_url, { headers });
    if (!res.ok) throw new Error(`No se pudo descargar ${entry.path} (${res.status})`);
    return res.text();
  }
  if (entry.content) return Buffer.from(entry.content, 'base64').toString('utf8');
  throw new Error(`No hay forma de descargar ${entry.path}`);
}

function isEndpointDoc(name) {
  // Excluye README* (guías), solo interesan los .md de endpoints.
  return /\.md$/i.test(name) && !/^readme/i.test(name);
}

async function walk(repo, basePath, dirPath, outDir) {
  const url = `https://api.github.com/repos/${repo}/contents/${dirPath}?ref=${encodeURIComponent(basePathRef ?? DEFAULT_REF)}`;
  let entries;
  try {
    entries = await fetchJson(url);
  } catch (err) {
    console.warn(`⚠️  ${dirPath} (${repo}) no encontrado o sin acceso: ${err.message}`);
    return;
  }
  if (!Array.isArray(entries)) entries = [entries];

  for (const entry of entries) {
    const rel = entry.path.substring(basePath.length).replace(/^\/+/, '');
    if (entry.type === 'dir') {
      await walk(repo, basePath, entry.path, outDir);
    } else if (entry.type === 'file' && isEndpointDoc(entry.name)) {
      const raw = await download(entry);
      const filePath = path.join(outDir, ...rel.split('/'));
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, raw, 'utf8');
      downloaded++;
      console.log(`   [${path.basename(outDir)}] ${entry.path}`);
    }
  }
}

let basePathRef; // ref actual dentro de walk (variable de contexto)
async function fetchSource(source) {
  const repo = source.repo;
  const basePath = (source.docsPath || '').replace(/^\/+|\/+$/g, '');
  basePathRef = source.ref || DEFAULT_REF;
  const outDir = path.join(OUT, source.slug || 'api');
  await fs.mkdir(outDir, { recursive: true });
  console.log(`\n▲ ${repo} (${basePathRef}) -> ${path.relative(ROOT, outDir)}`);
  await walk(repo, basePath, basePath, outDir);
}

async function loadConfig() {
  const raw = await fs.readFile(path.resolve(ROOT, CONFIG), 'utf8');
  return JSON.parse(raw).apis || [];
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  const sources = CONFIG ? await loadConfig() : [
    {
      repo: getArg('repo') || 'alpac-organization/ERP.Core.Manager.Api',
      docsPath: getArg('path') || 'src/ERP.Core.Manager.Api/Docs',
      ref: getArg('ref') || 'develop',
      slug: getArg('slug') || 'api',
    },
  ];

  let overrides = {};
  const rawOverrides = getArg('repo-ref-overrides');
  if (rawOverrides) overrides = JSON.parse(rawOverrides);

  for (const source of sources) {
    // Permite que el ref del dispatch (release) sobreescriba la fuente que coincida por repo.
    const effective = { ...source };
    if (overrides[source.repo]) effective.ref = overrides[source.repo];
    await fetchSource(effective);
  }

  if (downloaded === 0) {
    console.error(`\n❌ No se encontraron Markdown en ninguna fuente. Nada que publicar (se aborta el despliegue).`);
    process.exit(2);
  }
  console.log(`\n✅ Descargados ${downloaded} archivo(s) de documentación.`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
