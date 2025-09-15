<template>
  <q-page class="q-pa-md">
    <div class="column items-center q-gutter-md intro-wrap">
      <q-img src="~assets/baby-logo.png" style="max-width: 180px" ratio="1" class="q-mt-lg" />
      <div class="text-h5 text-primary text-center">歡迎使用 GOAT Baby</div>
      <div class="text-body1 text-center q-px-md" style="max-width: 560px">
        追蹤寶寶的成長里程碑、疫苗時程與練習小卡，讓育兒更安心、更有趣。
      </div>

      <div class="row q-col-gutter-md q-mt-md full-width" style="max-width: 900px">
        <div class="col-12 col-sm-4">
          <q-card flat bordered class="fit">
            <q-card-section class="text-center">
              <q-icon name="flag" color="primary" size="md" />
              <div class="text-subtitle1 q-mt-sm">成長里程碑</div>
              <div class="text-caption text-grey-7 q-mt-xs">了解每個階段的發展重點，並標記完成狀態</div>
            </q-card-section>
            <q-separator />
            <q-card-actions align="center">
              <q-btn color="primary" label="前往" :to="{ name: 'Milestone' }" flat />
            </q-card-actions>
          </q-card>
        </div>

        <div class="col-12 col-sm-4">
          <q-card flat bordered class="fit">
            <q-card-section class="text-center">
              <q-icon name="quiz" color="primary" size="md" />
              <div class="text-subtitle1 q-mt-sm">練習小卡</div>
              <div class="text-caption text-grey-7 q-mt-xs">以問答小卡陪伴學習與互動</div>
            </q-card-section>
            <q-separator />
            <q-card-actions align="center">
              <q-btn color="primary" label="前往" :to="{ name: 'FlashCard' }" flat />
            </q-card-actions>
          </q-card>
        </div>

        <div class="col-12 col-sm-4">
          <q-card flat bordered class="fit">
            <q-card-section class="text-center">
              <q-icon name="vaccines" color="primary" size="md" />
              <div class="text-subtitle1 q-mt-sm">疫苗時程</div>
              <div class="text-caption text-grey-7 q-mt-xs">掌握接種時程，守護健康</div>
            </q-card-section>
            <q-separator />
            <q-card-actions align="center">
              <q-btn color="primary" label="前往" :to="{ name: 'Vaccine' }" flat />
            </q-card-actions>
          </q-card>
        </div>
      </div>

      <div class="q-mt-xl">
        <q-btn color="primary" unelevated rounded icon="rocket_launch" label="開始使用" :to="{ name: 'Milestone' }" />
      </div>

      <!-- PWA 安裝區域 -->
      <div class="pwa-install-area q-mt-xl q-pa-md fit flex flex-center column">
        <div class="text-subtitle1 text-primary">安裝到主畫面，體驗更流暢</div>
        <div class="text-caption text-grey-7 q-mt-xs">離線也能快速開啟，節省載入時間</div>

        <!-- Android / 支援 beforeinstallprompt -->
        <q-btn v-if="showInstallButton" color="primary" outline class="q-mt-md" icon="download" label="安裝到主畫面" @click="installPWA" />
        <div v-else-if="isInstalled" class="text-positive text-body2 q-mt-sm install-state">
          已安裝到主畫面，可直接從桌面開啟。
        </div>

        <!-- iOS 指引 (無 beforeinstallprompt) -->
        <q-banner v-if="showIOSGuide" class="bg-grey-2 text-dark q-mt-md ios-guide" rounded>
          <template #avatar>
            <q-icon name="ios_share" color="primary" />
          </template>
          <div class="text-body2">
            iPhone：請點擊 Safari 底部 <strong>分享</strong> 按鈕，選擇 <strong>加入主畫面</strong> 完成安裝。
          </div>
        </q-banner>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useQuasar } from 'quasar';

// beforeinstallprompt 事件型別定義（Chrome / Edge PWA）
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

// 擴充 navigator（iOS Safari 專用 standalone 屬性）
interface NavigatorStandalone extends Navigator { standalone?: boolean }

// PWA 安裝流程狀態
const deferredPrompt = ref<BeforeInstallPromptEvent | null>(null);
const showInstallButton = ref(false);
const isInstalled = ref(false);

// iOS 條件：iPhone/iPad 且非 standalone
const ua = window.navigator.userAgent.toLowerCase();
const isIOS = /iphone|ipad|ipod/.test(ua);
const nav = window.navigator as NavigatorStandalone;
const isStandalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || nav.standalone === true;
const showIOSGuide = computed(() => isIOS && !isStandalone && !showInstallButton.value && !isInstalled.value);

// Android 條件
const isAndroid = /android/.test(ua);

const $q = useQuasar();

function handleBeforeInstallPrompt(e: BeforeInstallPromptEvent) {
  e.preventDefault();
  deferredPrompt.value = e;
  showInstallButton.value = true;
  if (isAndroid && !$q.platform.is.ios) {
    const snoozeAt = parseInt(localStorage.getItem('pwaInstallSnoozeAt') || '0', 10);
    // 若使用者 24 小時內選擇稍後則不再彈出
    if (!snoozeAt || Date.now() - snoozeAt > 24 * 60 * 60 * 1000) {
      showInstallNotify();
    }
  }
}

async function installPWA() {
  const evt = deferredPrompt.value;
  if (!evt) return;
  await evt.prompt();
  const { outcome } = await evt.userChoice;
  if (outcome === 'accepted') {
    showInstallButton.value = false;
  }
  deferredPrompt.value = null;
}

function handleAppInstalled() {
  isInstalled.value = true;
  showInstallButton.value = false;
  deferredPrompt.value = null;
}

function showInstallNotify() {
  $q.notify({
    message: '安裝 GOAT Baby 到主畫面？',
    caption: '更快啟動、全螢幕體驗與離線使用',
    color: 'primary',
    icon: 'download',
    timeout: 0, // 持續直到使用者操作
    position: 'bottom',
    actions: [
      {
        label: '稍後',
        color: 'white',
        handler: () => {
          // 紀錄稍後���提醒時間（例如 1 天後再次提示）
          localStorage.setItem('pwaInstallSnoozeAt', Date.now().toString());
        },
      },
      {
        label: '安裝',
        color: 'yellow',
        handler: () => installPWA(),
      },
    ],
  });
}

onMounted(() => {
  if (isStandalone) {
    isInstalled.value = true;
  }
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
  window.addEventListener('appinstalled', handleAppInstalled);
});

onUnmounted(() => {
  window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
  window.removeEventListener('appinstalled', handleAppInstalled);
});
</script>

<style scoped>
.intro-wrap { max-width: 1000px; margin: 0 auto; }
.pwa-install-area { max-width: 560px; background: rgba(0,0,0,0.02); border: 1px solid rgba(0,0,0,0.06); border-radius: 16px; }
.body--dark .pwa-install-area { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.12); }
.ios-guide { font-size: 13px; line-height: 1.5; }
.install-state { font-size: 13px; }
</style>
