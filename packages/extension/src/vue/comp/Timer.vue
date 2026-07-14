<script setup lang="ts">
const props = defineProps<{
  start_ts: number;
}>();
import { onMounted, onUnmounted, reactive } from "vue";

const model = reactive({
  timer_format: "00:00:00",
  upload_state: "action", //as "result" | "action" | "progress",
  video_id: null,
  progress_value: 0,
});

let _state_interval;

function pad(n: number): string {
  if (n < 10) {
    return "0" + n.toString();
  } else {
    return n.toString();
  }
}

function update_timer() {
  let d = Math.floor((Date.now() - props.start_ts) / 1000);

  const s = d % 60;
  const m = Math.floor(d / 60);
  const h = Math.floor(m / 60);
  const format = `${pad(h)}:${pad(m)}:${pad(s)}`;

  model.timer_format = format;
}

onMounted(() => {
  _state_interval = setInterval(() => {
    update_timer();
  }, 110);
  update_timer();
});

onUnmounted(() => {
  clearInterval(_state_interval);
});
</script>
<template>
  <div class="vr-ctrl-timer">
    <div class="vr-ctrl-timer__icon">
      <svg viewBox="0 0 24 24">
        <path
          d="M12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22C6.47,22 2,17.5 2,12A10,10 0 0,1 12,2M12.5,7V12.25L17,14.92L16.25,16.15L11,13V7H12.5Z"
        />
      </svg>
    </div>
    <span v-text="model.timer_format"></span>
  </div>
</template>
<style>
.vr-record-ctrl__timer {
  font-weight: 600;
  font-size: 14px;
}

.vr-record-ctrl__back {
  height: var(--vr_ctrl_btn-height);
  display: flex;
  justify-content: center;
  align-items: center;
  color: var(--vr_red);
  padding: 0px 25px;
  font-weight: 500;
  cursor: pointer;
}

.vr-ctrl-timer {
  display: flex;
  justify-content: flex-start;
  align-items: center;

  width: 100%;
  height: 36px;

  border-radius: 4px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}
.vr-ctrl-timer__icon {
  display: flex;
  justify-content: center;
  align-items: center;

  width: 36px;
  height: 100%;

  border-right: 1px solid rgba(0, 0, 0, 0.12);
}

.vr-ctrl-timer__icon svg {
  width: 20px;
  height: 20px;

  fill: rgba(0, 0, 0, 0.5);
}
.vr-ctrl-timer span {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex: 1 1 auto;

  padding: 0px 8px;

  font-weight: 500;
  color: rgba(0, 0, 0, 0.9);
  font-size: 13px;
}
</style>
