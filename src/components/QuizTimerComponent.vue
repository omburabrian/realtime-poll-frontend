<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";

const props = defineProps({
  duration: {
    type: Number,
    default: 30,
  },
  isRunning: {
    type: Boolean,
    default: true,
  },
  questionId: { type: Number, required: true },
});

const emit = defineEmits(["timeUp"]);

const remaining = ref(props.duration);
let timer = null;
const progress = computed(
  () => ((props.duration - remaining.value) / props.duration) * 100
);
const timerColor = computed(() => (remaining.value <= 10 ? "red" : "teal"));

watch(
  () => props.questionId,
  () => {
    resetTimer();
  }
);

function startTimer() {
  stopTimer();
  remaining.value = props.duration;
  timer = setInterval(() => {
    if (props.isRunning && remaining.value > 0) {
      remaining.value--;
      if (remaining.value <= 0) {
        emit("timeUp");
        stopTimer();
      }
    }
  }, 1000);
}

function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

function resetTimer() {
  remaining.value = props.duration;
  if (props.isRunning) {
    startTimer();
  }
}

onMounted(() => {
  startTimer();
});

onBeforeUnmount(() => {
  stopTimer();
});
</script>
<template>
  <v-progress-circular
    :model-value="progress"
    :size="100"
    :width="20"
    :color="timerColor"
  >
    {{ remaining }}s
  </v-progress-circular>
</template>
