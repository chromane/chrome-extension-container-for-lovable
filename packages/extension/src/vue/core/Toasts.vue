<script setup lang="ts">
import MessageSimple from '../comp/MessageSimple.vue';
import mdi_close from '@mdi/svg/svg/close.svg?raw';
import { getCurrentInstance } from 'vue';
//
let props = withDefaults(
  defineProps<{
    model?: {
      position: 'left' | 'right';
    };
  }>(),
  { model: { position: 'right' } }
);
//
let instance = getCurrentInstance();
let ctrl = instance.appContext.config.globalProperties.ctrl;
//
</script>
<template>
  <div class="toasts" v-if="props.model.position === 'right'">
    <transition-group name="toast_fade" tag="div">
      <div class="toast" v-for="toast in ctrl.store.toasts" :key="toast.id">
        <MessageSimple :model="toast.message"></MessageSimple>
        <div class="close" v-on:click="ctrl.toasts.close_toast(toast.id)" v-html="mdi_close"></div>
      </div>
    </transition-group>
  </div>
  <div class="toasts_left" v-if="props.model.position === 'left'">
    <transition-group name="toast_fade_left" tag="div">
      <div class="toast" v-for="toast in ctrl.store.toasts" :key="toast.id">
        <MessageSimple :model="toast.message"></MessageSimple>
        <div class="close" v-on:click="ctrl.toasts.close_toast(toast.id)" v-html="mdi_close"></div>
      </div>
    </transition-group>
  </div>
</template>
<style>
/* RIGHT - DEFAULT */
.toasts {
  position: absolute;
  z-index: 9900;
  bottom: 0px;
  right: 0px;

  .toast {
    position: relative;
    background-color: white;
    border-radius: 4px;
    box-shadow:
      0 3px 6px rgba(0, 0, 0, 0.16),
      0 3px 6px rgba(0, 0, 0, 0.23);
    margin: 0px 16px 16px 0px;
    min-width: 320px;

    .close {
      position: absolute;
      top: 4px;
      right: 4px;
      cursor: pointer;
      padding: 4px;
      transition: opacity 0.2s ease;
      opacity: 0.75;
      &:hover {
        opacity: 0.95;
      }
      svg {
        display: block;
        width: 16px;
        height: 16px;
      }
    }

    .close {
      position: absolute;
      top: 4px;
      right: 4px;
      cursor: pointer;
      padding: 4px;
      transition: opacity 0.2s ease;
      opacity: 0.75;
      &:hover {
        opacity: 0.95;
      }
      svg {
        display: block;
        width: 16px;
        height: 16px;
      }
    }
  }
}
.toast_fade-enter-active,
.toast_fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.toast_fade-enter-from,
.toast_fade-leave-to {
  opacity: 0;
  transform: translateY(64px);
}

.toast_fade-enter,
.toast_fade-leave-to {
  opacity: 0;
  transform: translateX(64px);
}

.toast_fade-move {
  transition: transform 0.2s ease;
}
/* LEFT */
.toasts_left {
  position: absolute;
  z-index: 9900;
  bottom: 0px;
  left: 0px;

  .toast {
    position: relative;
    background-color: white;
    border-radius: 4px;
    box-shadow:
      0 3px 6px rgba(0, 0, 0, 0.16),
      0 3px 6px rgba(0, 0, 0, 0.23);
    margin: 0px 0px 16px 16px;
    min-width: 320px;

    .close {
      position: absolute;
      top: 4px;
      right: 4px;
      cursor: pointer;
      padding: 4px;
      transition: opacity 0.2s ease;
      opacity: 0.75;
      &:hover {
        opacity: 0.95;
      }
      svg {
        display: block;
        width: 16px;
        height: 16px;
      }
    }
  }
}
.toast_fade_left-enter-active,
.toast_fade_left-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.toast_fade_left-enter-from,
.toast_fade_left-leave-to {
  opacity: 0;
  transform: translateY(64px);
}

.toast_fade_left-enter,
.toast_fade_left-leave-to {
  opacity: 0;
  transform: translateX(-64px);
}

.toast_fade_left-move {
  transition: transform 0.2s ease;
}
</style>
