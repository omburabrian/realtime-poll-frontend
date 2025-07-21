<template>
  <div class="ai-quiz-builder">
    <div class="sidebar">
      <h3>Saved Quizzes</h3>
      <div v-if="loadingQuizzes" class="sidebar-loading">Loading...</div>
      <div v-else-if="quizzes.length === 0" class="sidebar-empty">No quizzes yet.</div>
      <ul class="quiz-list">
        <li v-for="q in quizzes" :key="q.id" :class="{selected: selectedQuiz && selectedQuiz.id === q.id}" @click="selectQuiz(q)">
          {{ q.name }}
        </li>
      </ul>
    </div>
    <div class="main-content">
      <button class="btn new-quiz" @click="resetForm" style="margin-bottom: 1rem; align-self: flex-end;">New Quiz</button>
      <h2>AI Quiz Builder</h2>
      <form class="quiz-form" @submit.prevent>
        <div class="form-group">
          <label>Quiz Name</label>
          <input v-model="quiz.name" placeholder="Quiz Name" />
        </div>
        <div class="form-group required">
          <label>Quiz Topic</label>
          <input v-model="quiz.topic" required />
        </div>
        <div class="form-group required">
          <label>Number of Questions</label>
          <input type="number" v-model.number="quiz.numQuestions" min="1" required />
        </div>
        <div class="form-group required">
          <label>Grade Level</label>
          <input v-model="quiz.gradeLevel" required />
        </div>
        <div class="form-group required">
          <label>Question Type</label>
          <select v-model="quiz.questionType" required>
            <option value="multiple-choice">Multiple Choice</option>
          </select>
        </div>
        <div class="form-group">
          <label>Extra Instructions</label>
          <textarea v-model="quiz.instructions" placeholder="Optional"></textarea>
        </div>
        <div class="button-row">
          <button type="button" class="btn ai" @click="generateQuestions" :disabled="loading">
            <span v-if="loading">Generating...</span>
            <span v-else>Add Questions With AI</span>
          </button>
          <button type="button" class="btn" @click="addManualQuestion">Add Question</button>
          <button type="button" class="btn save" @click="saveQuiz" :disabled="saving">
            <span v-if="saving">Saving...</span>
            <span v-else>Save Quiz</span>
          </button>
        </div>
      </form>
      <div class="questions-list">
        <h3>Questions</h3>
        <div v-if="questions.length === 0" class="empty">No questions yet.</div>
        <div v-else class="scroll-area">
          <div v-for="(q, idx) in questions" :key="q.id || idx" class="question-card">
            <div class="q-header">
              <span>Q{{ idx + 1 }}</span>
              <button v-if="editingQuizId" class="delete-btn" @click="deleteQuestion(idx)">Delete</button>
            </div>
            <input v-model="q.text" placeholder="Question text" />
            <div class="options">
              <input v-model="q.optionA" placeholder="Option A" />
              <input v-model="q.optionB" placeholder="Option B" />
              <input v-model="q.optionC" placeholder="Option C" />
              <input v-model="q.optionD" placeholder="Option D" />
            </div>
            <div class="correct-opt">
              <label>Correct Option:</label>
              <select v-model="q.correctOption">
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="C">C</option>
                <option value="D">D</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      <div v-if="selectedQuiz" class="quiz-detail-panel">
        <h3>Quiz Details</h3>
        <div><strong>Name:</strong> {{ selectedQuiz.name }}</div>
        <div><strong>Topic:</strong> {{ selectedQuiz.topic }}</div>
        <div><strong>Grade Level:</strong> {{ selectedQuiz.gradeLevel }}</div>
        <div><strong>Type:</strong> {{ selectedQuiz.questionType }}</div>
        <div><strong>Instructions:</strong> {{ selectedQuiz.instructions }}</div>
        <div><strong>Questions:</strong>
          <ol>
            <li v-for="q in selectedQuiz.aiQuestion" :key="q.id">
              <div>{{ q.text }}</div>
              <ul>
                <li>A: {{ q.optionA }}</li>
                <li>B: {{ q.optionB }}</li>
                <li>C: {{ q.optionC }}</li>
                <li>D: {{ q.optionD }}</li>
              </ul>
              <div><strong>Correct:</strong> {{ q.correctOption }}</div>
            </li>
          </ol>
        </div>
        <div class="quiz-detail-actions">
          <button class="btn" @click="editQuiz(selectedQuiz)">Edit</button>
          <button class="btn delete" @click="deleteQuiz(selectedQuiz)">Delete</button>
        </div>
      </div>
      <div v-if="message" :class="['message', messageType]">{{ message }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import apiClient from '../../services/services.js'

const quiz = ref({
  name: '',
  topic: '',
  numQuestions: 5,
  gradeLevel: '',
  questionType: 'multiple-choice',
  instructions: ''
})
const questions = ref([])
const loading = ref(false)
const saving = ref(false)
const message = ref('')
const messageType = ref('')

const quizzes = ref([])
const selectedQuiz = ref(null)
const loadingQuizzes = ref(false)

onMounted(() => {
  fetchQuizzes()
})

function addManualQuestion() {
  questions.value.push({
    text: '', optionA: '', optionB: '', optionC: '', optionD: '', correctOption: 'A'
  })
}

function deleteQuestion(idx) {
  questions.value.splice(idx, 1)
}

function parseCohereResponse(text) {
  // Split by question numbers (e.g., 1. 2. 3.)
  const qBlocks = text.split(/\n(?=\d+\.)/).filter(Boolean);
  const parsed = [];
  for (const block of qBlocks) {
    console.log('Parsing block:', block); // <-- Debug log
    // More flexible regex for options and answer
    const qMatch = block.match(/^(\d+\.)?\s*(.*?)\nA[\).:-]?\s*(.*?)\nB[\).:-]?\s*(.*?)\nC[\).:-]?\s*(.*?)\nD[\).:-]?\s*(.*?)\nAnswer[:\s-]*([A-D])/is);
    if (qMatch) {
      parsed.push({
        text: qMatch[2].trim(),
        optionA: qMatch[3].trim(),
        optionB: qMatch[4].trim(),
        optionC: qMatch[5].trim(),
        optionD: qMatch[6].trim(),
        correctOption: qMatch[7].trim()
      });
    }
  }
  return parsed;
}

async function generateQuestions() {
  if (!quiz.value.topic || !quiz.value.numQuestions || !quiz.value.gradeLevel) {
    message.value = 'Please fill in all required fields.'
    messageType.value = 'error'
    return
  }
  loading.value = true
  message.value = ''
  try {
    const prompt = `Generate ${quiz.value.numQuestions} multiple choice questions on the topic '${quiz.value.topic}' for grade ${quiz.value.gradeLevel}. Format each question as: 1. [Question text]\nA) [Option A]\nB) [Option B]\nC) [Option C]\nD) [Option D]\nAnswer: [A/B/C/D].${quiz.value.instructions ? ' ' + quiz.value.instructions : ''}`
    const res = await axios.post('https://api.cohere.ai/v1/generate', {
      model: 'command',
      prompt,
      max_tokens: 800,
      temperature: 0.7,
      k: 0,
      stop_sequences: [],
      return_likelihoods: 'NONE'
    }, {
      headers: {
        'Authorization': 'Bearer IU3cGCCNmK6aDujflkqbQmjc57zlHRSmzvjJqtQR',
        'Content-Type': 'application/json'
      }
    })
    const text = res.data.generations[0].text
    console.log('Cohere raw response:', text); // <-- Debug log
    const newQuestions = parseCohereResponse(text)
    if (newQuestions.length === 0) {
      message.value = 'Could not parse any questions from AI response.'
      messageType.value = 'error'
    } else {
      questions.value.push(...newQuestions)
      message.value = `Added ${newQuestions.length} questions.`
      messageType.value = 'success'
    }
  } catch (e) {
    message.value = 'Error generating questions.'
    messageType.value = 'error'
  } finally {
    loading.value = false
  }
}

async function fetchQuizzes() {
  loadingQuizzes.value = true
  try {
    const res = await apiClient.get('ai-quizzes')
    quizzes.value = res.data
  } catch (e) {
    // Optionally show error
  } finally {
    loadingQuizzes.value = false
  }
}

async function selectQuiz(q) {
  try {
    const res = await apiClient.get(`ai-quizzes/${q.id}`)
    selectedQuiz.value = res.data
  } catch (e) {
    selectedQuiz.value = null
  }
}

async function deleteQuiz(q) {
  if (!confirm('Delete this quiz?')) return
  try {
    await apiClient.delete(`ai-quizzes/${q.id}`)
    quizzes.value = quizzes.value.filter(quiz => quiz.id !== q.id)
    selectedQuiz.value = null
    message.value = 'Quiz deleted.'
    messageType.value = 'success'
  } catch (e) {
    message.value = 'Error deleting quiz.'
    messageType.value = 'error'
  }
}

function editQuiz(q) {
  // Load quiz into form for editing
  quiz.value = {
    name: q.name,
    topic: q.topic,
    numQuestions: q.aiQuestion.length,
    gradeLevel: q.gradeLevel,
    questionType: q.questionType,
    instructions: q.instructions
  }
  questions.value = q.aiQuestion.map(qq => ({
    text: qq.text,
    optionA: qq.optionA,
    optionB: qq.optionB,
    optionC: qq.optionC,
    optionD: qq.optionD,
    correctOption: qq.correctOption
  }))
  selectedQuiz.value = null // Hide detail panel while editing
  editingQuizId.value = q.id
}

const editingQuizId = ref(null)

function resetForm() {
  quiz.value = {
    name: '',
    topic: '',
    numQuestions: 5,
    gradeLevel: '',
    questionType: 'multiple-choice',
    instructions: ''
  }
  questions.value = []
  editingQuizId.value = null
  selectedQuiz.value = null
}

async function saveQuiz() {
  if (!quiz.value.topic || !quiz.value.numQuestions || !quiz.value.gradeLevel || questions.value.length === 0) {
    message.value = 'Please fill in all required fields and add at least one question.'
    messageType.value = 'error'
    return
  }
  saving.value = true
  message.value = ''
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (editingQuizId.value) {
      // Update existing quiz
      await apiClient.put(`ai-quizzes/${editingQuizId.value}`, {
        name: quiz.value.name,
        topic: quiz.value.topic,
        gradeLevel: quiz.value.gradeLevel,
        questionType: quiz.value.questionType,
        instructions: quiz.value.instructions,
        questions: questions.value
      })
      message.value = 'Quiz updated successfully!'
      messageType.value = 'success'
      editingQuizId.value = null
    } else {
      // Create new quiz
      await apiClient.post('ai-quizzes', {
        name: quiz.value.name,
        topic: quiz.value.topic,
        gradeLevel: quiz.value.gradeLevel,
        questionType: quiz.value.questionType,
        instructions: quiz.value.instructions,
        userId: user?.id,
        questions: questions.value
      })
      message.value = 'Quiz saved successfully!'
      messageType.value = 'success'
      resetForm() // <-- Reset after saving new quiz
    }
    fetchQuizzes()
    // Optionally reset form
    // quiz.value = { name: 'Default 5', topic: '', numQuestions: 5, gradeLevel: '', questionType: 'multiple-choice', instructions: '' }
    // questions.value = []
  } catch (e) {
    message.value = 'Error saving quiz.'
    messageType.value = 'error'
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.ai-quiz-builder {
  max-width: 1100px;
  margin: 2rem auto;
  background: #f5f5f5;
  border-radius: 12px;
  padding: 2rem 2.5rem;
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  display: flex;
  gap: 2rem;
}
.sidebar {
  flex: 1 1 220px;
  background: #ececec;
  border-radius: 8px;
  padding: 1.5rem 1rem;
  min-width: 220px;
  max-width: 260px;
  height: 700px;
  overflow-y: auto;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.sidebar h3 {
  margin-bottom: 0.7rem;
}
.quiz-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.quiz-list li {
  padding: 0.5em 0.8em;
  border-radius: 5px;
  cursor: pointer;
  background: #fff;
  transition: background 0.2s;
}
.quiz-list li.selected, .quiz-list li:hover {
  background: #a83232;
  color: #fff;
}
.sidebar-loading, .sidebar-empty {
  color: #888;
  font-style: italic;
}
.main-content {
  flex: 3 1 0;
  display: flex;
  flex-direction: column;
}
.quiz-form {
  flex: 2 1 0;
  display: flex;
  flex-wrap: wrap;
  gap: 1.2rem 2rem;
  background: #ececec;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}
.form-group {
  flex: 1 1 220px;
  display: flex;
  flex-direction: column;
  margin-bottom: 0.5rem;
}
.form-group label {
  font-weight: 600;
  margin-bottom: 0.3rem;
}
.form-group.required label:after {
  content: '*';
  color: #b00;
  margin-left: 0.2em;
}
input, textarea, select {
  border: 1px solid #bbb;
  border-radius: 5px;
  padding: 0.5em;
  font-size: 1em;
  background: #fff;
}
textarea {
  min-height: 2.5em;
}
.button-row {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
.btn {
  background: #8b0000;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 0.6em 1.2em;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.btn.ai {
  background: #a83232;
}
.btn.save {
  background: #4a0c0c;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.questions-list {
  flex: 2 1 0;
  margin-top: 2rem;
}
.questions-list h3 {
  margin-bottom: 0.7rem;
}
.empty {
  color: #888;
  font-style: italic;
}
.scroll-area {
  max-height: 500px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}
.question-card {
  background: #fff;
  border-radius: 7px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  padding: 1rem 1.2rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  position: relative;
}
.q-header {
  display: flex;
  justify-content: space-between; /* Changed to space-between for delete button */
  align-items: center;
  font-weight: 600;
  gap: 1rem;
}
.options {
  display: flex;
  gap: 0.5rem;
}
.options input {
  flex: 1 1 0;
}
.correct-opt {
  margin-top: 0.3rem;
}
.quiz-detail-panel {
  background: #fff;
  border-radius: 7px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
  padding: 1.2rem 1.5rem;
  margin-top: 2rem;
}
.quiz-detail-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
.quiz-detail-actions .btn.delete {
  background: #b00;
}
.message {
  margin-top: 1.5rem;
  padding: 0.8em 1.2em;
  border-radius: 6px;
  font-weight: 600;
  text-align: center;
}
.message.success {
  background: #e0ffe0;
  color: #1a7a1a;
  border: 1px solid #7ad67a;
}
.message.error {
  background: #ffe0e0;
  color: #a11a1a;
  border: 1px solid #d67a7a;
}
.btn.new-quiz {
  background: #4a0c0c;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 0.6em 1.2em;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1rem;
  align-self: flex-end;
}
.delete-btn {
  background: #b00;
  color: #fff;
  border: none;
  border-radius: 5px;
  padding: 0.3em 0.6em;
  font-size: 0.8em;
  cursor: pointer;
  transition: background 0.2s;
}
.delete-btn:hover {
  background: #800;
}
</style> 