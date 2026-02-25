<template>
  <q-page class="q-pa-md">
    <div class="column items-center q-gutter-md intro-wrap">
      <q-img src="~assets/baby-logo.png" style="max-width: 180px" ratio="1" class="q-mt-lg" />
      <div class="text-h5 text-primary text-center">{{ $t('home.welcome') }}</div>
      <div class="text-body1 text-center q-px-md" style="max-width: 560px">
        {{ $t('home.description') }}
      </div>

      <div class="row q-col-gutter-md q-mt-md full-width" style="max-width: 900px">
        <div class="col-12 col-sm-4">
          <q-card flat bordered class="fit">
            <q-card-section class="text-center">
              <q-icon name="flag" color="primary" size="md" />
              <div class="text-subtitle1 q-mt-sm">{{ $t('home.milestone.title') }}</div>
              <div class="text-caption text-grey-7 q-mt-xs">{{ $t('home.milestone.description') }}</div>
            </q-card-section>
            <q-separator />
            <q-card-actions align="center">
              <q-btn color="primary" :label="$t('home.milestone.goBtn')" :to="{ name: 'Milestone' }" flat />
            </q-card-actions>
          </q-card>
        </div>

        <div class="col-12 col-sm-4">
          <q-card flat bordered class="fit">
            <q-card-section class="text-center">
              <q-icon name="quiz" color="primary" size="md" />
              <div class="text-subtitle1 q-mt-sm">{{ $t('home.flashcard.title') }}</div>
              <div class="text-caption text-grey-7 q-mt-xs">{{ $t('home.flashcard.description') }}</div>
            </q-card-section>
            <q-separator />
            <q-card-actions align="center">
              <q-btn color="primary" :label="$t('home.milestone.goBtn')" :to="{ name: 'FlashCard' }" flat />
            </q-card-actions>
          </q-card>
        </div>

        <!-- 疫苗時程卡片 (暫時隱藏) -->
        <!-- <div class="col-12 col-sm-4">
          <q-card flat bordered class="fit">
            <q-card-section class="text-center">
              <q-icon name="vaccines" color="primary" size="md" />
              <div class="text-subtitle1 q-mt-sm">{{ $t('home.vaccine.title') }}</div>
              <div class="text-caption text-grey-7 q-mt-xs">{{ $t('home.vaccine.description') }}</div>
            </q-card-section>
            <q-separator />
            <q-card-actions align="center">
              <q-btn color="primary" :label="$t('home.milestone.goBtn')" :to="{ name: 'Vaccine' }" flat />
            </q-card-actions>
          </q-card>
        </div> -->
      </div>

      <div class="q-mt-xl">
        <q-btn color="primary" unelevated rounded icon="rocket_launch" :label="$t('home.startBtn')" :to="{ name: 'Milestone' }" />
      </div>

      <!-- PWA 安裝區域 -->
      <div class="pwa-install-area q-mt-xl q-pa-md fit flex flex-center column">
        <div class="text-subtitle1 text-primary">{{ $t('home.pwa.title') }}</div>
        <div class="text-caption text-grey-7 q-mt-xs">{{ $t('home.pwa.description') }}</div>

        <!-- Android / 支援 beforeinstallprompt -->
        <q-btn v-if="showInstallButton" color="primary" outline class="q-mt-md" icon="download" :label="$t('home.pwa.installBtn')" @click="installPWA" />
        <div v-else-if="isInstalled" class="text-positive text-body2 q-mt-sm install-state">
          {{ $t('home.pwa.installed') }}
        </div>

        <!-- iOS 指引 (無 beforeinstallprompt) -->
        <q-banner v-if="showIOSGuide" class="bg-grey-2 text-dark q-mt-md ios-guide" rounded>
          <template #avatar>
            <q-icon name="ios_share" color="primary" />
          </template>
          <div class="text-body2">
            {{ $t('home.pwa.iphoneGuide') }}
          </div>
        </q-banner>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

const { t } = useI18n();

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
    message: t('home.pwa.promptTitle'),
    caption: t('home.pwa.promptDesc'),
    color: 'primary',
    icon: 'download',
    timeout: 0, // 持續直到使用者操作
    position: 'bottom',
    actions: [
      {
        label: t('home.pwa.later'),
        color: 'white',
        handler: () => {
          // 紀錄稍後提醒時間（例如 1 天後再次提示）
          localStorage.setItem('pwaInstallSnoozeAt', Date.now().toString());
        },
      },
      {
        label: t('home.pwa.install'),
        color: 'yellow',
        handler: () => void installPWA(),
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

<style scoped lang="scss">
@import '../css/design-system.scss';

.intro-wrap {
  max-width: 1200px;
  margin: 0 auto;
}

.text-h5 {
  font-family: $font-family-heading;
  letter-spacing: 0.08em;
  background: linear-gradient(135deg, var(--q-primary), var(--q-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  text-shadow: none;
}

.text-body1 {
  font-family: $font-family-body;
  opacity: 0.85;
  line-height: 1.6;
}

// 功能卡片樣式
.q-card {
  @include warm-card;
  height: 100%;
  border-radius: $radius-lg;

  &:hover {
    transform: translateY(-6px);
    box-shadow: $shadow-primary-glow;
  }
}

.q-icon {
  transition: transform $transition-normal;
}

.q-card:hover .q-icon {
  transform: scale(1.1) rotate(5deg);
}

// PWA 安裝區域
.pwa-install-area {
  max-width: 600px;
  @include glassmorphism;
  border-radius: $radius-xl;
  padding: $spacing-xl;
  box-shadow: $shadow-soft;
  transition: all $transition-normal;

  &:hover {
    box-shadow: $shadow-medium;
  }

  .text-subtitle1 {
    font-family: $font-family-heading;
    letter-spacing: 0.05em;
  }

  .text-caption {
    font-family: $font-family-body;
  }
}

.ios-guide {
  font-size: 0.875rem;
  line-height: 1.6;
  border-radius: $radius-md;

  strong {
    color: var(--q-primary);
  }
}

.install-state {
  font-size: 0.875rem;
  font-family: $font-family-body;
}

// 主按鈕優化
.q-btn[unelevated] {
  @include warm-button;
  padding: $spacing-md $spacing-xl;
  font-size: 1.1rem;

  &:hover {
    box-shadow: $shadow-primary-glow;
  }
}

// 卡片動作按鈕
.q-card-actions .q-btn {
  font-family: $font-family-body;
  font-weight: 600;
  transition: all $transition-normal;

  &:hover {
    background: rgba(var(--q-primary-rgb), 0.1);
  }
}
</style>
