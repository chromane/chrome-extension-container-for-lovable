<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
let emit = defineEmits<{
  (e: 'change_event', data: any): void;
}>();

const props = defineProps<{
  form_state: any;
  form_field: any;
}>();

let model = reactive({
  active: false,
});

watch(
  () => [props.form_state[props.form_field.name]],
  () => {
    model.active = props.form_state[props.form_field.name];
  },
  {
    immediate: true,
  }
);

function handle_click() {
  model.active = !model.active;
  props.form_state[props.form_field.name] = model.active;
}
</script>

<template>
  <div class="custom-toggle display-flex" :class="{ active: model.active }" @click="handle_click">
    <div class="flex-auto flex-col">
      <div class="label" v-text="props.form_field.title"></div>
      <div class="label-description" v-text="props.form_field.description"></div>
    </div>
    <div class="custom-toggle-bar">
      <div class="custom-toggle-knob"></div>
    </div>
  </div>
</template>

<style>
.label-description {
  margin-right: 12px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
}
.custom-toggle {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  width: 100%;
  user-select: none;
  cursor: pointer;
  padding: 12px 12px;
  border-radius: 4px;
  background: #dadce000;
  transition: all 0.2s ease;
}
.custom-toggle:hover {
  background: #dadce0ff;
}

.custom-toggle__text {
  font-style: normal;
  font-weight: normal;
  font-size: 16px;
  line-height: 24px;
  letter-spacing: 0.2px;
  color: #1967d2;
}

.custom-toggle-bar {
  position: relative;
  height: 16px;
  width: 34px;
  border-radius: 80px;
  background-color: #bdc1c6;
  transition: all 80ms linear;
  flex-shrink: 0;
}

.custom-toggle-knob {
  position: absolute;
  top: 50%;
  transform: translate(0, -50%);
  left: -4px;
  height: 19px;
  width: 19px;
  border-radius: 50%;
  background-color: white;
  transition: all 80ms linear;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.4);
}
.custom-toggle-knob:active {
  box-shadow: 0px 0px 2px 7px rgb(223 222 222 / 30%);
}
.custom-toggle.active .custom-toggle-bar {
  background-color: rgb(26, 115, 232, 0.5);
}

.custom-toggle.active .custom-toggle-knob {
  left: calc(34px - 14px);
  background: #1a73e8;
  opacity: 1 !important;
}
.custom-toggle.active .custom-toggle-knob:active {
  box-shadow: 0px 0px 2px 7px rgb(26, 115, 232, 0.3);
}
.custom-toggle.reverse {
  flex-direction: row-reverse;
}
</style>
