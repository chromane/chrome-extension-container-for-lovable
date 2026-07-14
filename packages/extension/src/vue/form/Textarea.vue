<script setup lang="ts">
import { onMounted, reactive, watch, ref } from 'vue';
const emit = defineEmits<{
  (e: 'change_event', data: any): void;
}>();
const input_ref = ref<any>(null);
const props = defineProps<{
  title: string;
  name: string;
  initial_value: any;
  form_state: any;
}>();

onMounted(() => {
  if (props.initial_value && input_ref.value) {
    input_ref.value.value = props.initial_value;
  }
});

watch(
  () => props.initial_value,
  () => {
    if (props.initial_value && input_ref.value) {
      input_ref.value.value = props.initial_value;
    }
  }
);
function handle_input() {
  if (input_ref.value && input_ref.value.value) {
    emit('change_event', input_ref.value.value);
  }
}
</script>

<template>
  <textarea
    :data-qa="props.name"
    ref="input_ref"
    type="text"
    class="form-control form-control-textarea"
    autocomplete="chrome-off"
    v-bind:placeholder="title"
    v-on:input="handle_input"
  ></textarea>
</template>

<style>
.form-control-textarea {
  direction: ltr !important;
  min-height: 120px;
  height: 120px;
  resize: vertical !important;
  transition: none !important;
}
</style>
