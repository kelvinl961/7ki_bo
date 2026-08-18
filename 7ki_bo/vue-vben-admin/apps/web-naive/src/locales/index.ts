import type { App } from 'vue';

import type { LocaleSetupOptions, SupportedLanguagesType } from '@vben/locales';

import {
  $t,
  i18n,
  loadLocaleMessages,
  registerAppLocaleSwitcher,
  setupI18n as coreSetup,
} from '@vben/locales';
import { preferences, updatePreferences } from '@vben/preferences';

const allModules = import.meta.glob('./langs/*/*.json');

/** Loaded at startup — login, layout chrome, route titles */
const ESSENTIAL_MODULES = new Set(['page']);

const fullLoadTasks = new Map<string, Promise<void>>();

/** During first paint only essential modules block bootstrap. */
let isBootstrapping = true;

/** Prevent overlapping locale switches / reloads */
let isSwitchingLocale = false;

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

const APPLYING_LABELS: Record<string, string> = {
  'en-US': 'Applying language…',
  'zh-CN': '正在应用语言…',
  'vi-VN': 'Đang áp dụng ngôn ngữ…',
};

/**
 * Show a full-screen overlay before reloading so the language switch feels intentional.
 */
function showLocaleSwitchOverlay(locale: SupportedLanguagesType) {
  const existing = document.getElementById('__locale-switch-overlay__');
  if (existing) existing.remove();

  const label =
    APPLYING_LABELS[locale] ||
    APPLYING_LABELS[preferences.app.locale] ||
    APPLYING_LABELS['en-US']!;

  const overlay = document.createElement('div');
  overlay.id = '__locale-switch-overlay__';
  overlay.setAttribute('role', 'status');
  overlay.setAttribute('aria-live', 'polite');
  overlay.innerHTML = `
    <style>
      #__locale-switch-overlay__ {
        position: fixed; inset: 0; z-index: 100000;
        display: flex; flex-direction: column; align-items: center;
        justify-content: center; gap: 16px;
        background: rgba(15, 23, 42, 0.55);
        backdrop-filter: blur(4px);
        color: #fff; font-family: system-ui, sans-serif; font-size: 16px;
      }
      #__locale-switch-overlay__ .spinner {
        width: 40px; height: 40px;
        border: 3px solid rgba(255,255,255,0.25);
        border-top-color: #fff; border-radius: 50%;
        animation: locale-spin 0.7s linear infinite;
      }
      @keyframes locale-spin { to { transform: rotate(360deg); } }
    </style>
    <div class="spinner" aria-hidden="true"></div>
    <div>${label}</div>
  `;
  document.body.appendChild(overlay);
}

/**
 * Switch locale from any page (header toggle, login modal, preferences).
 * Waits for all message modules, shows overlay, then reloads the app so
 * setup-time $t() strings and KeepAlive caches all refresh.
 */
async function switchAppLocale(locale: SupportedLanguagesType) {
  if (isSwitchingLocale) return;

  if (locale === preferences.app.locale && i18n.global.locale.value === locale) {
    await loadRemainingAppLocales(locale);
    return;
  }

  isSwitchingLocale = true;
  showLocaleSwitchOverlay(locale);

  try {
    updatePreferences({ app: { locale } });
    // Ensure remaining modules for the NEW locale are loaded before reload
    // Clear cached task so we always merge fresh messages for the target locale
    fullLoadTasks.delete(locale);
    isBootstrapping = false;
    await loadLocaleMessages(locale);
    await loadRemainingAppLocales(locale);

    // Brief pause so the overlay is visible, then full reload
    await new Promise((resolve) => setTimeout(resolve, 280));
    window.location.reload();
  } catch (error) {
    isSwitchingLocale = false;
    document.getElementById('__locale-switch-overlay__')?.remove();
    throw error;
  }
}

async function setupI18n(app: App, options: LocaleSetupOptions = {}) {
  await coreSetup(app, {
    defaultLocale: preferences.app.locale,
    loadMessages,
    missingWarn: !import.meta.env.PROD,
    ...options,
  });
  isBootstrapping = false;
  registerAppLocaleSwitcher(switchAppLocale);
}

export {
  $t,
  loadRemainingAppLocales,
  setupI18n,
  switchAppLocale,
};
