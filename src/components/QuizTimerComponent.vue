<template>
  <v-progress-circular
    :model-value="progress"
    :size="100"
    :width="15"
    :color="timerColor"
  >
    {{ remaining }}s
  </v-progress-circular>
</template>

<script setup>
defineProps({
  progress: Number,
  remaining: Number,
  timerColor: String,
});
</script>
