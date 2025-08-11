<script setup>
import { ref, computed, onMounted } from "vue";
import { useSnackbar } from "../composables/useSnackbar.js";

const props = defineProps({
  poll: { required: true, type: Object },
  questions: { required: true, type: Array, default: () => [] },
  correctAnswers: { required: true, type: Object },
  userAnswers: { required: true, type: Object, default: () => ({}) },
});

const emit = defineEmits(["done"]);

const pollQuestions = computed(() =>
  props.questions.filter((q) => q.pollId === props.poll.id)
);

const answeredCount = computed(
  () =>
    pollQuestions.value.filter((q) => props.userAnswers[q.id] !== undefined)
      .length
);

const questionsWithAnswers = computed(() =>
  pollQuestions.value.map((quiz, index) => ({
    ...quiz,
    correctAnswer: props.correctAnswers[quiz.id],
    userAnswer: props.userAnswers[quiz.id],
    correct: props.userAnswers[quiz.id] === props.correctAnswers[quiz.id],
    number: index + 1,
  }))
);

const Score = computed(() => {
  const correctCount = pollQuestions.value.filter(
    (q) => props.userAnswers[q.id] === props.correctAnswers[q.id]
  ).length;
  return pollQuestions.value.length
    ? ((correctCount / pollQuestions.value.length) * 100).toFixed(2)
    : "0.00";
});

function done() {
  emit("done");
}
</script>

<template>
  <v-card class="ma-5" elevation="8">
    <v-card color="primary">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>Quiz Results: {{ poll.name }}</span>
        <v-chip variant="flat" color="white">
          {{ answeredCount }} / {{ questions.length }} Answered
        </v-chip>
        <v-chip variant="flat" color="white" label size="large">
          Score: {{ Score }}%
        </v-chip>
      </v-card-title>
    </v-card>
    <v-card class="pa-5">
      <v-expansion-panels variant="accordion">
        <v-expansion-panel
          v-for="question in questionsWithAnswers"
          :key="question.id"
        >
          <v-expansion-panel-title>
            Question {{ question.number }}: {{ question.text }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <div class="mb-2">
              <span>Correct Answer:</span>
              <v-chip color="primary" class="ma-1" label dark>
                {{ question.correctAnswer }}
              </v-chip>
            </div>
            <div class="mb-2">
              <span>Your Answer:</span>
              <v-chip
                :color="question.correct ? 'blue' : 'error'"
                class="ma-1"
                label
                dark
              >
                {{ question.userAnswer || "None" }}
              </v-chip>

              <v-chip
                :color="question.correct ? 'green' : 'error'"
                class="ma-1"
                label
                dark
              >
                <v-icon start>
                  {{ question.correct ? "mdi-check" : "mdi-close" }}
                </v-icon>
                {{ question.correct ? "Correct" : "Incorrect" }}
              </v-chip>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
      <v-card-actions class="justify-end">
        <v-btn color="primary" @click="done">Done</v-btn>
      </v-card-actions>
    </v-card>
  </v-card>
</template>

<style scoped>
.v-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
