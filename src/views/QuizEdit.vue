<script setup>
import { ref } from "vue";
//const user = ref(null);
const questions = ref([
  {
    number: 1,
    name: "What is the capital of France?",
    questionType: "Multiple-Choice",
    answers: [
      { text: "Paris", isCorrect: true },
      { text: "London", isCorrect: false },
      { text: "Berlin", isCorrect: false },
    ],
  },
  {
    number: 2,
    name: "2 + 2 equals?",
    questionType: "Multiple-Choice",
    answers: [
      { text: "3", isCorrect: false },
      { text: "4", isCorrect: true },
      { text: "5", isCorrect: false },
    ],
  },
  {
    number: 3,
    name: "Describe your favorite book.",
    questionType: "Open-Ended",
    answers: [],
  },
  {
    number: 4,
    name: "Which language is primarily used for Android development?",
    questionType: "Multiple-Choice",
    answers: [
      { text: "Kotlin", isCorrect: true },
      { text: "Swift", isCorrect: false },
      { text: "Ruby", isCorrect: false },
    ],
  },
  {
    number: 5,
    name: "Name one personal goal you have for this year.",
    questionType: "Open-Ended",
    answers: [],
  },
  {
    number: 6,
    name: "What color is the sky on a clear day?",
    questionType: "Multiple-Choice",
    answers: [
      { text: "Blue", isCorrect: true },
      { text: "Green", isCorrect: false },
      { text: "Red", isCorrect: false },
    ],
  },
  {
    number: 7,
    name: "What's your preferred method of learning new tech?",
    questionType: "Open-Ended",
    answers: [],
  },
  {
    number: 8,
    name: "Which of these is a JavaScript framework?",
    questionType: "Multiple-Choice",
    answers: [
      { text: "Vue", isCorrect: true },
      { text: "Laravel", isCorrect: false },
      { text: "Django", isCorrect: false },
    ],
  },
  {
    number: 9,
    name: "Who wrote 'Romeo and Juliet'?",
    questionType: "Multiple-Choice",
    answers: [
      { text: "William Shakespeare", isCorrect: true },
      { text: "Jane Austen", isCorrect: false },
      { text: "Mark Twain", isCorrect: false },
    ],
  },
  {
    number: 10,
    name: "Explain what REST API means.",
    questionType: "Open-Ended",
    answers: [],
  },
]);

const newQuestion = ref({
  id: undefined,
  name: undefined,
  number: undefined,
  questionType: undefined,
  answers: undefined,
});
//const answers = ref([]);
const addQuestionDialog = ref(false);
const editQuestionDialog = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

function addQuestion() {
  newQuestion.value = {
    text: "",
    questionType: "Multiple-Choice",
    answers: [{ text: "", isCorrect: false }],
  };
}
function submitQuiz() {
  // This is where you would send the quiz and questions to the backend
  console.log("Quiz submitted with questions:", questions.value);
}
function openQuestionDialog() {
  addQuestionDialog.value = true;
  // addQuestion();
  editQuestionDialog.value = false;
}

function closeAddQuestionDialog() {
  newQuestion.value.name = "";
  newQuestion.value.number = undefined;
  newQuestion.value.questionType = "";
  //newQuestion.value.answers = item.answers;
  addQuestionDialog.value = false;
}
function closeEditQuestionDialog() {
  // newQuestion.value.name = newQuestion.value.name;
  // newQuestion.value.number = newQuestion.value.number;
  // newQuestion.value.questionType = newQuestion.value.questionType;
  // newQuestion.value.answers = newQuestion.value.answers;
  editQuestionDialog.value = false;
}
function addAnswer(qIndex) {
  questions.value[qIndex].answers.push({ text: "", isCorrect: false });
}

function removeAnswer(qIndex, aIndex) {
  questions.value[qIndex].answers.splice(aIndex, 1);
}
function deleteQuestion(item) {
  const index = questions.value.indexOf(item);
  if (index > -1) {
    questions.value.splice(index, 1);
    snackbar.value.value = true;
    snackbar.value.color = "green";
    snackbar.value.text = "Question deleted successfully!";
  } else {
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = "Error deleting question.";
  }
}
function editQuestion(item) {
  newQuestion.value.name = item.name;
  newQuestion.value.number = item.number;
  newQuestion.value.questionType = item.questionType;
  newQuestion.value.answers = item.answers;
  addQuestionDialog.value = false;
  editQuestionDialog.value = true;
}
function saveQuestion() {
  if (addQuestionDialog.value) {
    questions.value.push(newQuestion.value);
    snackbar.value.value = true;
    snackbar.value.color = "green";
    snackbar.value.text = "Question added successfully!";
  } else if (editQuestionDialog.value) {
    const index = questions.value.findIndex(
      (q) => q.number === newQuestion.value.number
    );
    if (index !== -1) {
      questions.value[index] = newQuestion.value;
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "Question updated successfully!";
    } else {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = "Error updating question.";
    }
  }
  addQuestionDialog.value = false;
  editQuestionDialog.value = false;
}
</script>
<template>
  <v-container>
    <v-row>
      <v-col>
        <v-card-title class="pl-0 text-h4 font-weight-bold"
          >Quiz Edit
        </v-card-title>
      </v-col>

      <v-col cols="12">
        <v-form>
          <v-text-field label="Quiz Name"></v-text-field>
          <v-textarea label="Description" rows="3"></v-textarea>
        </v-form>
      </v-col>
      <v-col>
        <v-btn
          v-if="user !== null"
          color="primary"
          @click="openQuestionDialog()"
          density="compact"
          class="mr-5"
          >Add Question</v-btn
        >

        <v-btn
          v-if="user !== null"
          color="blue"
          @click=""
          density="compact"
          elevation="4"
          >Add Question with AI</v-btn
        >
      </v-col>
      <v-col cols="12" class="mb-4">
        <v-table
          v-if="questions.length > 0"
          class="rounded-lg elevation-5"
          height="500px"
          fixed-header
          density="comfortable"
        >
          <thead>
            <tr>
              <th class="text-left">Number</th>
              <th class="text-left">Question</th>
              <th class="text-left">Type</th>
              <th class="text-left">Answers</th>
              <th class="text-left">Is Correct</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in questions" :key="item.number">
              <td>{{ item.number }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.questionType }}</td>
              <td>
                <ul v-for="answer in item.answers" :key="answer.text">
                  {{
                    answer.text
                  }}
                </ul>
              </td>
              <td>
                <ul v-for="answer in item.answers" :key="answer.text">
                  {{
                    answer.isCorrect ? "Yes" : "No"
                  }}
                </ul>
              </td>
              <td>
                <v-icon
                  size="small"
                  icon="mdi-pencil"
                  @click="editQuestion(item)"
                  class="mr-4"
                ></v-icon>
                <v-icon
                  size="small"
                  icon="mdi-delete"
                  @click="deleteQuestion(item)"
                  color="red"
                ></v-icon>
              </td>
            </tr>
          </tbody>
        </v-table>
        <div v-else>No questions in poll to display</div>
      </v-col>

      <v-col cols="2">
        <v-btn v-if="user !== null" color="primary" @click="submitQuiz()"
          >submit quiz</v-btn
        >
      </v-col>
      <v-col cols="12">
        <v-dialog
          persistent
          :model-value="addQuestionDialog || editQuestionDialog"
          max-width="800px"
        >
          <v-card class="rounded-lg elevation-5">
            <v-card-title class="headline mb-2">{{
              addQuestionDialog
                ? "Add Question"
                : editQuestionDialog
                ? "Edit Question"
                : ""
            }}</v-card-title>
            <v-card-text>
              <div>
                <v-select
                  v-model="newQuestion.questionType"
                  :items="['Multiple-Choice', 'Open-Ended']"
                  label="Question Type"
                  class="mb-2"
                ></v-select>
                <v-text-field
                  v-model="newQuestion.name"
                  label="Question"
                ></v-text-field>
                <v-text-field
                  v-model="newQuestion.number"
                  label="Question Number"
                  type="number"
                  max="10"
                  min="1"
                ></v-text-field>

                <div v-if="newQuestion.questionType === 'Multiple-Choice'">
                  <div
                    v-for="(answer, id) in newQuestion.answers"
                    :key="id"
                    class="d-flex align-center mb-3"
                  >
                    <v-checkbox
                      v-model="answer.isCorrect"
                      class="mr-5"
                      hide-details
                      label="Correct Answer"
                    ></v-checkbox>
                    <v-text-field v-model="answer.text" label="Answer" />
                    <v-icon
                      size="small"
                      color="red"
                      icon="mdi-delete"
                      @click="removeAnswer(id, aIndex)"
                      class="ml-5"
                    />
                  </div>
                  <v-btn
                    color="primary"
                    variant="flat"
                    size="small"
                    @click="addAnswer(id)"
                  >
                    Add Answer
                  </v-btn>
                </div>
              </div>
            </v-card-text>
            <v-card-actions>
              <v-if v-if="addQuestionDialog">
                <v-btn variant="flat" color="primary" @click="" class="ml-4"
                  >Add Next Question</v-btn
                >
              </v-if>
              <v-spacer />
              <v-btn variant="flat" color="primary" @click="saveQuestion()">
                Save
                <v-icon icon="mdi-checkbox-marked-circle" end></v-icon></v-btn
              ><v-btn
                color="primary"
                @click="
                  addQuestionDialog
                    ? closeAddQuestionDialog()
                    : editQuestionDialog
                    ? closeEditQuestionDialog()
                    : false
                "
                >Close</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-dialog>
      </v-col>
    </v-row>
    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}

      <template v-slot:actions>
        <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>
