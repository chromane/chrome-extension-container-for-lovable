<script lang="ts" setup>
import { watch, ref } from "vue";

const props = defineProps<{
  audio_stream: MediaStream;
}>();
let ref_canvas: any = ref(null);

let methods = {
  async visualize(stream) {
    // console_log("visualizer_run");
    // workaround for activating the stream:
    // https://stackoverflow.com/questions/54514273/webrtc-via-web-audio-api-silent-on-google-chrome
    let audio = new Audio();
    audio.srcObject = stream;
    audio.muted = true;
    //
    var canvas_arr = [ref_canvas.value];

    // console_log("canvas_arr", canvas_arr);
    var ctx_arr = canvas_arr.map((canvas) => {
      return canvas.getContext("2d");
    });

    function renderFrame() {
      requestAnimationFrame(renderFrame);
      x = 0;

      analyser.getByteFrequencyData(dataArray);

      // console_log("renderFrame", dataArray);
      ctx_arr.forEach((ctx) => {
        if (!ctx) return;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, WIDTH, HEIGHT);
      });

      for (var i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        var r = 124 * 1; //(barHeight / 80);
        var g = 7 * 1; //(barHeight / 80);
        var b = 60 * 1; //(barHeight / 80);

        ctx_arr.forEach((ctx) => {
          if (!ctx) return;
          ctx.fillStyle = `rgb( ${r}, ${g}, ${b} )`;
          ctx.fillRect(x, HEIGHT - barHeight / 2, barWidth, barHeight);
        });

        x += barWidth + 1;
      }
    }

    var audioCtx = new AudioContext();

    var analyser = audioCtx.createAnalyser();

    let src = audioCtx.createMediaStreamSource(stream);

    src.connect(analyser);
    // analyser.connect( audioCtx.destination );
    analyser.fftSize = 256;

    var bufferLength = analyser.frequencyBinCount;

    var dataArray = new Uint8Array(bufferLength);

    if (canvas_arr[0]) {
      var WIDTH = canvas_arr[0].width;
      var HEIGHT = canvas_arr[0].height;

      var barWidth = (WIDTH / bufferLength) * 2.5;
      var barHeight;
      var x = 0;

      renderFrame();
    }
  },
};
watch(
  () => [props.audio_stream, ref_canvas.value],
  () => {
    // console_log("visualizer_check", props.audio_stream, ref_canvas.value);
    if (props.audio_stream && ref_canvas.value) {
      methods.visualize(props.audio_stream);
    }
  },
  {
    deep: true,
    immediate: true,
  }
);
</script>

<template>
  <canvas ref="ref_canvas" class="audio-visualizer" height="100" width="500">
  </canvas>
</template>

<style>
.audio-visualizer {
  position: relative;

  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;

  border-radius: 4px;

  opacity: 0.6;
}
</style>
