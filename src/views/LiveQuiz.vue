<script setup>
import { ref, computed, onMounted } from "vue";
import QuestionServices from "../services/QuestionServices";
import UserAnswerServices from "../services/UserAnswerServices";
import QuizProgress from "../components/QuizTimerComponent.vue";
import PollServices from "../services/PollServices";
import QuizResultsCardComponent from "../components/QuizResultsCardComponent.vue";
import { useRouter } from "vue-router";
import AnswerServices from "../services/AnswerServices";

const remaining = ref(0);
const currentIndex = ref(0);
const questions = ref([]);
const pollId = 1;
const router = useRouter();
const poll = ref({});
const user = ref(null);
const pollEventUserId = ref(null);
const isQuizRunning = ref(true);
const answerText = ref("");
const showResults = ref(false);
const userAnswers = ref([]);
const correctAnswers = ref([]);

const currentQuestion = computed(() => questions.value[currentIndex.value]);
const isLastQuestion = computed(
  () => currentIndex.value === questions.value.length - 1
);

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  pollEventUserId.value = user.value.id;
  //pollId = router.params.id //:ToDo - get pollId from router
  await getPoll();
  await fetchAllQuestions();
  isQuizRunning.value = true;
});

async function getPoll() {
  await PollServices.getPoll(pollId)
    .then((response) => {
      poll.value = response.data;
      remaining.value = poll.value.secondsPerQuestion;
    })
    .catch((error) => {
      console.log(error);
      showSnackbar("error", "Failed to fetch polls");
    });
}
async function fetchAllQuestions() {
  await QuestionServices.getQuestionsForPoll(pollId)
    .then((response) => {
      const data = response.data || [];
      questions.value = data.map((q) => ({
        ...q,
        answers: q.answers || [],
      }));
    })
    .catch((error) => {
      console.error(error);
      showSnackbar("error", "Failed to fetch questions");
    });
}
async function fetchCorrectAnswers() {
  const answersMap = {};
  for (const question of questions.value) {
    try {
      const response = await AnswerServices.getAnswersForQuestion(question.id);
      const correct = response.data.find((ans) => ans.isCorrectAnswer);
      if (correct) {
        answersMap[question.id] = correct.text;
      }
    } catch (error) {
      console.log(error);
      showSnackbar(
        "error",
        "Error fetching answers for question ID: " + question.id
      );
    }
  }
  correctAnswers.value = answersMap;
  console.log("Correct answers map:", correctAnswers.value);
}
async function fetchUserAnswers() {
  await UserAnswerServices.GetUserAnswersForPoll(pollEventUserId.value)
    .then((response) => {
      userAnswers.value = response.data.reduce((acc, answer) => {
        acc[answer.questionId] = answer.answer;
        return acc;
      }, {});
      console.log("Mapped answers:", userAnswers.value);
    })
    .catch((error) => {
      console.error(error);
      showSnackbar("error", "Failed to fetch user answers");
    });
}
async function submitAnswers() {
  const answerPayLoad = {
    pollEventUserId: pollEventUserId.value,
    questionId: currentQuestion.value.id,
    answer: answerText.value,
  };
  try {
    if (!answerText.value) {
      showSnackbar("error", "No answer saved");
    } else {
      await UserAnswerServices.CreateUserAnswer(answerPayLoad);
      showSnackbar("green", "Answer saved");
    }
  } catch (error) {
    console.log(error);
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
  showSnackbar("green", "You've reached the end of quiz");
  isQuizRunning.value = false;
  fetchUserAnswers();
  fetchCorrectAnswers();
}

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
</script>

<template>
  <v-container style="min-width: 320px">
    <v-row>
      <v-col cols="12">
        <v-card
          v-if="!showResults && questions.length > 0"
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
              Q{{ currentQuestion.questionNumber }}: {{ currentQuestion.text }}
            </p>

            <!------------------------------Multiple Choice Question------------------>
            <v-radio-group
              v-if="currentQuestion.questionType === 'multiple_choice'"
              v-model="answerText"
            >
              <div v-for="answer in currentQuestion.answers" :key="answer.id">
                <v-card
                  class="mb-3 answer-card"
                  :class="{
                    'answer-card--selected': answerText === answer.text,
                  }"
                  variant="tonal"
                  @click="answerText = answer.text"
                >
                  <v-card-text class="pa-3 text-center">
                    {{ answer.text }}
                  </v-card-text>
                </v-card>
              </div>
            </v-radio-group>

            <!--------------------------------True/False Question--------------------->
            <v-item-group
              v-else-if="currentQuestion.questionType === 'true_false'"
              v-model="answerText"
            >
              <v-item value="True">
                <template #default="{ isSelected, toggle }">
                  <v-card
                    class="mb-3 answer-card"
                    :class="{ 'answer-card--selected': isSelected }"
                    variant="tonal"
                    @click="toggle"
                  >
                    <v-card-text class="pa-3 text-center"> True </v-card-text>
                  </v-card>
                </template>
              </v-item>

              <v-item value="False">
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

            <!------------------------Short Answer Question-------------------->
            <v-textarea
              class="ml-8"
              v-else-if="currentQuestion.questionType === 'short_answer'"
              v-model="answerText"
              label="Enter Answer"
              rows="3"
            />
          </v-card-text>
          <v-card-actions class="justify-start pl-12"> </v-card-actions>
          <v-card-actions class="d-flex justify-center">
            <QuizProgress
              :duration="poll.secondsPerQuestion"
              :isRunning="isQuizRunning"
              :questionId="currentQuestion.id"
              @timeUp="submitAnswers"
            /> </v-card-actions
          ><v-card-actions class="d-flex justify-end">
            <v-btn
              v-if="isLastQuestion && !isQuizRunning"
              @click="showResults = true"
              color="primary"
            >
              View Results
            </v-btn>
          </v-card-actions>
        </v-card>
        <QuizResultsCardComponent
          v-else="isFinished"
          :poll="poll"
          :questions="questions"
          :userAnswers="userAnswers"
          :pollEventUserId="pollEventUserId"
          :correctAnswers="correctAnswers"
        />
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
