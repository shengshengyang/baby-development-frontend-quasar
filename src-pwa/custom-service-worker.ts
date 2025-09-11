/* eslint-disable @typescript-eslint/no-explicit-any */
/// <reference lib="webworker" />
/*
 * Service Worker (InjectManifest)
 */

export {};

import { clientsClaim } from 'workbox-core';
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import type { WorkboxPlugin } from 'workbox-core';

// 宣告 self 以包含 Workbox 注入資源
declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: any };
// 補 ExtendableMessageEvent (部分 TS 版本缺)
interface ExtendableMessageEvent extends ExtendableEvent { data: any }

void self.skipWaiting();
clientsClaim();

const fallbackUrl = process.env.PWA_FALLBACK_HTML || '/index.html';

self.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open('offline-fallback');
        await cache.add('/offline.html');
      } catch {
        /* 忽略 */
      }
    })()
  );
});

// Precache
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// Navigation fallback
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(fallbackUrl),
      { denylist: [new RegExp(process.env.PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/] }
    )
  );
}

// API 快取
registerRoute(
  ({ url, request }) => request.method === 'GET' && url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      (new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 60 * 60 }) as unknown as WorkboxPlugin),
      (new CacheableResponsePlugin({ statuses: [0, 200] }) as unknown as WorkboxPlugin),
    ],
  })
);

// 圖片
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      (new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 }) as unknown as WorkboxPlugin),
      (new CacheableResponsePlugin({ statuses: [0, 200] }) as unknown as WorkboxPlugin),
    ],
  })
);

// 字體
registerRoute(
  ({ url }) => url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com'),
  new CacheFirst({
    cacheName: 'font-cache',
    plugins: [
      (new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 30 * 24 * 60 * 60 }) as unknown as WorkboxPlugin),
      (new CacheableResponsePlugin({ statuses: [0, 200] }) as unknown as WorkboxPlugin),
    ],
  })
);

// 第三方資源 (script/style)
registerRoute(
  ({ request, url }) =>
    (request.destination === 'script' || request.destination === 'style') && url.origin !== self.location.origin,
  new NetworkFirst({
    cacheName: 'vendor-assets',
    plugins: [
      (new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 24 * 60 * 60 }) as unknown as WorkboxPlugin),
      (new CacheableResponsePlugin({ statuses: [0, 200] }) as unknown as WorkboxPlugin),
    ],
    networkTimeoutSeconds: 4,
  })
);

// Navigation fetch fallback
self.addEventListener('fetch', (event: FetchEvent) => {
  const request = event.request;
  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const cache = await caches.open('offline-fallback');
          const offlineResp = (await caches.match('/offline.html')) || (await cache.match('/offline.html'));
          if (offlineResp) return offlineResp;
          const handler = createHandlerBoundToURL(fallbackUrl);
          return handler({ request, event, url: new URL(fallbackUrl, self.location.origin) } as any);
        }
      })()
    );
  }
});

// SKIP_WAITING 訊息
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
});

// Push 事件
self.addEventListener('push', (event: PushEvent) => {
  let raw: any;
  try { raw = event.data ? event.data.json() : {}; } catch { raw = {}; }
  interface PushPayload { title?: string; body?: string; url?: string }
  const data: PushPayload = raw;
  const title = data.title || '通知';
  const body = data.body || '有新的更新內容';
  const url = data.url || '/';
  const options: any = {
    body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-128x128.png',
    data: { url }
  };
  event.waitUntil((self as any).registration.showNotification(title, options));
});

// 通知點擊
self.addEventListener('notificationclick', (event: NotificationEvent) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/';
  event.waitUntil(
    (async () => {
      const allClients = await (self as any).clients.matchAll({ type: 'window', includeUncontrolled: true });
      const existing = allClients.find((c: any) => 'focus' in c && c.url.includes(self.location.origin));
      if (existing) {
        await (existing as WindowClient).focus();
        (existing as WindowClient).postMessage({ type: 'OPEN_URL', url: targetUrl });
      } else {
        await (self as any).clients.openWindow(targetUrl);
      }
    })()
  );
});
