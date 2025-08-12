<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import QuestionServices from "../services/QuestionServices";
import UserAnswerServices from "../services/UserAnswerServices";
import QuizProgress from "../components/QuizTimerComponent.vue";
import QuizResultsCardComponent from "../components/QuizResultsCardComponent.vue";
import AnswerServices from "../services/AnswerServices";
import PollEventServices from "../services/PollEventServices"; // <-- use poll event
import PollEventUserServices from "../services/PollEventUserServices";

// State
const remaining = ref(0);
const currentIndex = ref(0);
const questions = ref([]);

const pollEvent = ref(null);          // entire event response
const poll = computed(() => pollEvent.value?.poll ?? {}); // nested poll
const pollId = computed(() => poll.value?.id ?? null);    // derived id

const user = ref(null);
const pollEventUserId = ref(null);    // e.g., your user id for answers
const isQuizRunning = ref(true);
const answerText = ref("");
const showResults = ref(false);
const userAnswers = ref({});
const correctAnswers = ref({});

const route = useRoute();

// Derived
const currentQuestion = computed(() => questions.value[currentIndex.value]);
const isLastQuestion = computed(
  () => currentIndex.value === questions.value.length - 1
);

// Lifecycle
onMounted(async () => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    user.value = JSON.parse(storedUser);
    pollEventUserId.value = await getPollEventUserId(route.params.id, user.value.id);
    console.log("Poll Event User ID:", pollEventUserId.value);

  } else {
    showSnackbar("error", "No user found");
    return;
  }

  // Load event -> sets poll/pollId via computeds
  const eventId = route.params.id; // usually a string
  await loadPollEvent(eventId);

  // Now that pollId is available, load questions
  await fetchAllQuestions();
  isQuizRunning.value = true;
});

// Loaders
async function loadPollEvent(eventId) {
  try {
    const { data } = await PollEventServices.getPollEventById(eventId);
    pollEvent.value = data;
    remaining.value = poll.value?.secondsPerQuestion ?? 30;
    // console.log("Poll Event Data:", JSON.parse(JSON.stringify(pollEvent.value)));
  } catch (error) {
    console.error(error);
    showSnackbar("error", "Failed to fetch poll event");
  }
}

async function getPollEventUserId(pollEventId, userId) {
  try {
    const response = await PollEventUserServices.getByEventAndUser(
      pollEventId,
      userId
    );
    return response.data.id; // Assuming this returns the correct ID
  } catch (error) {
    console.error(error);
    showSnackbar("error", "Failed to fetch poll event user ID");
    return await addPollEventUser(pollEventId, userId);
  }
}

async function addPollEventUser(pollEventId, userId) {
  try {
    const response = await PollEventUserServices.addPollEventUser({
    userId: userId,
    pollEventId: pollEventId,
      
    });
    return response.data.id; // Assuming this returns the correct ID
  } catch (error) {
    console.error(error);
    showSnackbar("error", "Failed to add poll event user");
    return null;
  }
}

async function fetchAllQuestions() {
  if (!pollId.value) return;
  try {
    const response = await QuestionServices.getQuestionsForPoll(pollId.value);
    const result = response.data || [];
    questions.value = result.map((q) => ({
      ...q,
      answers: q.answers || [],
    }));
  } catch (error) {
    console.error(error);
    showSnackbar("error", "Failed to fetch questions");
  }
}

async function fetchCorrectAnswers() {
  const answersMap = {};
  for (const question of questions.value) {
    try {
      const response = await AnswerServices.getAnswersForQuestion(question.id);
      const correct = (response.data || []).find((ans) => ans.isCorrectAnswer);
      if (correct) {
        answersMap[question.id] = correct.text;
      }
    } catch (error) {
      console.error(error);
      showSnackbar("error", "Error fetching correct answers");
    }
  }
  correctAnswers.value = answersMap;
}

async function fetchUserAnswers() {
  try {
    const response = await UserAnswerServices.GetUserAnswersForPoll(
      pollEventUserId.value
    );
    const answersObj = {};
    for (const answer of response.data || []) {
      answersObj[answer.questionId] = answer.answer;
    }
    userAnswers.value = answersObj;
  } catch (error) {
    console.error(error);
    showSnackbar("error", "Failed to fetch user answers");
  }
}

async function submitAnswers() {
  const q = currentQuestion.value;
  const answerPayLoad = {
    pollEventUserId: pollEventUserId.value,
    questionId: q?.id,
    answer: answerText.value,
  };
  try {
    if (!answerText.value) {
      showSnackbar("error", "No answer selected");
    } else {
      await UserAnswerServices.CreateUserAnswer(answerPayLoad);
      showSnackbar("green", "Answer saved");
    }
  } catch (error) {
    console.error(error);
    showSnackbar("error", "Error saving answer");
  }
  nextQuestion();
}

function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++;
    answerText.value = "";
  } else {
    finishQuiz();
  }
}

function finishQuiz() {
  showSnackbar("green", "You've reached the end of the quiz");
  isQuizRunning.value = false;
  fetchUserAnswers();
  fetchCorrectAnswers();
}



// Snackbar
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

function showSnackbar(color, text) {
  snackbar.value = { value: true, color, text };
}

function closeSnackBar() {
  snackbar.value = { ...snackbar.value, value: false };
}
</script>

<template>
  <v-container style="min-width: 320px">
    <v-row>
      <v-col cols="12">
        <!-- Quiz Card -->
        <v-card
          v-if="!showResults && questions.length > 0 && isQuizRunning"
          class="mt-15"
          elevation="10"
        >
          <v-card color="primary" class="rounded-lg mb-5 elevation-5">
            <v-card-title class="d-flex pa-5 justify-space-between">
              <span>Quiz Title: {{ poll.name }}</span>
              <span>Questions: {{ questions.length }}</span>
            </v-card-title>
          </v-card>

          <v-card-title class="text-h6 text-center">
            Question {{ currentIndex + 1 }} of {{ questions.length }}
          </v-card-title>

          <v-card-text class="ma-10">
            <p class="text-h6 mb-5">
              Q{{ currentQuestion?.questionNumber }}:
              {{ currentQuestion?.text }}
            </p>

            <!-- Multiple Choice -->
            <v-radio-group
              v-if="currentQuestion?.questionType === 'multiple_choice'"
              v-model="answerText"
            >
              <div v-for="answer in currentQuestion.answers" :key="answer.id">
                <v-card
                  class="mb-3 answer-card"
                  :class="{ 'answer-card--selected': answerText === answer.text }"
                  variant="tonal"
                  @click="answerText = answer.text"
                >
                  <v-card-text class="pa-3 text-center">
                    {{ answer.text }}
                  </v-card-text>
                </v-card>
              </div>
            </v-radio-group>

            <!-- True/False -->
            <v-radio-group
              v-else-if="currentQuestion?.questionType === 'true_false'"
              v-model="answerText"
            >
              <v-radio label="True" value="True" />
              <v-radio label="False" value="False" />
            </v-radio-group>

            <!-- Short Answer -->
            <v-textarea
              v-else-if="currentQuestion?.questionType === 'short_answer'"
              v-model="answerText"
              label="Enter Answer"
              rows="3"
            />

            <!-- Open Ended -->
            <v-textarea
              v-else-if="currentQuestion?.questionType === 'open_ended'"
              v-model="answerText"
              label="Enter Answer"
              rows="3"
            />
          </v-card-text>

          <v-card-actions class="d-flex justify-center">
            <QuizProgress
              :duration="poll.secondsPerQuestion || 30"
              :isRunning="isQuizRunning"
              :questionId="currentQuestion?.id"
              @timeUp="submitAnswers"
            />
          </v-card-actions>

          <v-card-actions class="d-flex justify-end">
            <v-btn
              v-if="isLastQuestion && !isQuizRunning"
              @click="showResults = true"
              color="primary"
            >
              View Results
            </v-btn>
          </v-card-actions>
        </v-card>

        <!-- Results -->
        <QuizResultsCardComponent
          v-else
          :poll="poll"
          :questions="questions"
          :userAnswers="userAnswers"
          :pollEventUserId="pollEventUserId"
          :correctAnswers="correctAnswers"
        />
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      <template #actions>
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
