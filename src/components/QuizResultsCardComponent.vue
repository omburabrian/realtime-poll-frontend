<script setup>
import { ref, computed, onMounted } from "vue";

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
    correctAnswer:
      quiz.questionType === "open_ended" ? null : props.correctAnswers[quiz.id],
    userAnswer: props.userAnswers[quiz.id],
    correct:
      quiz.questionType === "open_ended"
        ? null
        : props.userAnswers[quiz.id] === props.correctAnswers[quiz.id],
    number: index + 1,
  }))
);

const scoredQuestions = computed(() =>
  pollQuestions.value.filter((q) => q.type !== "open_ended")
);

const Score = computed(() => {
  const correctCount = scoredQuestions.value.filter(
    (q) => props.userAnswers[q.id] === props.correctAnswers[q.id]
  ).length;
  return scoredQuestions.value.length
    ? ((correctCount / scoredQuestions.value.length) * 100).toFixed(2)
    : "0.00";
});

function done() {
  emit("done");
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card class="ma-5" elevation="8">
          <v-card color="primary">
            <v-card-title class="d-flex justify-space-between align-center">
              <span>Quiz Results</span>
              <span
                >Date Taken:
                {{ new Date(poll.createdAt).toLocaleDateString() }}</span
              >
              <span>Title: {{ poll.name }}</span>
              <v-chip variant="flat" color="white">
                {{ answeredCount }} / {{ questions.length }} Answered
              </v-chip>
              <v-chip
                v-if="!poll.isPublic"
                variant="flat"
                color="white"
                label
                size="large"
              >
                Score: {{ Score }}%
              </v-chip>
            </v-card-title>
          </v-card>
          <v-card class="pa-5">
            <v-expansion-panels
              variant="accordion"
              color="secondary"
              rounded="md"
            >
              <v-expansion-panel
                v-for="question in questionsWithAnswers"
                :key="question.id"
              >
                <v-expansion-panel-title class="ma-2">
                  Question {{ question.number }}: {{ question.text }}
                </v-expansion-panel-title>
                <v-expansion-panel-text>
                  <div
                    class="mb-2"
                    v-if="question.questionType !== 'open_ended'"
                  >
                    <span>Question Answers:</span>
                    <div class="d-flex flex-wrap mt-2">
                      <v-chip
                        v-for="(answer, index) in question.answers"
                        :key="answer.id"
                        class="ma-1"
                        outlined
                      >
                        {{ String.fromCharCode(65 + index) }}. {{ answer.text }}
                      </v-chip>
                    </div>

                    <span>Your Answer:</span>
                    <v-chip color="blue" class="ma-1" outlined>
                      {{ question.userAnswer || "None" }} </v-chip
                    ><v-chip
                      :color="question.correct ? 'green' : 'error'"
                      class="ma-1"
                      outlined
                    >
                      <v-icon start>
                        {{ question.correct ? "mdi-check" : "mdi-close" }}
                      </v-icon>
                      {{ question.correct ? "Correct" : "Incorrect" }}
                    </v-chip>
                  </div>
                  <div v-else>
                    <span>Your Response: </span>
                    <span class="ma-1">{{
                      question.userAnswer || "None"
                    }}</span>
                  </div>
                </v-expansion-panel-text>
              </v-expansion-panel>
            </v-expansion-panels>
            <v-card-actions class="justify-center mt-5">
              <v-btn color="primary" variant="elevated" @click="done"
                >Take Another Quiz</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.v-list-item {
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}
</style>
