<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";
import PollEventServices from "../../services/PollEventServices";
import QuestionServices from "../../services/QuestionServices";
import { PollEventStates } from "../../constants";
import QuizProgress from "../../components/QuizTimerComponent.vue"; // reuse your timer

//  Use socket.io for real-time messaging
import { useSocketIO } from "../../composables/useSocketIO";
import { SOCKET_MESSAGES } from "../../constants/index";

const { socket } = useSocketIO();

const route = useRoute();

// Core state
const pollEvent = ref(null);
const poll = computed(() => pollEvent.value?.poll ?? {});
const pollId = computed(() => poll.value?.id ?? null);
const questions = ref([]);

const currentIndex = ref(0);
const isStarted = ref(false);
const isPaused = ref(false);
const isFinished = ref(false);
const isAutoAdvance = ref(true); // auto move to next when time is up

// Timer control (drives QuizProgress)
const isTimerRunning = computed(() => isStarted.value && !isPaused.value && !isFinished.value);
const duration = computed(() => poll.value?.secondsPerQuestion || 30);

// Derived
const currentQuestion = computed(() => questions.value[currentIndex.value]);
const isLastQuestion = computed(() => currentIndex.value === questions.value.length - 1);

//===============================
//  PROFESSOR's LIVE VIEW
//===============================

//  ToDo:   Add list of POLL PARTICIPANTS (PollEventUser.userId > User)
//          as they join the poll.

// Lifecycle
onMounted(async () => {
  await loadPollEvent(route.params.id);
  await fetchAllQuestions();
  // keyboard shortcuts
  window.addEventListener("keydown", handleKeys);

  //  ToDo:   Use socket.io to send message to backend to start load the quiz, putting it in the "waiting" state."
  //  socket.emit(SOCKET_MESSAGES.OPEN_POLL_EVENT, props.pollEventGuid);  //  Switched from POLL EVENT GUID, FOR NOW

  console.log("Professor Live View: route.params.id: " + route.params.id);
  

  socket.emit(SOCKET_MESSAGES.OPEN_POLL_EVENT, route.params.id);
  //  Have the message above change the status of the POLL EVENT TO "waiting"

  //  Change state of POLL EVENT to PollEventStates.WAITING
  if (pollEvent.value) {
    try {
      await PollEventServices.updatePollEvent({
        ...pollEvent.value,
        state: PollEventStates.OPEN,
      });
      pollEvent.value.state = PollEventStates.OPEN; // Keep local state in sync

      //  At this point, users can start to "join" this POLL EVENT, via socket.io.


    } catch (error) {
      console.error("Failed to update poll event state:", error);
      showSnackbar("error", "Failed to set poll to waiting state.");
    }
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("keydown", handleKeys);
});

// Loaders
async function loadPollEvent(eventId) {
  try {
    const { data } = await PollEventServices.getPollEventById(eventId);
    pollEvent.value = data;
  } catch (error) {
    console.error(error);
    showSnackbar("error", "Failed to fetch poll event");
  }
}

async function fetchAllQuestions() {
  if (!pollId.value) return;
  try {
    const { data } = await QuestionServices.getQuestionsForPoll(pollId.value);
    questions.value = (data || []).map(q => ({ ...q, answers: q.answers || [] }));
  } catch (error) {
    console.error(error);
    showSnackbar("error", "Failed to fetch questions");
  }
}

// Controls
function startQuiz() {
  if (!questions.value.length) {
    showSnackbar("error", "No questions to start.");
    return;
  }
  isStarted.value = true;
  isPaused.value = false;
  isFinished.value = false;
  currentIndex.value = 0;
}

function pauseQuiz() {
  isPaused.value = true;
}

function resumeQuiz() {
  if (!isStarted.value || isFinished.value) return;
  isPaused.value = false;
}

function endQuiz() {
  isFinished.value = true;
  isPaused.value = false;
  isStarted.value = false;
}

function prevQuestion() {
  if (!isStarted.value || isPaused.value) return;
  if (currentIndex.value > 0) currentIndex.value -= 1;
}

function nextQuestion() {
  if (!isStarted.value || isPaused.value) return;
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value += 1;
  } else {
    endQuiz();
  }
}

// When timer ends on a question
function handleTimeUp() {
  if (!isStarted.value || isPaused.value) return;
  if (isAutoAdvance.value) {
    nextQuestion();
  } else {
    pauseQuiz();
  }
}

// Keyboard shortcuts
function handleKeys(e) {
  if (e.code === "Space") {
    e.preventDefault();
    isPaused.value ? resumeQuiz() : pauseQuiz();
  } else if (e.code === "ArrowRight") {
    e.preventDefault();
    nextQuestion();
  } else if (e.code === "ArrowLeft") {
    e.preventDefault();
    prevQuestion();
  }
}

// Snackbar
const snackbar = ref({ value: false, color: "", text: "" });
function showSnackbar(color, text) {
  snackbar.value = { value: true, color, text };
}
function closeSnackBar() {
  snackbar.value = { ...snackbar.value, value: false };
}
</script>

<template>
  <v-container style="min-width: 320px">
    <!-- Start Screen -->
    <v-row v-if="!isStarted && !isFinished">
      <v-col cols="12">
        <v-card class="mt-12 elevation-8">
          <v-card color="primary" class="rounded-lg mb-6">
            <v-card-title class="d-flex pa-6 justify-space-between">
              <span>Ready to Start</span>
              <span>{{ poll.name }}</span>
            </v-card-title>
          </v-card>
          <v-card-text class="text-center pb-8">
            <div class="text-h5 mb-2">
              Questions: <strong>{{ questions.length }}</strong>
            </div>
            <div class="text-body-1 mb-6">
              Time per question:
              <strong>{{ duration }}s</strong>
              <span class="ml-2">(0/blank = unlimited)</span>
            </div>
            <v-switch
              v-model="isAutoAdvance"
              color="primary"
              inset
              label="Auto-advance when time ends"
              class="mb-6"
            />
            <v-btn
              color="primary"
              size="x-large"
              class="px-10 py-6"
              @click="startQuiz"
              :disabled="!questions.length"
            >
              Start Quiz
            </v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Finished Screen -->
    <v-row v-else-if="isFinished">
      <v-col cols="12">
        <v-card class="mt-12 elevation-8">
          <v-card-text class="text-center py-16">
            <div class="text-h3 font-weight-bold mb-4">Quiz Finished</div>
            <div class="text-body-1 mb-8">{{ poll.name }}</div>
            <v-btn color="primary" size="large" @click="isFinished = false">Back</v-btn>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Live Display -->
    <v-row v-else>
      <v-col cols="12">
        <v-card class="mt-6 elevation-8">
          <!-- Header -->
          <v-card color="primary" class="rounded-lg">
            <v-card-title class="d-flex pa-5 align-center">
              <div class="text-truncate">
                <span class="font-weight-medium">Quiz:</span>
                <span class="ml-2">{{ poll.name }}</span>
              </div>
              <v-spacer />
              <div class="mr-4">Q {{ currentIndex + 1 }} / {{ questions.length }}</div>
            </v-card-title>
          </v-card>

          <!-- Big Timer -->
          <div class="d-flex justify-center mt-4">
            <QuizProgress
              :duration="duration"
              :isRunning="isTimerRunning"
              :questionId="currentQuestion?.id"
              @timeUp="handleTimeUp"
            />
          </div>

          <!-- Question (no answers) -->
          <v-card-text class="py-12">
            <div class="text-center">
              <div class="text-h4 mb-2">
                Q{{ currentQuestion?.questionNumber }}
              </div>
              <div class="text-h4 font-weight-bold" style="line-height: 1.3">
                {{ currentQuestion?.text }}
              </div>
            </div>
          </v-card-text>

          <!-- Controls -->
          <v-card-actions class="d-flex justify-space-between pb-6 px-6">
            <div class="d-flex align-center" style="gap: 8px">
              <v-btn variant="elevated" color="default" :disabled="currentIndex === 0" @click="prevQuestion">
                <v-icon start>mdi-chevron-left</v-icon> Prev
              </v-btn>
              <v-btn variant="elevated" color="default" :disabled="isLastQuestion" @click="nextQuestion">
                Next <v-icon end>mdi-chevron-right</v-icon>
              </v-btn>
            </div>

            <div class="d-flex align-center" style="gap: 8px">
              <v-btn
                v-if="!isPaused"
                variant="elevated"
                color="orange"
                @click="pauseQuiz"
              >
                <v-icon start>mdi-pause</v-icon> Pause
              </v-btn>
              <v-btn
                v-else
                variant="elevated"
                color="green"
                @click="resumeQuiz"
              >
                <v-icon start>mdi-play</v-icon> Resume
              </v-btn>

              <v-btn variant="elevated" color="red" @click="endQuiz">
                <v-icon start>mdi-stop</v-icon> End
              </v-btn>
            </div>
          </v-card-actions>

          <!-- Pause Overlay -->
          <div
            v-if="isPaused"
            class="paused-overlay d-flex flex-column align-center justify-center"
          >
            <div class="text-h2 font-weight-bold mb-4">Paused</div>
            <div class="text-body-1 mb-6">Press Space to resume</div>
            <v-btn color="green" size="large" @click="resumeQuiz">
              <v-icon start>mdi-play</v-icon> Resume
            </v-btn>
          </div>
        </v-card>
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

<style scoped>
.paused-overlay {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.75); /* slate-900/75 */
  color: #fff;
  z-index: 10;
  border-radius: 12px;
  text-align: center;
}
</style>
