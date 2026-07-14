<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import ctrl from '../../ts/ctrl';
import ctrl_frame from '../../ts/ctrl';
import console_log from '@shared/ts/console_log';
import ctrl_content from '@src/ts/ctrl_content';
let state: any = {
  flag_dragging: false,
  canvas: null,
};
let container_model = reactive({
  width: 0,
  height: 0,
});
let model = reactive({
  //
  offset_x: 0,
  offset_y: 0,
  //
  top: 0,
  left: 0,
  width: 0,
  height: 0,
  //
  image_cropper_active: false,
  //
  canvas_width: 0,
  canvas_height: 0,
  //
});
let ref_image_cropper: any = ref(null);
let ref_canvas_container: any = ref(null);
const props = defineProps<{
  image_url: string;
}>();
let crop_interaction_overlay = ref('crop_interaction_overlay');
const emit = defineEmits<{
  (e: 'image_cropped', data: any): void;
}>();
onMounted(() => {
  ctrl.blocking_inc();
  if (ref_image_cropper.value && props.image_url) {
    let image = document.createElement('img');
    image.addEventListener('load', () => {
      console_log('window', window.innerWidth, window.innerHeight);
      console_log('image', image.naturalWidth, image.naturalHeight);
      console_log('popup', ctrl_content.popup.rect.width, ctrl_content.popup.rect.height);
      // let target_image_width = ctrl_content.popup.rect.width;
      // let target_image_height = target_image_width * (image.naturalHeight / image.naturalWidth);
      // let rect = ref_image_cropper.value.getBoundingClientRect();
      let canvas: HTMLCanvasElement = document.createElement('canvas');
      state.canvas = canvas;
      // available with for the image cropper
      // is window width minues paddings, minus possible scroller width;
      let avail_width = ctrl_content.popup.rect.width;
      let canvas_width = avail_width;
      model.canvas_width = canvas_width;
      canvas.width = canvas_width;
      let ratio = image.naturalHeight / image.naturalWidth;
      let canvas_height = canvas_width * ratio;
      model.canvas_height = canvas_height;
      canvas.height = canvas_height;
      console_log('canvas', canvas_width, canvas_height);
      let ctx = canvas.getContext('2d');
      ctx?.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, canvas_width, canvas_height);
      ref_canvas_container.value.append(canvas);
      //
      container_model.width = canvas.width;
      container_model.height = canvas.height;
      ctrl.blocking_dec();
    });
    image.src = props.image_url;
  }
});
// todo: implement bottom-to-top selection
// methods
function img_to_cropped_data_url(img, rect) {
  let { top, left, width, height } = rect;
  var canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  var context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, width, height);
    context.drawImage(img, left, top, width, height, 0, 0, width, height);
  }
  return canvas.toDataURL('image/png');
}
async function handle_mousedown(event: MouseEvent) {
  state.flag_dragging = true;
  model.image_cropper_active = true;
  model.offset_x = event.offsetX;
  model.offset_y = event.offsetY;
}
async function handle_mousemove(event: MouseEvent) {
  if (state.flag_dragging) {
    //
    if (model.offset_x < event.offsetX) {
      model.left = model.offset_x;
      model.width = event.offsetX - model.offset_x;
    } else {
      model.left = event.offsetX;
      model.width = model.offset_x - event.offsetX;
    }
    //
    if (model.offset_y < event.offsetY) {
      model.top = model.offset_y;
      model.height = event.offsetY - model.top;
    } else {
      model.top = event.offsetY;
      model.height = model.offset_y - event.offsetY;
    }
    //
  }
}
async function handle_mouseup(event: MouseEvent) {
  state.flag_dragging = false;
  if (model.width > 100 && model.height > 100) {
    let data_url = await img_to_cropped_data_url(state.canvas, model);
    emit('image_cropped', { data_url });
  } else {
    ctrl_frame.toasts.show_toast({
      type: 'warning',
      title: 'Area too small',
      text: 'Please select a larger area for processing.',
    });
    model.image_cropper_active = false;
    model.width = 0;
    model.height = 0;
  }
}
//
</script>

<template>
  <div
    ref="ref_image_cropper"
    class="image-cropper"
    :style="{
      width: '100%',
      height: 'fit-content',
    }"
  >
    <div
      class="inner"
      :style="{
        width: model.canvas_width + 'px',
        height: model.canvas_height + 'px',
      }"
    >
      <div ref="ref_canvas_container" class="canvas-container"></div>
      <div
        class="crop-area"
        :class="{
          active: model.image_cropper_active,
        }"
        :style="{
          top: model.top + 'px',
          left: model.left + 'px',
          width: model.width + 'px',
          height: model.height + 'px',
        }"
      ></div>
      <div
        ref="crop_interaction_overlay"
        class="crop-interaction-overlay"
        v-on:mousedown="handle_mousedown"
        v-on:mousemove="handle_mousemove"
        v-on:mouseup="handle_mouseup"
      ></div>
    </div>
  </div>
</template>

<style>
.image-cropper {
  position: relative;
  .inner {
    position: relative;
  }
  .canvas-container {
    position: absolute;
    top: 0px;
    left: 0px;
  }
  .screenshot-original {
    border-radius: 4px;
    border: 1px solid rgba(0, 0, 0, 0.12);
  }
  .crop-area {
    position: absolute;
    top: 24px;
    left: 24px;
    width: 420px;
    height: 420px;
    border: 1px solid rgba(0, 0, 0, 0.75);
    background-color: rgba(0, 0, 0, 0.25);
    opacity: 0;
    &.active {
      opacity: 1;
    }
  }
  .crop-interaction-overlay {
    position: absolute;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    z-index: 99;
    background-color: rgba(17, 24, 39, 0.1);
  }
}
</style>
