<template>
  <q-page class="q-pa-md">
    <div class="column items-center q-gutter-md">
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
    </div>
  </q-page>
</template>

<script setup lang="ts">
// 純展示頁，暫無邏輯
</script>

<style scoped>
</style>

