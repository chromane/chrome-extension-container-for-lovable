<script setup lang="ts">
import showdown from "showdown";
import console_log from "@shared/ts/console_log";
var converter = new showdown.Converter();
let text = "# hello, markdown!";
let html = converter.makeHtml(text);
console_log(html);
//
</script>

<template>
  <div class="page popup"></div>
</template>

<style>
.page.popup {
  background-color: white;
  .mb-2 {
    margin-bottom: 12px;
  }
}
</style>
