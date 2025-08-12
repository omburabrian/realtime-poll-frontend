<script setup>
import { onMounted } from "vue";
import { ref, computed } from "vue";
import PollEventUserServices from "../services/PollEventUserServices.js";
import UserAnswerServices from "../services/UserAnswerServices.js";
import PollQuestionServices from "../services/PollQuestionServices.js";

const user = ref(null);
const userPolls = ref([]);
const expandedPoll = ref(null);
const pollDetails = ref({});
const loading = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getPollHistoryForUser();
});

async function getPollHistoryForUser() {
  await PollEventUserServices.getUserPollHistory(user.value.id)
    .then((response) => {
      userPolls.value = (response.data || []).map((item) => ({
        id: item.id,
        pollId: item.poll_event?.poll?.id || null,
        pollName: item.poll_event?.poll?.name || "",
        description: item.poll_event?.poll?.description || "",
        dateTaken: item.createdAt || null,
        score: item.score || null,
        totalQuestions: item.totalQuestions || 0,
        correctAnswers: item.correctAnswers || 0,
        pollEventId: item.poll_event?.id || null,
      }));

      // console.log(userPolls.value);
      // console.log(JSON.stringify(response.data, null, 2));
    })
    .catch((error) => {
      console.error(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error fetching poll history";
    });
}

async function loadPollDetails(poll) {
  if (expandedPoll.value === poll.id) {
    expandedPoll.value = null;
    return;
  }
  
  expandedPoll.value = poll.id;
  loading.value = true;
  
  try {
    // Get user answers for this poll
    const userAnswersResponse = await UserAnswerServices.GetUserAnswersForPoll(poll.id);
    const userAnswers = userAnswersResponse.data || [];
    
    // Get poll questions
    const questionsResponse = await PollQuestionServices.getPollQuestionsForPoll(poll.pollId);
    const questions = questionsResponse.data || [];
    
    // Combine questions with user answers
    const detailedQuestions = questions.map(question => {
      const userAnswer = userAnswers.find(answer => answer.pollQuestionId === question.id);
      return {
        ...question,
        userAnswer: userAnswer?.answer || null,
        isCorrect: userAnswer?.isCorrect || false,
        correctAnswer: question.correctAnswer || question.answers?.find(a => a.isCorrect)?.text || "N/A"
      };
    });
    
    pollDetails.value[poll.id] = {
      questions: detailedQuestions,
      totalScore: poll.score || 0,
      totalQuestions: detailedQuestions.length,
      correctAnswers: detailedQuestions.filter(q => q.isCorrect).length,
      percentage: detailedQuestions.length > 0 ? 
        Math.round((detailedQuestions.filter(q => q.isCorrect).length / detailedQuestions.length) * 100) : 0
    };
    
  } catch (error) {
    console.error("Error loading poll details:", error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = "Error loading poll details";
  } finally {
    loading.value = false;
  }
}

function closeSnackbar() {
  snackbar.value.value = false;
}

function getScoreColor(percentage) {
  if (percentage >= 80) return "success";
  if (percentage >= 60) return "warning";
  return "error";
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="mt-3 pa-5">
        <v-card-title class="headline">My Polls</v-card-title>

        <v-expansion-panels
          v-if="userPolls && userPolls.length > 0"
          variant="accordion"
          class="mt-4"
          rounded="md"
          color="secondary"
        >
          <v-expansion-panel 
            v-for="(poll, index) in userPolls" 
            :key="poll.id"
            @click="loadPollDetails(poll)"
          >
            <v-expansion-panel-title>
              <div class="d-flex align-center justify-space-between w-100">
                <span>Quiz Title: {{ poll.pollName }}</span>
                <div class="d-flex align-center">
                  <v-chip 
                    :color="getScoreColor(poll.score || 0)" 
                    class="ml-2" 
                    v-if="poll.score !== null"
                  >
                    Score: {{ poll.score }}%
                  </v-chip>
                  <v-chip 
                    color="primary" 
                    class="ml-2" 
                    v-if="poll.totalQuestions > 0"
                  >
                    {{ poll.correctAnswers }}/{{ poll.totalQuestions }}
                  </v-chip>
                </div>
              </div>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div v-if="loading && expandedPoll === poll.id" class="text-center pa-4">
                <v-progress-circular indeterminate color="primary"></v-progress-circular>
                <div class="mt-2">Loading poll details...</div>
              </div>
              
              <div v-else-if="pollDetails[poll.id]">
                <!-- Poll Summary -->
                <v-card class="mb-4" variant="outlined">
                  <v-card-text>
                    <div class="d-flex justify-space-between align-center mb-3">
                      <h3 class="text-h6">Poll Summary</h3>
                      <v-chip 
                        :color="getScoreColor(pollDetails[poll.id].percentage)" 
                        size="large"
                        class="font-weight-bold"
                      >
                        {{ pollDetails[poll.id].percentage }}%
                      </v-chip>
                    </div>
                    <div class="d-flex justify-space-between">
                      <div>
                        <strong>Total Questions:</strong> {{ pollDetails[poll.id].totalQuestions }}
                      </div>
                      <div>
                        <strong>Correct Answers:</strong> {{ pollDetails[poll.id].correctAnswers }}
                      </div>
                      <div>
                        <strong>Date Taken:</strong>
                        {{ poll.dateTaken ? new Date(poll.dateTaken).toLocaleDateString() : "Unknown" }}
                      </div>
                    </div>
                  </v-card-text>
                </v-card>

                <!-- Questions and Answers -->
                <div v-if="pollDetails[poll.id].questions.length > 0">
                  <h4 class="text-h6 mb-3">Questions & Answers</h4>
                  <v-list class="bg-grey-lighten-4 rounded">
                    <v-list-item
                      v-for="(question, qIndex) in pollDetails[poll.id].questions"
                      :key="question.id"
                      class="mb-2"
                    >
                      <v-list-item-content>
                        <v-list-item-title class="font-weight-bold mb-2">
                          Q{{ qIndex + 1 }}: {{ question.text }}
                        </v-list-item-title>
                        
                        <div class="d-flex flex-wrap gap-2 mb-2">
                          <v-chip
                            :color="question.isCorrect ? 'success' : 'error'"
                            label
                            dark
                          >
                            <v-icon start>
                              {{ question.isCorrect ? 'mdi-check' : 'mdi-close' }}
                            </v-icon>
                            {{ question.isCorrect ? 'Correct' : 'Incorrect' }}
                          </v-chip>
                          
                          <v-chip color="info" label dark>
                            Your Answer: {{ question.userAnswer || 'None' }}
                          </v-chip>
                          
                          <v-chip color="success" label dark>
                            Correct Answer: {{ question.correctAnswer }}
                          </v-chip>
                        </div>
                      </v-list-item-content>
                    </v-list-item>
                  </v-list>
                </div>
                
                <div v-else class="text-center pa-4 text-grey">
                  <v-icon size="48" color="grey">mdi-help-circle-outline</v-icon>
                  <div class="mt-2">No detailed question data available</div>
                </div>
              </div>
              
              <!-- Basic Info (shown when not expanded) -->
              <div v-else>
                <div class="mb-2">
                  <b>Description:</b> {{ poll.description }}
                </div>
                <div class="mb-2">
                  <b>Date Taken:</b>
                  {{ poll.dateTaken ? new Date(poll.dateTaken).toLocaleDateString() : "Unknown" }}
                </div>
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <div v-else class="pa-4 text-center">
          <v-card variant="elevated" class="mx-auto" max-width="400">
            <v-card-text>
              <v-icon color="grey" size="80">mdi-information-outline</v-icon>
              <div class="mt-2">No poll history found.</div>
            </v-card-text>
          </v-card>
        </div>
      </v-col>
    </v-row>
    
    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn :color="snackbar.color" variant="text" @click="closeSnackbar()">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>
