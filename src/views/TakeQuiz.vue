<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const duration = 30;
const remaining = ref(duration);
const currentIndex = ref(0);
const quizTitle = "American History";
const questions = ref([
  {
    questionNumber: 1,
    text: "What is the capital of Kenya?",
    type: "multiple_choice",
    choices: [
      { id: 1, text: "Somali" },
      { id: 2, text: "Burundi" },
      { id: 3, text: "Nairobi" },
      { id: 4, text: "Malawi" },
    ],
  },
  {
    questionNumber: 2,
    text: "The Earth is flat.",
    type: "true_false",
  },
  {
    questionNumber: 3,
    text: "Explain how photosynthesis works.",
    type: "short_answer",
  },
]);

const selectedChoiceId = ref(null);
const answerText = ref("");
const isFinished = ref(false);

const currentQuestion = computed(() => questions.value[currentIndex.value]);
const progress = computed(
  () => ((duration - remaining.value) / duration) * 100
);
const timerColor = computed(() => {
  return remaining.value <= 10 ? "red" : "green";
});

let interval;

function startTimer() {
  remaining.value = duration;
  clearInterval(interval);
  interval = setInterval(() => {
    if (remaining.value > 0) {
      remaining.value--;
    } else {
      submitAndNext();
    }
  }, 1000);
}

function submitAndNext() {
  clearInterval(interval);

  // Capture answer (could also send to backend here)
  const answer = {
    question: currentQuestion.value.text,
    answer:
      currentQuestion.value.type === "short_answer"
        ? answerText.value
        : selectedChoiceId.value,
  };
  console.log("Submitted:", answer);

  // Reset inputs
  selectedChoiceId.value = null;
  answerText.value = "";

  // Next question or finish
  if (currentIndex.value + 1 < questions.value.length) {
    currentIndex.value++;
    startTimer();
  } else {
    isFinished.value = true;
  }
}

onMounted(startTimer);
onBeforeUnmount(() => clearInterval(interval));
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card v-if="!isFinished" class="mt-15" elevation="10">
          <v-card color="primary" class="rounded-lg mb-5 elevation-5"
            ><v-card-title class="d-flex px-5 py-5 justify-space-between"
              ><span>Quiz Title: {{ quizTitle }}</span>
              <span>Questions: {{ questions.length }}</span></v-card-title
            ></v-card
          >
          <v-card-title class="text-h6 text-center">
            Question {{ currentIndex + 1 }} of {{ questions.length }}
          </v-card-title>

          <v-card-text class="ma-3">
            <p class="text-h6 mb-4">
              Q{{ currentQuestion.questionNumber }}: {{ currentQuestion.text }}
            </p>

            <!-- Multiple Choice Question Type -->
            <v-radio-group
              class="ml-6"
              v-if="currentQuestion.type === 'multiple_choice'"
              v-model="selectedChoiceId"
            >
              <v-radio
                v-for="choice in currentQuestion.choices"
                :key="choice.id"
                :label="choice.text"
                :value="choice.id"
              />
            </v-radio-group>

            <!-- True/False Question Type-->
            <v-radio-group
              class="ml-6"
              v-else-if="currentQuestion.type === 'true_false'"
              v-model="selectedChoiceId"
            >
              <v-radio label="True" :value="true" />
              <v-radio label="False" :value="false" />
            </v-radio-group>

            <!-- Short Answer Question Type-->
            <v-textarea
              class="ml-8"
              v-else-if="currentQuestion.type === 'short_answer'"
              v-model="answerText"
              label="Enter Answer"
              rows="3"
            />
          </v-card-text>

          <v-card-actions class="justify-center mb-5">
            <v-progress-circular
              :model-value="progress"
              :size="100"
              :width="15"
              :color="timerColor"
            >
              {{ remaining }}s
            </v-progress-circular>
          </v-card-actions>
        </v-card>

        <v-card v-else class="mt-15" elevation="10">
          <v-card-title class="text-h5 text-center font-weight-bold"
            >Quiz Completed</v-card-title
          >
          <v-card-text class="text-h6 text-center"
            >Thank you for your participating!</v-card-text
          >
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
