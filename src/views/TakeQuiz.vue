<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import QuestionServices from "../services/QuestionServices";
import UserAnswerServices from "../services/UserAnswerServices";
import QuizProgress from "../components/QuizTimerComponent.vue";

// const duration = 30;
// const remaining = ref(duration);
const currentIndex = ref(0);
const quizTitle = "American History";
const questions = ref([]);
// const answers = ref([]);
const userAnswers = ref([]); // Stores all user answers
const pollId = 3;
const pollEventUserId = ref(null);
// // UI state
// //const selectedAnswerId = ref({});
const selectedAnswerText = ref("");
// const isFinished = ref(false);

// // Computed properties
const currentQuestion = computed(() => questions.value[currentIndex.value]);
// const progress = computed(
//   () => ((duration - remaining.value) / duration) * 100
// );
// const timerColor = computed(() => (remaining.value <= 10 ? "red" : "green"));

// const isAnswerSelected = computed(() => {
//   return selectedAnswerText.trim().length > 0;
// });

// const isLastQuestion = computed(
//   () => currentIndex.value === questions.value.length - 1
// );

// let interval;

// // Watch for question changes to load existing answers
// watch(currentQuestion, (newQuestion) => {
//   if (newQuestion) {
//     loadExistingAnswer();
//   }
// });

// watch(currentQuestion, (q) => {
//   if (!q) return;

//   const saved = userAnswers.value[q.id];

//   if (q.type === "short_answer") {
//     userAnswers.value = saved || "";
//   }
// } else {
//   selectedAnswerId.value = saved || null;
// }
//});

// function loadExistingAnswer() {
//   const existingAnswer = userAnswers.value.find(
//     (a) => a.questionId === currentQuestion.value.id
//   );

//   if (existingAnswer) {
//     if (currentQuestion.value.type === "short_answer") {
//       selectedAnswerText.value = existingAnswer.answer;
//     }
//     // } else {
//     //   selectedAnswerId.value = existingAnswer.answer;
//     // }
//   } else {
//     selectedAnswerText.value = "";
//     // selectedAnswerId.value = null;
//   }
// }

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
//       answer: selectedAnswerText.value,
//       pollEventUserId: pollEventUserId,
//     };

//     // Update  local answers store
//     const existingIndex = userAnswers.value.findIndex(
//       (a) => a.questionId === currentQuestion.value.id
//     );

//     if (existingIndex >= 0) {
//       userAnswers.value[existingIndex] = answerData;
//     } else {
//       userAnswers.value.push(answerData);
//     }
//     console.log("Submitting:", {
//       questionId: currentQuestion.value.id,
//       ...answerData,
//     });
//     // Submit to backend
//     await UserAnswerServices.CreateUserAnswer(
//       pollEventUserId,
//       currentQuestion.value.id,
//       answerData
//       // Only send necessary data
//     );

//     // Move to next question or finish
//     if (currentIndex.value + 1 < questions.value.length) {
//       currentIndex.value++;
//       startTimer();
//     } else {
//       isFinished.value = true;
//     }
//     console.log(answerData);
//   } catch (error) {
//     console.error("Failed to submit answer:", error.response?.data || error);
//     showSnackbar("error", "Failed to submit answer");
//     startTimer(); // Restart timer if submission fails
//   }
// }

// function nextQuestion() {
//   if (currentIndex.value < questions.value.length - 1) {
//     clearInterval(interval);
//     currentIndex.value++;
//     //startTimer();
//   }
// }

// function prevQuestion() {
//   if (currentIndex.value > 0) {
//     clearInterval(interval);
//     currentIndex.value--;
//     // startTimer();
//   }
// }

// Lifecycle hooks
onMounted(async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  pollEventUserId.value = user?.id;
  await fetchAllQuestions();
  // await fetchAnswersForQuestion();
  // await fetchExistingAnswers();
  //startTimer();
});

//onBeforeUnmount(() => clearInterval(interval));

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
  try {
    const data = {
      answer: selectedAnswerText.value,
      pollEventUserId: pollEventUserId.value,
      questionId: currentQuestion.value.id,
    };

    console.log("Answer payload", data);

    //check if existing answer in the db
    const res = await UserAnswerServices.getUserAnswers(
      pollEventUserId.value,
      currentQuestion.value.id
    );

    //if answer exists update with new value otherwise create a new answer
    const dbAnswers = res.data;

    if (dbAnswers) {
      await UserAnswerServices.UpdateUserAnswer(
        pollEventUserId.value,
        currentQuestion.value.id,
        data
      );
    } else {
      await UserAnswerServices.CreateUserAnswer(
        pollEventUserId.value,
        currentQuestion.value.id,
        data
      );
    }
  } catch (error) {
    console.error(error);
  }
}
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
              v-model="selectedAnswerText"
            >
              <v-radio
                v-for="answer in currentQuestion.answers"
                :key="answer.id"
                :label="answer.text"
                :value="answer.text"
              />
            </v-radio-group>

            <!-- True/False Question -->
            <v-radio-group
              class="ml-6"
              v-else-if="currentQuestion.questionType === 'true_false'"
              v-model="selectedAnswerText"
            >
              <v-radio label="True" :value="true" />
              <v-radio label="False" :value="false" />
            </v-radio-group>

            <!-- Short Answer Question -->
            <v-textarea
              class="ml-8"
              v-else-if="currentQuestion.questionType === 'short_answer'"
              v-model="selectedAnswerText"
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
            <v-btn @click="submitAnswers">Send</v-btn>
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
