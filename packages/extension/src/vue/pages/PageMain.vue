<script setup lang="ts">
import { computed, onMounted, reactive, watch } from 'vue';

import MessageSimple from '../comp/MessageSimple.vue';

//
</script>

<template>
  <div class="page">
    <div class="page-inner">
      <MessageSimple
        class="mb-4"
        :model="{
          type: 'info',
          title: 'info 1',
          text: `info 2`,
        }"
      ></MessageSimple>
    </div>
  </div>
</template>

<style>
.view-tabs {
  display: flex;
  height: 36px;
  gap: 8px;
  .view-tab {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 4px 8px;
    color: rgba(0, 0, 0, 0.7);
    transition: all 0.2s ease;
    font-size: 0.75rem;
    font-weight: bold;
    border-bottom: 2px solid rgba(0, 25, 94, 0);
    .svg {
      display: block;
      width: 24px;
      height: 24px;
      margin-right: 4px;
      fill: rgba(0, 0, 0, 0.7);
      transition: all 0.2s ease;
    }
    &.active {
      border-bottom: 2px solid rgb(0, 25, 94);
    }
    &:hover {
      color: rgba(0, 0, 0, 9);
      .svg {
        fill: rgba(0, 0, 0, 9);
      }
    }
  }
}
.result-container-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid #eee;
  border-radius: 4px;
  &:nth-child(odd) {
    background-color: #fafafa;
  }
}
</style>
