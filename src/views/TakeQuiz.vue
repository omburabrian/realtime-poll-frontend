<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import QuestionServices from "../services/QuestionServices";
import UserAnswerServices from "../services/UserAnswerServices";
import QuizProgress from "../components/QuizTimerComponent.vue";

const duration = 10;
const remaining = ref(duration);
const currentIndex = ref(0);

const quizTitle = "American History";

const questions = ref([]);
// const answers = ref([]);
const userAnswers = ref([]); // Stores all user answers
const pollId = 17;

const user = ref(null);
const pollEventUserId = ref(null);

// //const selectedAnswerId = ref({});
const answerText = ref("");
const isFinished = ref(false);

// // Computed properties
const currentQuestion = computed(() => questions.value[currentIndex.value]);
const progress = computed(
  () => ((duration - remaining.value) / duration) * 100
);
const timerColor = computed(() => (remaining.value <= 10 ? "red" : "green"));

const isAnswerSelected = computed(() => {
  return answerText.length > 0;
});

const isLastQuestion = computed(
  () => currentIndex.value === questions.value.length - 1
);

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  pollEventUserId.value = user.value.id;
  await fetchAllQuestions();
  // await fetchAnswersForQuestion();
  // await fetchExistingAnswers();
  startTimer();
});

function startTimer() {
  remaining.value = duration;
  clearInterval(interval);
  interval = setInterval(() => {
    remaining.value--;
    if (remaining.value <= 0) {
      clearInterval(interval);
      submitAnswers();
    }
  }, 1000);
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    clearInterval(interval);
    currentIndex.value++;
    answerText.value = null;
    startTimer();
  } else {
    finishQuiz();
  }
}

function prevQuestion() {
  if (currentIndex.value > 0) {
    clearInterval(interval);
    currentIndex.value--;
    startTimer();
  }
}

function finishQuiz() {
  showSnackbar("green", "You've reached the end of questions");
}
let interval;

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

async function fetchAllQuestions() {
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

async function submitAnswers() {
  const answerPayLoad = {
    pollEventUserId: pollEventUserId.value,
    questionId: currentQuestion.value.id,
    answer: answerText.value,
  };
  // console.log("Answer payload", answerPayLoad);
  try {
    await UserAnswerServices.CreateUserAnswer(answerPayLoad);
  } catch (error) {
    console.log(error);
    showSnackbar(
      "error",
      "This question has already been answered for this poll participation"
    );
    //return;
  }
  nextQuestion();
}
</script>

<template>
  <v-container style="min-width: 320px">
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
              v-if="currentQuestion.questionType === 'multiple_choice'"
              v-model="answerText"
              class="ml-6"
            >
              <div v-for="answer in currentQuestion.answers" :key="answer.id">
                <v-card
                  class="mb-2 answer-card"
                  :class="{
                    'answer-card--selected': answerText === answer.text,
                  }"
                  variant="tonal"
                  @click="answerText = answer.text"
                >
                  <v-card-text class="py-3 text-center">
                    {{ answer.text }}
                  </v-card-text>
                </v-card>
              </div>
            </v-radio-group>

            <!-- True/False Question -->
            <v-item-group
              v-else-if="currentQuestion.questionType === 'true_false'"
              v-model="answerText"
              class="ml-6"
            >
              <v-item value="true">
                <template #default="{ isSelected, toggle }">
                  <v-card
                    class="mb-2 answer-card"
                    :class="{ 'answer-card--selected': isSelected }"
                    variant="tonal"
                    @click="toggle"
                  >
                    <v-card-text class="py-3 text-center"> True </v-card-text>
                  </v-card>
                </template>
              </v-item>

              <v-item value="false">
                <template #default="{ isSelected, toggle }">
                  <v-card
                    class="mb-2 answer-card"
                    :class="{ 'answer-card--selected': isSelected }"
                    variant="tonal"
                    @click="toggle"
                  >
                    <v-card-text class="py-3 text-center"> False </v-card-text>
                  </v-card>
                </template>
              </v-item>
            </v-item-group>

            <!-- Short Answer Question -->
            <v-textarea
              class="ml-8"
              v-else-if="currentQuestion.questionType === 'short_answer'"
              v-model="answerText"
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

            <QuizProgress
              :progress="progress"
              :remaining="remaining"
              :timerColor="timerColor"
            />

            <v-btn
              @click="nextQuestion"
              color="primary"
              :disabled="!isAnswerSelected"
            >
              {{ isLastQuestion ? "Finish" : "Next" }}
            </v-btn>
            <!-- <v-btn @click="submitAnswers">Send</v-btn> -->
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
<style>
.answer-card {
  border-radius: 2px;
  cursor: pointer;
}

.answer-card--selected {
  background: #7b0d0d;
  color: #fff;
}
</style>
