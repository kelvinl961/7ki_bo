<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

import { $t } from '@vben/locales';

import { useVbenModal } from '@vben-core/popup-ui';

interface Props {
  // 轮询时间，分钟
  checkUpdatesInterval?: number;
  // 检查更新的地址
  checkUpdateUrl?: string;
}

defineOptions({ name: 'CheckUpdates' });

const props = withDefaults(defineProps<Props>(), {
  checkUpdatesInterval: 30, // Changed from 1 to 30 minutes
  checkUpdateUrl: import.meta.env.BASE_URL || '/',
});

let isCheckingUpdates = false;
const currentVersionTag = ref('');
const lastVersionTag = ref('');
const timer = ref<ReturnType<typeof setInterval>>();

// 🔧 FIX: Persist version tag in localStorage to avoid false positives on page refresh
const VERSION_TAG_KEY = 'backoffice_version_tag';

const [UpdateNoticeModal, modalApi] = useVbenModal({
  closable: false,
  closeOnPressEscape: false,
  closeOnClickModal: false,
  onConfirm() {
    lastVersionTag.value = currentVersionTag.value;
    // 🔧 FIX: Persist new version tag before reload
    try {
      localStorage.setItem(VERSION_TAG_KEY, currentVersionTag.value);
    } catch (e) {
      console.error('Failed to save version tag:', e);
    }
    window.location.reload();
    // handleSubmitLogout();
  },
});

async function getVersionTag() {
  try {
    if (
      location.hostname === 'localhost' ||
      location.hostname === '127.0.0.1'
    ) {
      return null;
    }
    const response = await fetch(props.checkUpdateUrl, {
      cache: 'no-cache',
      method: 'HEAD',
      redirect: 'manual',
    });

    const etag = response.headers.get('etag');
    const lastModified = response.headers.get('last-modified');

    // 🔧 FIX: Return a consistent version tag
    return etag || lastModified;
  } catch (error) {
    console.error('Failed to fetch version tag:', error);
    return null;
  }
}

async function checkForUpdates() {
  // 🔧 FIX: Prevent multiple concurrent checks
  if (isCheckingUpdates) {
    return;
  }

  isCheckingUpdates = true;

  try {
    const versionTag = await getVersionTag();
    if (!versionTag) {
      return;
    }

    // 首次运行时不提示更新，但保存版本标识
    if (!lastVersionTag.value) {
      lastVersionTag.value = versionTag;
      // 🔧 FIX: Save initial version tag to localStorage
      try {
        localStorage.setItem(VERSION_TAG_KEY, versionTag);
      } catch (e) {
        console.error('Failed to save version tag:', e);
      }
      return;
    }

    // 🔧 FIX: Only trigger update notice if version truly changed (not just server restart)
    if (lastVersionTag.value !== versionTag && versionTag) {
      console.log('🔄 New version detected:', {
        old: lastVersionTag.value,
        new: versionTag,
      });
      clearInterval(timer.value);
      handleNotice(versionTag);
    }
  } finally {
    isCheckingUpdates = false;
  }
}

function handleNotice(versionTag: string) {
  currentVersionTag.value = versionTag;
  modalApi.open();
}

function start() {
  if (props.checkUpdatesInterval <= 0) {
    return;
  }

  // 每 checkUpdatesInterval(默认值为1) 分钟检查一次
  timer.value = setInterval(
    checkForUpdates,
    props.checkUpdatesInterval * 60 * 1000,
  );
}

function handleVisibilitychange() {
  if (document.hidden) {
    stop();
  } else {
    if (!isCheckingUpdates) {
      isCheckingUpdates = true;
      checkForUpdates().finally(() => {
        isCheckingUpdates = false;
        start();
      });
    }
  }
}

function stop() {
  clearInterval(timer.value);
}

onMounted(() => {
  // 🔧 FIX: Load persisted version tag on mount
  try {
    const savedVersion = localStorage.getItem(VERSION_TAG_KEY);
    if (savedVersion) {
      lastVersionTag.value = savedVersion;
      console.log('📦 Loaded saved version tag:', savedVersion);
    }
  } catch (e) {
    console.error('Failed to load version tag:', e);
  }

  start();
  document.addEventListener('visibilitychange', handleVisibilitychange);
});

onUnmounted(() => {
  stop();
  document.removeEventListener('visibilitychange', handleVisibilitychange);
});
</script>
<template>
  <UpdateNoticeModal
    :cancel-text="$t('common.cancel')"
    :confirm-text="$t('common.refresh')"
    :fullscreen-button="false"
    :title="$t('ui.widgets.checkUpdatesTitle')"
    centered
    content-class="px-8 min-h-10"
    footer-class="border-none mb-3 mr-3"
    header-class="border-none"
  >
    {{ $t('ui.widgets.checkUpdatesDescription') }}
  </UpdateNoticeModal>
</template>
