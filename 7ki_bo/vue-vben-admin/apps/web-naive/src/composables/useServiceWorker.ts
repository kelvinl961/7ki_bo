import { onMounted, ref } from 'vue';

export function useServiceWorker() {
  const isSupported = ref('serviceWorker' in navigator);
  const isRegistered = ref(false);

  const registerServiceWorker = async () => {
    if (!isSupported.value) {
      console.warn('Service Worker not supported');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
      });

      console.log('Service Worker registered successfully');
      isRegistered.value = true;

      // Listen for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'activated') {
              console.log('Service Worker activated');
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  };

  const clearCache = async () => {
    if (isRegistered.value && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
      console.log('Cache clear requested');
    }
  };

  onMounted(() => {
    registerServiceWorker();
  });

  return {
    isSupported,
    isRegistered,
    clearCache,
  };
}
