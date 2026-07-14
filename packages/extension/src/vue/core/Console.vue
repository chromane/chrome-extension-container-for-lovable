<script setup lang="ts">
import { reactive } from 'vue';
import ctrl from '@src/ts/ctrl_admin';
let model = reactive({
  console_text: '',
});
</script>

<template>
  <div class="console">
    <input
      type="text"
      data-qa="console"
      v-model="model.console_text"
      v-on:keyup="
        (event) => {
          if (event.key === 'Enter') {
            let text = model.console_text;
            model.console_text = '';
            ctrl.handle_console_input(text);
          }
        }
      "
    />
  </div>
</template>

<style>
.console {
  height: 32px;
  input {
    display: block;
    width: 100%;
    height: 100%;
    background-color: black;
    color: white;
    font-size: 15px;
    padding: 0px 8px;
    font-family: monospace;
    outline: none;
  }
}
</style>
