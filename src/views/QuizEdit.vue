<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import PollServices from "../services/PollServices";
import QuestionServices from "../services/QuestionServices";
import AnswerServices from "../services/AnswerServices";

const route = useRoute();
const pollId = route.params.id; //get the poll ID from the route parameters
const poll = ref({});
const user = ref(null);
const questions = ref([]);
const addQuestionDialog = ref(false);
const editQuestionDialog = ref(false);

const newQuestion = ref({
  name: "",
  questionType: "",
  answers: [{ text: "", isCorrect: false }],
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getPoll();
  await getQuestions();
  await getAnswers();
});

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

//get the poll details with the poll ID
async function getPoll() {
  await PollServices.getPoll(pollId)
    .then((response) => {
      poll.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

//get poll questions
async function getQuestions() {
  await QuestionServices.getQuestionsForPoll(pollId)
    .then((response) => {
      questions.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

//get answers for poll questions
async function getAnswers() {
  try {
    for (const question of questions.value) {
      const res = await AnswerServices.getAnswersForQuestion(question.id);
      question.answers = res.data;
    }
  } catch (error) {
    console.error(error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = error.response.data.message;
  }
}

//update the quiz/poll
async function updateQuiz() {
  try {
    await PollServices.updatePoll(poll.value.id, poll.value).then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Poll ID ${poll.value.id} updated successfully!`;
    });
  } catch (error) {
    console.error(error);
    console.log(error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = error.response.data.message;
  }
  await getPoll();
}

//update question and its answers
async function updateQuestionAndAnswer() {
  try {
    await QuestionServices.updateQuestionInPoll(
      newQuestion.value.id,
      newQuestion.value
    );
    for (const answer of newQuestion.value.answers) {
      await AnswerServices.updateAnswerInQuestion(answer.id, answer);
    }
    snackbar.value.value = true;
    snackbar.value.color = "green";
    snackbar.value.text = `Question ${newQuestion.value.id} updated successfully!`;
  } catch (error) {
    console.log(error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = error.response.data.message;
  }
  await getQuestions();
  await getAnswers();
  editQuestionDialog.value = false;
}

function addAnswer(qIndex) {
  questions.value[qIndex].answers.push({ text: "", isCorrect: false });
}

function removeAnswer(qIndex, answerId) {
  questions.value[qIndex].answers.splice(answerId, 1);
}

//delete question and its answers
async function deleteQuestionandAnswer(question) {
  await AnswerServices.deleteAnswerFromQuestion(question.id);
  await QuestionServices.deleteQuestionFromPoll(question.id)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `Question ${question.id} and its answers deleted successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
  await getQuestions();
}

function showSnackbar(text, color) {
  snackbar.value = { value: true, color, text };
}
function addAnotherQuestion() {
  //TODO: Implement logic to add another question
}

function addQuestion() {
  // Reset new question data in v-dialog
  newQuestion.value = {
    name: "",
    questionType: "",
    answers: [{ text: "", isCorrect: false }],
    number: questions.value.length + 1,
  };
  addQuestionDialog.value = true;
}
function closeAddQuestion() {
  addQuestionDialog.value = false;
}

//edit poll question and its answers
function editQuestion(item) {
  newQuestion.value.name = item.name;
  newQuestion.value.number = item.number;
  newQuestion.value.questionType = item.questionType;
  newQuestion.value.answers = item.answers;
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
          class="rounded-lg elevation-5 mt-4 px-4 py-4"
          height="auto"
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
              <td>{{ item.questionNumber }}</td>
              <td>{{ item.text }}</td>
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
                  @click="deleteQuestionandAnswer(item)"
                  color="red"
                ></v-icon>
              </td>
            </tr>
          </tbody>
        </v-table>
        <div v-else>No data to display</div>
      </v-col>

      <v-col cols="2">
        <v-btn v-if="user !== null" color="primary" @click="updateQuiz()"
          >Update quiz</v-btn
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
                  :items="['multiple_choice', 'true_false', 'short_answer']"
                  label="Question Type"
                  class="mb-2"
                ></v-select>
                <v-text-field
                  v-model="questions.name"
                  label="Question"
                ></v-text-field>
                <div v-if="newQuestion.questionType === 'multiple_choice'">
                  <v-label class="mb-2">Answers</v-label>
                  <div
                    v-for="(answer, answerIndex) in newQuestion.answers"
                    :key="answerIndex"
                    class="d-flex align-center mb-3"
                  >
                    <v-text-field
                      v-model="newQuestion.answers[answerIndex].text"
                      class="mr-5"
                      hide-details
                      label="Answer"
                    ></v-text-field>
                    <v-checkbox
                      v-model="answer.isCorrect"
                      class="mr-5"
                      hide-details
                      label="Correct Answer"
                    ></v-checkbox>
                    <v-icon
                      size="small"
                      icon="mdi-delete"
                      @click="removeAnswer(newQuestion, answerIndex)"
                      color="red"
                    ></v-icon>
                  </div>
                  <v-btn
                    variant="text"
                    color="primary"
                    @click="addAnswer(newQuestion)"
                    class="ml-4"
                    ><v-icon icon="mdi-plus" start></v-icon> Add Answer</v-btn
                  >
                </div>
                <div v-if="newQuestion.questionType === 'true_false'">
                  <v-label class="mb-2">Select Answer</v-label>
                  <div
                    v-for="(answer, answerId) in newQuestion.answers"
                    :key="answerId"
                    class="d-flex align-center mb-3"
                  >
                    <v-radio-group
                      v-model="newQuestion.answers[answerId].text"
                      class="mr-5"
                      hide-details
                      inline
                    >
                      <v-radio label="True" value="True"></v-radio>
                      <v-radio label="False" value="False"></v-radio>
                    </v-radio-group>
                    <v-checkbox
                      v-model="answer.isCorrect"
                      class="mr-5"
                      hide-details
                      label="Correct Answer"
                    ></v-checkbox>
                  </div>
                </div>
              </div>
            </v-card-text>
            <v-card-actions>
              <!-- TODO: Implement logic to add another question -->
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
              <v-btn
                variant="flat"
                color="primary"
                @click="updateQuestionAndAnswer()"
              >
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
