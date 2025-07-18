<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import QuizEditServices from "../services/QuizEditServices";

const route = useRoute();
const pollId = route.params.id;
const poll = ref({});
const user = ref(null);

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getPoll();
});

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

async function getPoll() {
  await QuizEditServices.getPoll(pollId)
    .then((response) => {
      poll.value = response.data[0];
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

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
]);

const newQuestions = ref([
  {
    name: "",
    number: 0,
    questionType: "Multiple-Choice",
    answers: [{ text: "", isCorrect: false }],
  },
]);
//const answers = ref([]);
const addQuestionDialog = ref(false);
const editQuestionDialog = ref(false);

function submitQuiz() {
  // This is where you would send the quiz and questions to the backend
  console.log("Quiz submitted with questions:", questions.value);
}
// function openQuestionDialog() {
//   addQuestionDialog.value = true;
//   // addQuestion();
//   //editQuestionDialog.value = false;
// }

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
function saveQuestion() {
  const isAddMode = addQuestionDialog.value;
  const isEditMode = editQuestionDialog.value;

  if (isAddMode) {
    // Add new question
    questions.value.push({
      ...newQuestions.value,
      number: questions.value.length + 1,
    });
    showSnackbar("Question added successfully!", "green");
  } else if (isEditMode) {
    // Update existing question
    const index = questions.value.findIndex(
      (q) => q.number === newQuestions.value.number
    );
    if (index >= 0) {
      questions.value[index] = { ...newQuestions.value };
      showSnackbar("Question updated successfully!", "green");
    } else {
      showSnackbar("Error updating question.", "error");
    }
  }

  // Reset dialogs
  addQuestionDialog.value = false;
  editQuestionDialog.value = false;
}

// Helper function for snackbar
function showSnackbar(text, color) {
  snackbar.value = { value: true, color, text };
}
function addAnotherQuestion() {
  //TODO: Implement logic to add another question
}
function addQuestion() {
  delete newQuestions.value.number;
  delete newQuestions.value.name;
  delete newQuestions.value.answers;
  delete newQuestions.value.questionType;
  newQuestions.value.text = "";
  newQuestions.value.questionType = "";
  newQuestions.value.answers = [{ text: "", isCorrect: false }];
  addQuestionDialog.value = true;
}
function closeAddQuestion() {
  addQuestionDialog.value = false;
}
function editQuestion(item) {
  newQuestions.value.name = item.name;
  newQuestions.value.number = item.number;
  newQuestions.value.questionType = item.questionType;
  newQuestions.value.answers = item.answers;
  editQuestionDialog.value = true;
}

function closeEditQuestion() {
  editQuestionDialog.value = false;
}
function closeSnackBar() {
  snackbar.value.value = false;
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
          <v-text-field label="Quiz Name" v-model="poll.name"></v-text-field>
          <v-textarea
            label="Description"
            v-model="poll.description"
            rows="3"
          ></v-textarea>
        </v-form>
      </v-col>
      <v-col>
        <v-btn
          v-if="user !== null"
          color="primary"
          @click="addQuestion()"
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
        <div v-else>No data to display</div>
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
              <div v-for="(question, qIndex) in newQuestions" :key="qIndex">
                <v-select
                  v-model="newQuestions.questionType"
                  :items="['Multiple-Choice', 'Open-Ended', 'True/False']"
                  label="Question Type"
                  class="mb-2"
                ></v-select>
                <v-text-field
                  v-model="newQuestions.name"
                  label="Question"
                ></v-text-field>
                <!-- <v-text-field
                  v-model.number="newQuestions.number"
                  label="Question Number"
                  type="number"
                  hidden
                  max="10"
                  min="1"
                ></v-text-field> -->

                <div v-if="newQuestions.questionType === 'Multiple-Choice'">
                  <div
                    v-for="(answer, id) in newQuestions.answers"
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
                <v-btn
                  variant="text"
                  color="primary"
                  @click="addAnotherQuestion()"
                  class="ml-4"
                  hidden
                  ><v-icon icon="mdi-plus" start></v-icon> Add Another
                  Question</v-btn
                >
              </v-if>
              <v-spacer />

              <v-btn variant="flat" color="primary" @click="saveQuestion()">
                {{ editQuestionDialog ? "Update Question" : "Save" }}
              </v-btn>
              <v-btn
                color="primary"
                @click="
                  addQuestionDialog
                    ? closeAddQuestion()
                    : editQuestionDialog
                    ? closeEditQuestion()
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
