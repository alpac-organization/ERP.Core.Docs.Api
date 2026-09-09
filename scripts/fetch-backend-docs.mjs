#!/usr/bin/env node
/**
 * fetch-backend-docs.mjs
 * Descarga el directorio `Docs/` del backend (ERP.Core.Manager.Api) desde GitHub,
 * copiando SOLO los archivos `.md` que existen. Si no hay ningún `.md`, sale con
 * código distinto de 0 (el CI no publicará nada).
 *
 * Uso:
 *   node scripts/fetch-backend-docs.mjs \
 *     --repo=alpac-organization/ERP.Core.Manager.Api \
 *     --path=src/ERP.Core.Manager.Api/Docs \
 *     --ref=develop \
 *     --token=$GITHUB_TOKEN \
 *     --out=./backend-docs
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

const REPO = getArg('repo') || 'alpac-organization/ERP.Core.Manager.Api';
const PATH_BASE = (getArg('path') || 'src/ERP.Core.Manager.Api/Docs').replace(/^\/+|\/+$/g, '');
const REF = getArg('ref') || 'develop';
const TOKEN = getArg('token') || process.env.GITHUB_TOKEN || '';
const OUT = path.resolve(ROOT, getArg('out') || './backend-docs');

const API = `https://api.github.com/repos/${REPO}/contents`;

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

async function walk(dirPath) {
  const url = `${API}/${dirPath}?ref=${encodeURIComponent(REF)}`;
  let entries;
  try {
    entries = await fetchJson(url);
  } catch (err) {
    console.error(`❌ No se pudo leer "${dirPath}" (¿existe el directorio?): ${err.message}`);
    throw err;
  }
  if (!Array.isArray(entries)) entries = [entries];

  for (const entry of entries) {
    // ruta relativa al dir raíz en el repo, para re-crear la carpeta local
    const rel = entry.path.substring(PATH_BASE.length).replace(/^\/+/, '');
    if (entry.type === 'dir') {
      await walk(entry.path);
    } else if (entry.type === 'file' && /\.md$/i.test(entry.name)) {
      const raw = await download(entry);
      const filePath = path.join(OUT, ...rel.split('/'));
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, raw, 'utf8');
      downloaded++;
      console.log(`   ${entry.path}`);
    }
  }
}

async function download(entry) {
  if (entry.download_url) {
    const res = await fetch(entry.download_url, { headers });
    if (!res.ok) throw new Error(`No se pudo descargar ${entry.path} (${res.status})`);
    return res.text();
  }
  if (entry.content) {
    return Buffer.from(entry.content, 'base64').toString('utf8');
  }
  throw new Error(`No hay forma de descargar ${entry.path}`);
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  await walk(PATH_BASE);

  if (downloaded === 0) {
    console.error(
      `❌ No se encontraron Markdown en ${REPO}:${PATH_BASE}. Nada que publicar (se aborta el despliegue).`
    );
    process.exit(2);
  }
  console.log(`✅ Descargados ${downloaded} archivo(s) de documentación desde ${REPO}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
