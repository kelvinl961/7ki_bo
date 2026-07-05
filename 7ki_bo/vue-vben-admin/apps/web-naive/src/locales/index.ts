import type { App } from 'vue';

import type { LocaleSetupOptions, SupportedLanguagesType } from '@vben/locales';

import {
  $t,
  i18n,
  loadLocaleMessages,
  setupI18n as coreSetup,
} from '@vben/locales';
import { preferences, updatePreferences } from '@vben/preferences';

const allModules = import.meta.glob('./langs/*/*.json');

/** Loaded at startup — login, layout chrome, route titles */
const ESSENTIAL_MODULES = new Set(['page']);

const fullLoadTasks = new Map<string, Promise<void>>();

/** During first paint only essential modules block bootstrap. */
let isBootstrapping = true;

function parseLocalePath(path: string) {
  const match = path.match(/\.\/langs\/([^/]+)\/(.+)\.json$/);
  if (!match) return null;
  return { file: match[2]!, locale: match[1]! };
}

async function loadAppLocaleFiles(
  lang: SupportedLanguagesType,
  files?: Set<string>,
) {
  const messages: Record<string, Record<string, unknown>> = {};
  const tasks: Promise<void>[] = [];

  for (const [path, importFn] of Object.entries(allModules)) {
    const parsed = parseLocalePath(path);
    if (!parsed || parsed.locale !== lang) continue;
    if (files && !files.has(parsed.file)) continue;

    tasks.push(
      importFn().then((mod) => {
        const payload = mod as { default?: Record<string, unknown> };
        if (payload.default) {
          messages[parsed.file] = payload.default;
        }
      }),
    );
  }

  await Promise.all(tasks);
  return messages;
}

/**
 * Load non-essential app locale modules (finance, activity, etc.).
 * Safe to call multiple times per locale.
 */
async function loadRemainingAppLocales(lang?: SupportedLanguagesType) {
  const target = lang ?? preferences.app.locale;
  const existing = fullLoadTasks.get(target);
  if (existing) return existing;

  const task = (async () => {
    const allFiles = new Set<string>();
    for (const path of Object.keys(allModules)) {
      const parsed = parseLocalePath(path);
      if (parsed?.locale === target) {
        allFiles.add(parsed.file);
      }
    }

    const remaining = [...allFiles].filter((file) => !ESSENTIAL_MODULES.has(file));
    if (remaining.length === 0) return;

    const messages = await loadAppLocaleFiles(target, new Set(remaining));
    if (Object.keys(messages).length > 0) {
      i18n.global.mergeLocaleMessage(target, messages);
    }
  })();

  fullLoadTasks.set(target, task);
  return task;
}

/**
 * Essential app messages for first paint; full modules load in background.
 * After bootstrap, user-initiated locale switches await all modules first.
 */
async function loadMessages(lang: SupportedLanguagesType) {
  const essential = await loadAppLocaleFiles(lang, ESSENTIAL_MODULES);

  if (isBootstrapping) {
    void loadRemainingAppLocales(lang);
    return essential;
  }

  await loadRemainingAppLocales(lang);
  return essential;
}

/**
 * Switch locale from any page (header toggle, login modal, preferences).
 * Waits for all message modules before updating the active locale.
 */
async function switchAppLocale(locale: SupportedLanguagesType) {
  if (locale === preferences.app.locale && i18n.global.locale.value === locale) {
    await loadRemainingAppLocales(locale);
    return;
  }

  updatePreferences({ app: { locale } });
  await loadLocaleMessages(locale);
}

async function setupI18n(app: App, options: LocaleSetupOptions = {}) {
  await coreSetup(app, {
    defaultLocale: preferences.app.locale,
    loadMessages,
    missingWarn: !import.meta.env.PROD,
    ...options,
  });
  isBootstrapping = false;
}

export {
  $t,
  loadRemainingAppLocales,
  setupI18n,
  switchAppLocale,
};
