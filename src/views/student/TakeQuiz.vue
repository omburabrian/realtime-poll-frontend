<template>
  <div class="take-quiz">
    <v-main class="main-content">
      <v-container fluid class="pa-0">
        <v-row justify="center" align="center" class="min-vh-100">
          <v-col cols="12" sm="8" md="6" lg="4">
            <v-card class="quiz-card" elevation="0">
              <v-card-text class="text-center pa-8">
                <!-- Quiz Title -->
                <h1 class="quiz-title mb-6">{{ quizInfo.title || 'Quiz Title' }}</h1>
                
                <!-- Loading Spinner (show when waiting) -->
                <v-progress-circular
                  v-if="quizInfo.status === 'waiting' || quizInfo.status === 'waiting-next'"
                  indeterminate
                  color="primary"
                  size="64"
                  class="mb-6"
                ></v-progress-circular>
                
                <!-- Status Message -->
                <p class="status-message mb-8">
                  <span v-if="quizInfo.status === 'waiting'">
                    {{ hasActiveSession ? 'Please wait for instructor to begin quiz' : 'No quiz available. Please check back later or contact your instructor.' }}
                  </span>
                  <span v-else-if="quizInfo.status === 'waiting-next'">
                    Please wait for instructor to begin next question
                  </span>
                  <span v-else-if="quizInfo.status === 'live'">
                    Quiz is now live! Question {{ questionNumber }} of {{ quizInfo.totalQuestions }}
                  </span>
                  <span v-else>
                    Quiz Status: {{ quizInfo.status }}
                  </span>
                </p>
                
                <!-- Quiz Details -->
                <div class="quiz-details">
                  <p class="detail-item mb-2">
                    Time Per Question: <strong>{{ quizInfo.timePerQuestion || 30 }} sec</strong>
                  </p>
                  <p class="detail-item">
                    Questions: <strong>{{ quizInfo.totalQuestions || 10 }}</strong>
                  </p>
                  <!-- Progress indicator for waiting-next state -->
                  <p v-if="quizInfo.status === 'waiting-next'" class="detail-item progress-indicator">
                    Questions Completed: <strong>{{ completedQuestions }}/{{ quizInfo.totalQuestions }}</strong>
                  </p>
                </div>
                
                <!-- Quiz Interface (when live) -->
                <div v-if="quizInfo.status === 'live'" class="quiz-interface mt-6">
                  <p class="quiz-message">
                    This is where the actual quiz interface will be implemented.
                  </p>
                  <p class="quiz-info">
                    Current Question: {{ questionNumber }}
                  </p>
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import apiClient from '../../services/services.js';

const router = useRouter();
const route = useRoute();

// Props from router (for when quiz is live)
const props = defineProps({
  sessionId: {
    type: String,
    required: false
  },
  questionNumber: {
    type: String,
    required: false
  }
});

// Reactive data
const quizInfo = ref({
  title: '',
  timePerQuestion: 30,
  totalQuestions: 10,
  sessionId: null,
  status: 'waiting'
});

const hasActiveSession = ref(false);
const completedQuestions = ref(0);

// Polling interval
let pollInterval = null;

// Fetch active session data
const fetchActiveSession = async () => {
  try {
    // Get all polls to find the active quiz (isPublic = true)
    const allPollsResponse = await apiClient.get('polls/');
    
    if (allPollsResponse && allPollsResponse.data) {
      // Filter for active quizzes (isQuiz = true AND isPublic = true)
      const activeQuizzes = allPollsResponse.data.filter(poll => 
        poll.isQuiz === true && poll.isPublic === true
      );
      
      if (activeQuizzes.length > 0) {
        // Get the active quiz (should only be one)
        const activeQuiz = activeQuizzes[0];
        
        // Get detailed info for this quiz
        const quizResponse = await apiClient.get(`polls/${activeQuiz.id}`);
        
        if (quizResponse && quizResponse.data) {
          hasActiveSession.value = true;
          quizInfo.value = {
            title: quizResponse.data.name || 'Quiz Title',
            timePerQuestion: quizResponse.data.secondsPerQuestion || 30,
            totalQuestions: quizResponse.data.questions ? quizResponse.data.questions.length : 10,
            sessionId: activeQuiz.id,
            status: 'waiting' // This will be updated based on quiz state
          };
          
          // Check if we should redirect to live quiz
          // For now, we'll keep it as 'waiting' until you implement the live state logic
          // You can add your logic here to determine when status becomes 'live'
        }
      } else {
        console.log('No active quiz found - professor needs to activate a quiz');
        hasActiveSession.value = false;
      }
    }
  } catch (error) {
    console.error('Error fetching quiz data:', error);
    
    // Check if it's a 404 error (no polls exist)
    if (error.response && error.response.status === 404) {
      console.log('No polls found - this is expected if no quizzes are available');
      hasActiveSession.value = false;
      return;
    }
    
    // For other errors, redirect to history
    router.push({ name: 'polls-history' });
  }
};

// Start polling
const startPolling = () => {
  pollInterval = setInterval(async () => {
    try {
      // Check for active quiz changes
      const allPollsResponse = await apiClient.get('polls/');
      
      if (allPollsResponse && allPollsResponse.data) {
        // Filter for active quizzes (isQuiz = true AND isPublic = true)
        const activeQuizzes = allPollsResponse.data.filter(poll => 
          poll.isQuiz === true && poll.isPublic === true
        );
        
        if (activeQuizzes.length > 0) {
          // Get the active quiz (should only be one)
          const activeQuiz = activeQuizzes[0];
          
          // Check if this is a different quiz than what we're currently showing
          if (!quizInfo.value.sessionId || quizInfo.value.sessionId !== activeQuiz.id) {
            // Get detailed info for this quiz
            const quizResponse = await apiClient.get(`polls/${activeQuiz.id}`);
            
            if (quizResponse && quizResponse.data) {
              hasActiveSession.value = true;
              quizInfo.value = {
                title: quizResponse.data.name || 'Quiz Title',
                timePerQuestion: quizResponse.data.secondsPerQuestion || 30,
                totalQuestions: quizResponse.data.questions ? quizResponse.data.questions.length : 10,
                sessionId: activeQuiz.id,
                status: 'waiting'
              };
            }
          }
          
          // Here you can add logic to check if quiz has become 'live'
          // For example, check a specific field or endpoint that indicates quiz is live
          // if (quizResponse.data.status === 'live') {
          //   quizInfo.value.status = 'live';
          //   // Redirect to first question
          //   router.push({ name: 'take-quiz', params: { sessionId: activeQuiz.id, questionNumber: '1' } });
          // }
        } else {
          // No active quiz found
          hasActiveSession.value = false;
          quizInfo.value = {
            title: '',
            timePerQuestion: 30,
            totalQuestions: 10,
            sessionId: null,
            status: 'waiting'
          };
        }
      }
    } catch (error) {
      console.error('Error polling quiz data:', error);
      
      // Check if it's a 404 error (no polls exist)
      if (error.response && error.response.status === 404) {
        console.log('No polls found during polling - this is expected if no quizzes are available');
        hasActiveSession.value = false;
        return;
      }
      
      // For other errors, stop polling and redirect to history
      clearInterval(pollInterval);
      router.push({ name: 'polls-history' });
    }
  }, 3000); // Poll every 3 seconds
};

// Check if we're in live quiz mode (based on route params)
const checkLiveQuizMode = () => {
  if (props.sessionId && props.questionNumber) {
    // We're in live quiz mode - update the quiz info
    quizInfo.value.sessionId = props.sessionId;
    quizInfo.value.status = 'live';
    
    // Fetch quiz details for this session
    fetchQuizDetails(props.sessionId);
  }
};

// Method to show waiting-next state (called when student submits answer early)
const showWaitingNextState = (completedCount) => {
  completedQuestions.value = completedCount;
  quizInfo.value.status = 'waiting-next';
};

// Method to handle answer submission (you can call this when student submits)
const submitAnswer = async (answer) => {
  try {
    // Here you would submit the answer to your backend
    // For now, we'll simulate the submission
    
    // Update completed questions count
    const currentQuestion = parseInt(props.questionNumber) || 1;
    completedQuestions.value = currentQuestion;
    
    // Show waiting state
    showWaitingNextState(currentQuestion);
    
    // You can add your answer submission logic here
    // const response = await apiClient.post(`polls/${props.sessionId}/questions/${props.questionNumber}/answer`, {
    //   answer: answer
    // });
    
    console.log('Answer submitted, waiting for next question...');
    
  } catch (error) {
    console.error('Error submitting answer:', error);
  }
};

// Fetch quiz details for live mode
const fetchQuizDetails = async (sessionId) => {
  try {
    const quizResponse = await apiClient.get(`polls/${sessionId}`);
    
    if (quizResponse && quizResponse.data) {
      quizInfo.value = {
        title: quizResponse.data.name || 'Quiz Title',
        timePerQuestion: quizResponse.data.secondsPerQuestion || 30,
        totalQuestions: quizResponse.data.questions ? quizResponse.data.questions.length : 10,
        sessionId: sessionId,
        status: 'live'
      };
    }
  } catch (error) {
    console.error('Error fetching quiz details:', error);
  }
};

// Component lifecycle
onMounted(() => {
  // Check if we're in live quiz mode
  checkLiveQuizMode();
  
  // If not in live mode, start the waiting/polling logic
  if (!props.sessionId) {
    // Initial fetch
    fetchActiveSession();
    
    // Start polling
    startPolling();
  }
});

onUnmounted(() => {
  // Clean up interval when component is destroyed
  if (pollInterval) {
    clearInterval(pollInterval);
  }
});
</script>

<style scoped>
.take-quiz {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  background-color: #f5f5f5;
}

.quiz-card {
  background-color: white !important;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.quiz-title {
  font-size: 2rem;
  font-weight: bold;
  color: #000;
  margin-bottom: 1.5rem;
}

.status-message {
  font-size: 1.1rem;
  color: #000;
  margin-bottom: 2rem;
}

.quiz-details {
  margin-top: 2rem;
}

.detail-item {
  font-size: 1rem;
  color: #000;
  margin-bottom: 0.5rem;
}

.detail-item strong {
  font-weight: bold;
}

.progress-indicator {
  font-size: 1.1rem !important;
  font-weight: bold;
  color: #000;
  margin-top: 1rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.quiz-interface {
  border-top: 1px solid #eee;
  padding-top: 2rem;
}

.quiz-message {
  font-size: 1rem;
  color: #666;
  margin-bottom: 1rem;
}

.quiz-info {
  font-size: 1rem;
  color: #000;
}

.min-vh-100 {
  min-height: calc(100vh - 64px); /* Adjust for app bar height */
}
</style> 