import { register } from 'register-service-worker';

// The ready(), registered(), cached(), updatefound() and updated()
// events passes a ServiceWorkerRegistration instance in their arguments.
// ServiceWorkerRegistration: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration

register(process.env.SERVICE_WORKER_FILE, {
  // The registrationOptions object will be passed as the second argument
  // to ServiceWorkerContainer.register()
  // https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerContainer/register#Parameter

  // registrationOptions: { scope: './' },

  ready (/* registration */) {
    // console.log('Service worker is active.')
  },

  registered (/* registration */) {
    // console.log('Service worker has been registered.')
  },

  cached (/* registration */) {
    // console.log('Content has been cached for offline use.')
  },

  updatefound (/* registration */) {
    // console.log('New content is downloading.')
  },

  updated (registration) {
    void import('quasar').then(({ Notify }) => {
      Notify.create({
        type: 'info',
        message: '有新版本可用，點擊更新',
        timeout: 8000,
        actions: [
          {
            label: '更新',
            color: 'white',
            handler: () => {
              if (!registration || !registration.waiting) {
                window.location.reload();
                return;
              }
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
              const onControllerChange = () => {
                navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
                window.location.reload();
              };
              navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);
            },
          },
        ],
      });
    });
  },

  offline () {
    // console.log('No internet connection found. App is running in offline mode.')
  },

  error (/* err */) {
    // console.error('Error during service worker registration:', err)
  },
});
