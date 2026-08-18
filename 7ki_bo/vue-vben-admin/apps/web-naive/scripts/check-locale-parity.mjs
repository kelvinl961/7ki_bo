#!/usr/bin/env node
/**
 * Locale key parity checker.
 *
 * Compares flattened keys across en-US / zh-CN / vi-VN app locale JSON files
 * and reports missing or empty translations.
 *
 * Usage:
 *   node scripts/check-locale-parity.mjs
 *   node scripts/check-locale-parity.mjs --strict   # exit 1 on any mismatch
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const langsRoot = path.join(__dirname, '..', 'src', 'locales', 'langs');
const LOCALES = ['en-US', 'zh-CN', 'vi-VN'];
const strict = process.argv.includes('--strict');

function flatten(obj, prefix = '') {
  /** @type {Record<string, string>} */
  const out = {};
  if (!obj || typeof obj !== 'object') return out;
  for (const [key, value] of Object.entries(obj)) {
    const next = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(out, flatten(value, next));
    } else {
      out[next] = value == null ? '' : String(value);
    }
  }
  return out;
}

function loadLocaleFiles(locale) {
  const dir = path.join(langsRoot, locale);
  /** @type {Record<string, string>} */
  const flat = {};
  if (!fs.existsSync(dir)) return flat;

  for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith('.json')) continue;
    const ns = file.replace(/\.json$/, '');
    const raw = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const nested = flatten(raw);
    for (const [k, v] of Object.entries(nested)) {
      flat[`${ns}.${k}`] = v;
    }
  }

  // Also include root locale files like zh-CN.json if present
  const rootFile = path.join(langsRoot, `${locale}.json`);
  if (fs.existsSync(rootFile)) {
    const raw = JSON.parse(fs.readFileSync(rootFile, 'utf8'));
    Object.assign(flat, flatten(raw));
  }

  return flat;
}

const maps = Object.fromEntries(
  LOCALES.map((locale) => [locale, loadLocaleFiles(locale)]),
);

const allKeys = new Set();
for (const map of Object.values(maps)) {
  for (const key of Object.keys(map)) allKeys.add(key);
}

let missing = 0;
let identicalToEn = 0;
const report = [];

for (const key of [...allKeys].sort()) {
  const en = maps['en-US']?.[key];
  for (const locale of LOCALES) {
    if (!(key in (maps[locale] || {}))) {
      missing += 1;
      report.push(`[MISSING] ${locale}: ${key}`);
    }
  }
  const zh = maps['zh-CN']?.[key];
  const vi = maps['vi-VN']?.[key];
  if (en && zh && zh === en && /[A-Za-z]{3,}/.test(en) && en.includes(' ')) {
    identicalToEn += 1;
    report.push(`[ZH==EN] ${key}: ${en}`);
  }
  if (en && vi && vi === en && /[A-Za-z]{3,}/.test(en) && en.includes(' ')) {
    identicalToEn += 1;
    report.push(`[VI==EN] ${key}: ${en}`);
  }
}

console.log(`Locales: ${LOCALES.join(', ')}`);
console.log(`Total unique keys: ${allKeys.size}`);
console.log(`Missing keys across locales: ${missing}`);
console.log(`Likely untranslated (identical multi-word EN): ${identicalToEn}`);

if (report.length > 0) {
  console.log('\n--- Details (first 80) ---');
  for (const line of report.slice(0, 80)) console.log(line);
  if (report.length > 80) console.log(`... and ${report.length - 80} more`);
}

if (strict && (missing > 0 || identicalToEn > 0)) {
  process.exit(1);
}

process.exit(0);
