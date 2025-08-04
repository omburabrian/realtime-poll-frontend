<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card-title class="pl-0 text-h4 font-weight-bold">
          Generate AI Questions
        </v-card-title>
        <p class="text-body-1 mt-2">Add AI-generated questions to your quiz</p>
      </v-col>
      
      <!-- Simple AI Generation Form -->
      <v-col cols="12">
        <v-card class="elevation-3">
          <v-card-text>
            <v-row>
              <v-col cols="6">
                <v-text-field
                  v-model="aiForm.topic"
                  label="Topic"
                  placeholder="e.g., Software Engineering, Math, Science..."
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model="aiForm.numQuestions"
                  label="Number of Questions"
                  type="number"
                  min="1"
                  max="20"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="3">
                <v-text-field
                  v-model="aiForm.gradeLevel"
                  label="Grade Level"
                  placeholder="e.g., 10th Grade"
                  required
                ></v-text-field>
              </v-col>
              <v-col cols="12">
                <v-textarea
                  v-model="aiForm.instructions"
                  label="Extra Instructions (Optional)"
                  placeholder="Any specific instructions for AI generation..."
                  rows="2"
                ></v-textarea>
              </v-col>
            </v-row>
          </v-card-text>
          
          <v-card-actions class="d-flex justify-end mb-2">
            <v-btn
              color="blue"
              variant="elevated"
              size="large"
              @click="generateQuestions"
              :loading="generating"
              :disabled="!canGenerate"
            >
              <v-icon icon="mdi-robot" start></v-icon>
              Generate Questions
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>

      <!-- Generated Questions Preview -->
      <v-col cols="12" v-if="generatedQuestions.length > 0">
        <v-card class="elevation-3">
          <v-card-title class="d-flex justify-space-between align-center">
            <span>Generated Questions ({{ generatedQuestions.length }})</span>
            <v-btn
              color="primary"
              variant="elevated"
              @click="addQuestionsToQuiz"
              :loading="adding"
            >
              Add to Quiz
            </v-btn>
          </v-card-title>
          
          <v-card-text>
            <v-table class="elevation-1">
              <thead>
                <tr>
                  <th class="text-center">#</th>
                  <th class="text-left">Question</th>
                  <th class="text-left">Options</th>
                  <th class="text-left">Correct Answer</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(question, index) in generatedQuestions" :key="index">
                  <td class="text-center">{{ index + 1 }}</td>
                  <td>
                    <span class="text-body-1">{{ question.text }}</span>
                  </td>
                  <td>
                    <div v-if="question.optionA">A. {{ question.optionA }}</div>
                    <div v-if="question.optionB">B. {{ question.optionB }}</div>
                    <div v-if="question.optionC">C. {{ question.optionC }}</div>
                    <div v-if="question.optionD">D. {{ question.optionD }}</div>
                  </td>
                  <td>
                    <span class="font-weight-bold" style="color: green;">
                      {{ question.correctOption }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar.show" :color="snackbar.color" rounded="pill">
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn variant="text" @click="snackbar.show = false">Close</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

// AI Generation form
const aiForm = ref({
  topic: "",
  numQuestions: 5,
  gradeLevel: "",
  instructions: ""
})

// Generated questions
const generatedQuestions = ref([])

// UI state
const generating = ref(false)
const adding = ref(false)

// Snackbar
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
})

// Computed properties
const canGenerate = computed(() => {
  return aiForm.value.topic && aiForm.value.gradeLevel && aiForm.value.numQuestions > 0
})

// Methods
function showSnackbar(message, color = 'success') {
  snackbar.value = {
    show: true,
    message,
    color
  }
}

async function generateQuestions() {
  if (!canGenerate.value) {
    showSnackbar('Please fill in topic, grade level, and number of questions', 'error')
    return
  }

  // Additional validation
  if (aiForm.value.numQuestions < 1 || aiForm.value.numQuestions > 20) {
    showSnackbar('Number of questions must be between 1 and 20', 'error')
    return
  }

  if (!aiForm.value.topic.trim()) {
    showSnackbar('Please enter a valid topic', 'error')
    return
  }

  if (!aiForm.value.gradeLevel.trim()) {
    showSnackbar('Please enter a valid grade level', 'error')
    return
  }

  generating.value = true
  console.log('Starting question generation...')
  
  try {
    const prompt = `Generate exactly ${aiForm.value.numQuestions} multiple choice questions on the topic '${aiForm.value.topic}' for grade ${aiForm.value.gradeLevel}. You must generate exactly ${aiForm.value.numQuestions} questions, no more, no less. 

IMPORTANT: You must respond with ONLY valid JSON format. Do not include any other text, explanations, or formatting.

Return ONLY this JSON structure:
[
  {
    "text": "Question text here",
    "optionA": "Option A text",
    "optionB": "Option B text", 
    "optionC": "Option C text",
    "optionD": "Option D text",
    "correctOption": "A"
  }
]

Rules:
- Use "A", "B", "C", or "D" for correctOption
- Make sure all questions have exactly 4 options
- Ensure the JSON is valid and properly formatted
- Do not include any text before or after the JSON array

${aiForm.value.instructions ? ' Additional instructions: ' + aiForm.value.instructions : ''}`
    
    console.log('Sending request to Cohere API...')
    console.log('Prompt:', prompt)
    
    const response = await axios.post('https://api.cohere.ai/v1/generate', {
      model: 'command',
      prompt: prompt,
      max_tokens: 3000,
      temperature: 0.7,
      k: 0,
      stop_sequences: [],
      return_likelihoods: 'NONE'
    }, {
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_COHERE_API_KEY || 'IU3cGCCNmK6aDujflkqbQmjc57zlHRSmzvjJqtQR'}`,
        'Content-Type': 'application/json'
      }
    })

    console.log('API Response received:', response.data)
    
    if (!response.data.generations || !response.data.generations[0]) {
      throw new Error('Invalid response format from API')
    }

    const text = response.data.generations[0].text
    console.log('Cohere raw response text:', text)
    
    const parsedQuestions = parseCohereResponse(text)
    console.log('Parsed questions result:', parsedQuestions)
    
    if (parsedQuestions.length > 0) {
      generatedQuestions.value = parsedQuestions
      showSnackbar(`Generated ${parsedQuestions.length} questions successfully`)
    } else {
      showSnackbar('Could not parse any questions from AI response', 'error')
    }
  } catch (error) {
    console.error('Error generating questions:', error)
    console.error('Error details:', error.response?.data || error.message)
    showSnackbar(`Failed to generate questions: ${error.message}`, 'error')
  } finally {
    generating.value = false
  }
}

function parseCohereResponse(text) {
  console.log('Raw AI response:', text)
  
  try {
    // Clean the text - remove any leading/trailing whitespace and newlines
    const cleanedText = text.trim()
    
    // Try to parse the entire response as JSON first
    try {
      const parsedQuestions = JSON.parse(cleanedText)
      if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
        const validQuestions = validateAndCleanQuestions(parsedQuestions)
        if (validQuestions.length > 0) {
          console.log('Successfully parsed JSON questions:', validQuestions)
          return validQuestions
        }
      }
    } catch (directParseError) {
      console.log('Direct JSON parse failed, trying to extract JSON...')
    }
    
    // Try to extract JSON array from the text
    const jsonMatch = cleanedText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const jsonString = jsonMatch[0]
      const parsedQuestions = JSON.parse(jsonString)
      
      if (Array.isArray(parsedQuestions) && parsedQuestions.length > 0) {
        const validQuestions = validateAndCleanQuestions(parsedQuestions)
        if (validQuestions.length > 0) {
          console.log('Successfully extracted and parsed JSON questions:', validQuestions)
          return validQuestions
        }
      }
    }
    
    // Fallback to text parsing if JSON parsing fails
    console.log('JSON parsing failed, trying text parsing...')
    return parseTextFormat(text)
    
  } catch (error) {
    console.error('Error parsing JSON response:', error)
    console.log('Falling back to text parsing...')
    return parseTextFormat(text)
  }
}

function validateAndCleanQuestions(questions) {
  return questions.filter(q => {
    // Check if all required fields exist and are not empty
    return q.text && 
           q.optionA && 
           q.optionB && 
           q.optionC && 
           q.optionD && 
           q.correctOption &&
           typeof q.text === 'string' &&
           typeof q.optionA === 'string' &&
           typeof q.optionB === 'string' &&
           typeof q.optionC === 'string' &&
           typeof q.optionD === 'string' &&
           typeof q.correctOption === 'string'
  }).map(q => ({
    text: q.text.trim(),
    optionA: q.optionA.trim(),
    optionB: q.optionB.trim(),
    optionC: q.optionC.trim(),
    optionD: q.optionD.trim(),
    correctOption: q.correctOption.trim().toUpperCase()
  }))
}

function parseTextFormat(text) {
  const questions = []
  
  // Split by question blocks (lines starting with numbers)
  const lines = text.split('\n').filter(line => line.trim())
  let currentQuestion = null
  let currentOptions = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    
    // Check if this line starts a new question (starts with number and dot)
    if (/^\d+\./.test(line)) {
      // Save previous question if exists
      if (currentQuestion && currentOptions.length >= 4) {
        questions.push({
          text: currentQuestion.replace(/^\d+\.\s*/, '').replace(/\s+\d+\.\s*/g, ' ').trim(),
          optionA: currentOptions[0] || '',
          optionB: currentOptions[1] || '',
          optionC: currentOptions[2] || '',
          optionD: currentOptions[3] || '',
          correctOption: currentOptions[4] || 'A'
        })
      }
      
      // Start new question
      currentQuestion = line
      currentOptions = []
    }
    // Check for option A
    else if (/^A[\)\.:-]/.test(line)) {
      currentOptions[0] = line.replace(/^A[\)\.:-]\s*/, '').trim()
    }
    // Check for option B
    else if (/^B[\)\.:-]/.test(line)) {
      currentOptions[1] = line.replace(/^B[\)\.:-]\s*/, '').trim()
    }
    // Check for option C
    else if (/^C[\)\.:-]/.test(line)) {
      currentOptions[2] = line.replace(/^C[\)\.:-]\s*/, '').trim()
    }
    // Check for option D
    else if (/^D[\)\.:-]/.test(line)) {
      currentOptions[3] = line.replace(/^D[\)\.:-]\s*/, '').trim()
    }
    // Check for answer
    else if (/^Answer[:\s-]*([A-D])/i.test(line)) {
      const answerMatch = line.match(/^Answer[:\s-]*([A-D])/i)
      currentOptions[4] = answerMatch ? answerMatch[1] : 'A'
    }
    // If line doesn't match any pattern, it might be continuation of question text
    else if (currentQuestion && !currentQuestion.includes(line)) {
      currentQuestion += ' ' + line
    }
  }
  
  // Don't forget the last question
  if (currentQuestion && currentOptions.length >= 4) {
    questions.push({
      text: currentQuestion.replace(/^\d+\.\s*/, '').replace(/\s+\d+\.\s*/g, ' ').trim(),
      optionA: currentOptions[0] || '',
      optionB: currentOptions[1] || '',
      optionC: currentOptions[2] || '',
      optionD: currentOptions[3] || '',
      correctOption: currentOptions[4] || 'A'
    })
  }
  
  console.log('Parsed text questions:', questions)
  return questions
}

async function addQuestionsToQuiz() {
  adding.value = true
  
  try {
    // Store the generated questions in localStorage so QuizEdit can access them
    localStorage.setItem('generatedQuestions', JSON.stringify(generatedQuestions.value))
    
    showSnackbar('Questions ready to add to quiz!')
    
    // Navigate back to QuizEdit - try multiple navigation methods
    setTimeout(() => {
      try {
        // Try to go back to previous page
        if (window.history.length > 1) {
          router.go(-1)
        } else {
          // Fallback to QuizEdit route
          router.push({ name: 'quizEdit', params: { id: 'new' } })
        }
      } catch (navError) {
        console.error('Navigation error:', navError)
        // Final fallback
        window.location.href = '/admin'
      }
    }, 1000)
    
  } catch (error) {
    console.error('Error preparing questions:', error)
    showSnackbar('Failed to prepare questions', 'error')
  } finally {
    adding.value = false
  }
}
</script>

<style scoped>
.v-table table thead th {
  background-color: rgb(114, 26, 54) !important;
  color: white;
  text-transform: uppercase;
}

.v-table table td {
  padding: 16px !important;
  vertical-align: top;
  font-size: 16px;
}
</style> 