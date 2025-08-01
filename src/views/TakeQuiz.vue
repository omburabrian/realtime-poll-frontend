<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import QuestionServices from "../services/QuestionServices";
import AnswerServices from "../services/AnswerServices";

const duration = 30;
const remaining = ref(duration);
const currentIndex = ref(0);
const quizTitle = "American History";
const questions = ref([]);
const answers = ref([]);
const userAnswers = ref([]); // Stores all user answers
const pollId = 2;
// UI state
const selectedAnswerId = ref({});
const answerText = ref("");
const isFinished = ref(false);

// Computed properties
const currentQuestion = computed(() => questions.value[currentIndex.value]);
const progress = computed(
  () => ((duration - remaining.value) / duration) * 100
);
const timerColor = computed(() => (remaining.value <= 10 ? "red" : "green"));

const isAnswerSelected = computed(() => {
  if (!currentQuestion.value) return false;
  return currentQuestion.value.type === "short_answer"
    ? answerText.value.trim() !== ""
    : selectedAnswerId.value !== null;
});

const isLastQuestion = computed(
  () => currentIndex.value === questions.value.length - 1
);

let interval;

// Watch for question changes to load existing answers
watch(currentQuestion, (newQuestion) => {
  if (newQuestion) {
    loadExistingAnswer();
  }
});

watch(currentQuestion, (q) => {
  if (!q) return;

  const saved = userAnswers.value[q.id];

  if (q.type === "short_answer") {
    userAnswers.value = saved || "";
  } else {
    selectedAnswerId.value = saved || null;
  }
});

function loadExistingAnswer() {
  const existingAnswer = userAnswers.value.find(
    (a) => a.questionId === currentQuestion.value.id
  );

  if (existingAnswer) {
    if (currentQuestion.value.type === "short_answer") {
      answerText.value = existingAnswer.answer;
    } else {
      selectedAnswerId.value = existingAnswer.answer;
    }
  } else {
    answerText.value = "";
    selectedAnswerId.value = null;
  }
}

// function startTimer() {
//   remaining.value = duration;
//   clearInterval(interval);
//   interval = setInterval(() => {
//     remaining.value--;
//     if (remaining.value <= 0) {
//       clearInterval(interval);
//       submitAndNext();
//     }
//   }, 1000);
// }

// async function submitAndNext() {
//   clearInterval(interval);

//   try {
//     const answerData = {
//       questionId: currentQuestion.value.id,
//       answer:
//         currentQuestion.value.type === "short_answer"
//           ? answerText.value
//           : selectedAnswerId.value,
//       pollEventUserUserId: 1, // Replace with actual user ID from auth
//       questionType: currentQuestion.value.type,
//     };

//     // Update local answers store
//     const existingIndex = userAnswers.value.findIndex(
//       (a) => a.questionId === currentQuestion.value.id
//     );

//     if (existingIndex >= 0) {
//       userAnswers.value[existingIndex] = answerData;
//     } else {
//       userAnswers.value.push(answerData);
//     }

//     // Submit to backend
//     await AnswerServices.create(answerData);

//     // Move to next question or finish
//     if (currentIndex.value + 1 < questions.value.length) {
//       currentIndex.value++;
//       startTimer();
//     } else {
//       isFinished.value = true;
//     }
//   } catch (error) {
//     console.error("Failed to submit answer:", error);
//     showSnackbar("error", "Failed to submit answer");
//     startTimer(); // Restart timer if submission fails
//   }
// }

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    clearInterval(interval);
    currentIndex.value++;
    //startTimer();
  }
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    clearInterval(interval);
    currentIndex.value--;
    // startTimer();
  }
}

// Lifecycle hooks
onMounted(async () => {
  await fetchQuestions();
  //await fetchAnswers();
  // await fetchExistingAnswers();
  //startTimer();
});

onBeforeUnmount(() => clearInterval(interval));

// Snackbar functionality
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

function showSnackbar(color, text) {
  snackbar.value = {
    value: true,
    color: color,
    text: text,
  };
}

function closeSnackBar() {
  snackbar.value.value = false;
}

// fetch questions from backend

async function fetchQuestions() {
  try {
    const response = await QuestionServices.getQuestionsForPoll(pollId);
    questions.value = response.data.map((q) => ({
      ...q,
      answers: q.answers || [],
    }));
    console.log("Fetched questions:", questions.value);
  } catch (error) {
    console.error("Failed to fetch questions:", error);
    showSnackbar("error", "Failed to fetch questions");
  }
}

// async function fetchExistingAnswers() {
//   try {
//     const response = await AnswerServices.getAnswersForQuestion(6);
//     console.log("Fetched answers:", response.data); // Replace with actual user ID
//     userAnswers.value = response.data;
//     loadExistingAnswer(); // Load answer for first question
//   } catch (error) {
//     console.error("Failed to fetch existing answers:", error);
//   }
// }
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <!-- Quiz in progress -->
        <v-card
          v-if="!isFinished && questions.length > 0"
          class="mt-15"
          elevation="10"
        >
          <v-card color="primary" class="rounded-lg mb-5 elevation-5">
            <v-card-title class="d-flex px-5 py-5 justify-space-between">
              <span>Quiz Title: {{ quizTitle }}</span>
              <span>Questions: {{ questions.length }}</span>
            </v-card-title>
          </v-card>

          <v-card-title class="text-h6 text-center">
            Question {{ currentIndex + 1 }} of {{ questions.length }}
          </v-card-title>

          <v-card-text class="ma-3">
            <p class="text-h6 mb-4">
              Q{{ currentQuestion.questionNumber }}: {{ currentQuestion.text }}
            </p>

            <!-- Multiple Choice Question -->
            <v-radio-group
              class="ml-6"
              v-if="currentQuestion.questionType === 'multiple_choice'"
              v-model="selectedAnswerId"
            >
              <v-radio
                v-for="answer in currentQuestion.answers"
                :key="answer.id"
                :label="answer.text"
                :value="answer.id"
              />
            </v-radio-group>

            <!-- True/False Question -->
            <v-radio-group
              class="ml-6"
              v-else-if="currentQuestion.questionType === 'true_false'"
              v-model="selectedAnswerId"
            >
              <v-radio label="True" :value="true" />
              <v-radio label="False" :value="false" />
            </v-radio-group>

            <!-- Short Answer Question -->
            <v-textarea
              class="ml-8"
              v-else-if="currentQuestion.questionType === 'short_answer'"
              v-model="selectedAnswerId"
              label="Enter Answer"
              rows="3"
            />
          </v-card-text>

          <v-card-actions class="justify-space-between mb-5 px-4">
            <v-btn
              @click="prevQuestion"
              color="primary"
              :style="{ visibility: currentIndex === 0 ? 'hidden' : 'visible' }"
            >
              Previous
            </v-btn>

            <v-progress-circular
              class=""
              :model-value="progress"
              :size="100"
              :width="15"
              :color="timerColor"
            >
              {{ remaining }}s
            </v-progress-circular>

            <v-btn
              @click="nextQuestion"
              color="primary"
              :disabled="!isAnswerSelected"
            >
              {{ isLastQuestion ? "Finish" : "Next" }}
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Quiz completed -->
        <v-card v-else-if="isFinished" class="mt-15" elevation="10">
          <v-card-title class="text-h5 text-center font-weight-bold">
            Quiz Completed
          </v-card-title>
          <v-card-text class="text-h6 text-center">
            Thank you for participating!
          </v-card-text>
        </v-card>

        <!-- Loading state -->
        <v-card v-else class="mt-15" elevation="10">
          <v-card-text class="text-h6 text-center py-10">
            Loading questions...
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>
