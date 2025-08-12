<template>
  <div class="quiz-manager">
    <v-main class="main-content">
      <v-container fluid>
        <v-row>
          <v-col cols="12">
            <h1 class="text-h4 mb-6">Quiz Manager</h1>
            <p class="text-body-1 mb-6">
              Control which quiz is currently active for students. Only one quiz can be active at a time.
            </p>
          </v-col>
        </v-row>

        <!-- Active Quiz Section -->
        <v-row v-if="activeQuiz">
          <v-col cols="12">
            <v-card class="mb-6" color="success" dark>
              <v-card-title>
                <v-icon left>mdi-play-circle</v-icon>
                Currently Active Quiz
              </v-card-title>
              <v-card-text>
                <h3 class="text-h5 mb-2">{{ activeQuiz.name }}</h3>
                <p class="mb-2">{{ activeQuiz.description }}</p>
                <p class="mb-2">
                  <strong>Questions:</strong> {{ activeQuiz.questions ? activeQuiz.questions.length : 0 }}
                </p>
                <p class="mb-2">
                  <strong>Time per question:</strong> {{ activeQuiz.secondsPerQuestion || 30 }} seconds
                </p>
                <v-btn 
                  color="error" 
                  @click="deactivateQuiz(activeQuiz.id)"
                  :loading="deactivating"
                >
                  <v-icon left>mdi-stop</v-icon>
                  Deactivate Quiz
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <!-- Available Quizzes Section -->
        <v-row>
          <v-col cols="12">
            <h2 class="text-h5 mb-4">Available Quizzes</h2>
            <v-row>
              <v-col 
                v-for="quiz in availableQuizzes" 
                :key="quiz.id" 
                cols="12" 
                md="6" 
                lg="4"
              >
                <v-card class="quiz-card" :class="{ 'active-quiz': quiz.isPublic }">
                  <v-card-title class="d-flex justify-space-between align-center">
                    <span>{{ quiz.name }}</span>
                    <v-chip 
                      v-if="quiz.isPublic" 
                      color="success" 
                      small
                    >
                      Active
                    </v-chip>
                  </v-card-title>
                  
                  <v-card-text>
                    <p class="mb-2">{{ quiz.description || 'No description' }}</p>
                    <p class="mb-2">
                      <strong>Questions:</strong> {{ quiz.questions ? quiz.questions.length : 0 }}
                    </p>
                    <p class="mb-2">
                      <strong>Time per question:</strong> {{ quiz.secondsPerQuestion || 30 }} seconds
                    </p>
                    <p class="mb-2">
                      <strong>Created:</strong> {{ formatDate(quiz.createdAt) }}
                    </p>
                  </v-card-text>
                  
                  <v-card-actions>
                    <v-btn 
                      v-if="!quiz.isPublic"
                      color="primary" 
                      @click="activateQuiz(quiz.id)"
                      :loading="activating === quiz.id"
                      :disabled="!!activeQuiz"
                    >
                      <v-icon left>mdi-play</v-icon>
                      Activate Quiz
                    </v-btn>
                    <v-btn 
                      v-else
                      color="error" 
                      @click="deactivateQuiz(quiz.id)"
                      :loading="deactivating === quiz.id"
                    >
                      <v-icon left>mdi-stop</v-icon>
                      Deactivate
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-col>
        </v-row>

        <!-- No Quizzes Message -->
        <v-row v-if="availableQuizzes.length === 0">
          <v-col cols="12">
            <v-card>
              <v-card-text class="text-center">
                <v-icon size="64" color="grey">mdi-help-circle</v-icon>
                <h3 class="text-h5 mt-4">No Quizzes Available</h3>
                <p class="text-body-1">
                  You haven't created any quizzes yet. Create a quiz first to manage it here.
                </p>
                <v-btn 
                  color="primary" 
                  class="mt-4"
                  @click="goToQuizCreation"
                >
                  Create Quiz
                </v-btn>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import apiClient from '../../services/services.js';

const router = useRouter();

// Reactive data
const quizzes = ref([]);
const loading = ref(false);
const activating = ref(null);
const deactivating = ref(null);

// Computed properties
const availableQuizzes = computed(() => {
  return quizzes.value.filter(quiz => quiz.isQuiz === true);
});

const activeQuiz = computed(() => {
  return availableQuizzes.value.find(quiz => quiz.isPublic === true);
});

// Methods
const fetchQuizzes = async () => {
  try {
    loading.value = true;
    const response = await apiClient.get('polls/');
    
    if (response && response.data) {
      quizzes.value = response.data;
    }
  } catch (error) {
    console.error('Error fetching quizzes:', error);
  } finally {
    loading.value = false;
  }
};

const activateQuiz = async (quizId) => {
  try {
    activating.value = quizId;
    
    // First, deactivate any currently active quiz
    if (activeQuiz.value) {
      await apiClient.put(`polls/${activeQuiz.value.id}`, {
        ...activeQuiz.value,
        isPublic: false
      });
    }
    
    // Then activate the selected quiz
    const quizToActivate = quizzes.value.find(q => q.id === quizId);
    await apiClient.put(`polls/${quizId}`, {
      ...quizToActivate,
      isPublic: true
    });
    
    // Refresh the quiz list
    await fetchQuizzes();
    
  } catch (error) {
    console.error('Error activating quiz:', error);
  } finally {
    activating.value = null;
  }
};

const deactivateQuiz = async (quizId) => {
  try {
    deactivating.value = quizId;
    
    const quizToDeactivate = quizzes.value.find(q => q.id === quizId);
    await apiClient.put(`polls/${quizId}`, {
      ...quizToDeactivate,
      isPublic: false
    });
    
    // Refresh the quiz list
    await fetchQuizzes();
    
  } catch (error) {
    console.error('Error deactivating quiz:', error);
  } finally {
    deactivating.value = null;
  }
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};

const goToQuizCreation = () => {
  router.push({ name: 'professor-polls' });
};

// Component lifecycle
onMounted(() => {
  fetchQuizzes();
});
</script>

<style scoped>
.quiz-manager {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.main-content {
  background-color: #f5f5f5;
}

.quiz-card {
  height: 100%;
  transition: all 0.3s ease;
}

.quiz-card.active-quiz {
  border: 2px solid #4caf50;
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.3);
}

.quiz-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}
</style> 