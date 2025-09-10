/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unnecessary-type-assertion */
/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.config file > pwa > workboxMode is set to "InjectManifest"
 */

// 本地最小 Web Worker 事件型別（避免在非 WebWorker lib 環境下 TS 編譯錯誤）
interface ExtendableEvent extends Event { waitUntil(promise: Promise<any>): void }
interface FetchEvent extends ExtendableEvent { request: Request; respondWith(p: Promise<Response>): void }
interface ExtendableMessageEvent extends ExtendableEvent { data: any }

import { clientsClaim } from 'workbox-core';
import {
  precacheAndRoute,
  cleanupOutdatedCaches,
  createHandlerBoundToURL,
} from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// 型別宣告 (保持於頂部避免編譯錯誤)
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
declare const self: ServiceWorkerGlobalScope & typeof globalThis & { skipWaiting: () => void };

void self.skipWaiting();
clientsClaim();

const fallbackUrl = (process.env.PWA_FALLBACK_HTML as string) || '/index.html';

self.addEventListener('install', (event: Event) => {
  (event as ExtendableEvent).waitUntil(
    (async () => {
      try {
        const cache = await caches.open('offline-fallback');
        await cache.add('/offline.html');
      } catch {
        // 忽略錯誤，避免 install 失敗
      }
    })()
  );
});

// Use with precache injection
precacheAndRoute(self.__WB_MANIFEST);

cleanupOutdatedCaches();

// Navigation fallback：非 SSR 使用 index.html；若日後加入 offline.html 可調整
if (process.env.MODE !== 'ssr' || process.env.PROD) {
  registerRoute(
    new NavigationRoute(
      createHandlerBoundToURL(fallbackUrl),
      { denylist: [new RegExp(process.env.PWA_SERVICE_WORKER_REGEX), /workbox-(.)*\.js$/] }
    )
  );
}

// --- Runtime Caching 規則 ---
// 1. API (GET) 資料：快速回應 + 背景更新
registerRoute(
  ({ url, request }) => request.method === 'GET' && url.pathname.startsWith('/api/'),
  new StaleWhileRevalidate({
    cacheName: 'api-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 80, maxAgeSeconds: 60 * 60 }) as any,
      new CacheableResponsePlugin({ statuses: [0, 200] }) as any,
    ],
  })
);

// 2. 圖片：優先用快取，過期清理
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 }) as any,
      new CacheableResponsePlugin({ statuses: [0, 200] }) as any,
    ],
  })
);

// 3. 字體：長期快取
registerRoute(
  ({ url }) => url.origin.includes('fonts.googleapis.com') || url.origin.includes('fonts.gstatic.com'),
  new CacheFirst({
    cacheName: 'font-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 30 * 24 * 60 * 60 }) as any,
      new CacheableResponsePlugin({ statuses: [0, 200] }) as any,
    ],
  })
);

// 4. 其他第三方 (如 CDN js/css)：網路優先，失敗回退快取
registerRoute(
  ({ request, url }) =>
    (request.destination === 'script' || request.destination === 'style') && url.origin !== self.location.origin,
  new NetworkFirst({
    cacheName: 'vendor-assets',
    plugins: [
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 24 * 60 * 60 }) as any,
      new CacheableResponsePlugin({ statuses: [0, 200] }) as any,
    ],
    networkTimeoutSeconds: 4,
  })
);

// 5. HTML navigation 離線備援（若離線且失敗，回傳 precache 的 offline.html 若存在）
self.addEventListener('fetch', (event: Event) => {
  const fe = event as unknown as FetchEvent;
  const request = fe.request as Request;
  if (request && request.mode === 'navigate') {
    fe.respondWith(
      (async () => {
        try {
          return await fetch(request);
        } catch {
          const cache = await caches.open('offline-fallback');
          const offlineResp = (await caches.match('/offline.html')) || (await cache.match('/offline.html'));
          if (offlineResp) return offlineResp;
          const handler = createHandlerBoundToURL(fallbackUrl);
          return handler({ request, event: fe, url: new URL(fallbackUrl, self.location.origin) } as any);
        }
      })()
    );
  }
});

// 接受前端訊息以立即啟用新版 SW
self.addEventListener('message', (event: Event) => {
  const me = event as unknown as ExtendableMessageEvent;
  if (me.data && me.data.type === 'SKIP_WAITING') {
    void self.skipWaiting();
  }
});
