<script setup>
import { ref, watch, nextTick } from "vue";
import QRCode from "qrcode";

const props = defineProps({
  value: { type: String, required: true },
  size: { type: Number, default: 256 },
  margin: { type: Number, default: 2 },
  level: { type: String, default: "M", validator: v => ["L","M","Q","H"].includes(v) },
  dark:  { type: String, default: "#000000" },
  light: { type: String, default: "#FFFFFF" },
  showDownload: { type: Boolean, default: false },
  filename: { type: String, default: "qr-code.png" },
});

const canvasRef = ref(null);

function clearCanvas() {
  if (!canvasRef.value) return;
  const c = canvasRef.value;
  const ctx = c.getContext("2d");
  if (ctx) ctx.clearRect(0, 0, c.width, c.height);
}

async function draw() {
  if (!canvasRef.value) return;

  // wait for DOM to apply new width/height, etc.
  await nextTick();

  if (!props.value) {
    clearCanvas();
    return;
  }

  try {
    await QRCode.toCanvas(canvasRef.value, props.value, {
      width: props.size,
      margin: props.margin,
      errorCorrectionLevel: props.level,
      color: { dark: props.dark, light: props.light },
    });
  } catch (e) {
    console.error("QR render failed:", e);
    clearCanvas();
  }
}

// Re-render on mount AND whenever any relevant prop changes
watch(
  () => [props.value, props.size, props.margin, props.level, props.dark, props.light],
  () => { draw(); },
  { immediate: true }
);

function downloadPng() {
  if (!canvasRef.value) return;
  const link = document.createElement("a");
  link.download = props.filename;
  link.href = canvasRef.value.toDataURL("image/png");
  link.click();
}
</script>

<template>
  <div class="qr-wrap">
    <canvas
      ref="canvasRef"
      :width="size"
      :height="size"
      :key="`${size}-${level}-${dark}-${light}`" 
      aria-label="QR code"
    />
    <button v-if="showDownload" class="qr-download" type="button" @click="downloadPng">
      Download
    </button>
  </div>
</template>
