<template>
  <span
    class="status-icon"
    :class="statusClass"
    :style="{ width: sizePx, height: sizePx }"
    aria-hidden="true"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ProgressStatus } from 'src/api/services/progressService';

interface Props {
  status: ProgressStatus;
  size?: number; // px
}

const props = defineProps<Props>();

const sizePx = `${props.size ?? 14}px`;

function getClass(status: ProgressStatus) {
  switch (status) {
    case ProgressStatus.COMPLETED:
      return 'status-icon--completed';
    case ProgressStatus.IN_PROGRESS:
      return 'status-icon--in-progress';
    default:
      return 'status-icon--not-started';
  }
}

const statusClass = computed(() => getClass(props.status));
</script>

<style scoped>
.status-icon {
  display: inline-block;
  border-radius: 50%;
  border: 2px solid currentColor;
  vertical-align: middle;
}

/* 未開始：中空圓 */
.status-icon--not-started {
  color: #9e9e9e; /* grey */
  background: transparent;
}

/* 進行中：半滿圓（左半填滿） */
.status-icon--in-progress {
  color: #fb8c00; /* orange */
  background: linear-gradient(90deg, currentColor 50%, transparent 50%);
}

/* 已完成：全填滿圓 */
.status-icon--completed {
  color: #21ba45; /* quasar positive */
  background: currentColor;
}
</style>
