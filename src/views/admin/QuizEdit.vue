<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import PollServices from "../../services/PollServices";
import QuestionServices from "../../services/QuestionServices";
import AnswerServices from "../../services/AnswerServices";

const route = useRoute();
const pollId = route.params.id;
const poll = ref({});
const user = ref(null);
const questions = ref([]);
const addQuestionDialog = ref(false);
const editQuestionDialog = ref(false);

const newQuestion = ref({
  text: "",
  questionType: "",
  answers: [{ text: "", isCorrectAnswer: false }],
});

//load user data from localStorage, get poll details, questions, and answers on component mount
onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getPoll();
  await getQuestions();
  await getAnswers();
});

//snackbar logic
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

//get the poll details with the pollID
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

//get the poll questions
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

//get answers for the poll questions
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

//update the poll name and description
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

//update question and its answers after editing
async function updateQuestionAndAnswer() {
  try {
    const questionData = {
      text: newQuestion.value.text,
      questionType: newQuestion.value.questionType,
      pollId: pollId,
    };

    await QuestionServices.updateQuestionAndAnswer(
      newQuestion.value.id,
      questionData
    );

    for (const [index, answer] of newQuestion.value.answers.entries()) {
      const answerData = {
        text: answer.text,
        isCorrectAnswer: answer.isCorrectAnswer,
        answerIndex: index,
        questionId: newQuestion.value.id,
      };

      //update an answer if it exists, otherwise create a new one
      if (answer.id) {
        await AnswerServices.updateQuestionAndAnswer(answer.id, {
          id: answer.id,
          ...answerData,
        });

        //debug
        console.log("Answer updated:", answerData);
      } else {
        await AnswerServices.createAnswer(newQuestion.value.id, answerData);
        console.log("Answer created:", answerData);
      }
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

//add an answer text-field to the question dialog
function addAnswer(qIndex) {
  qIndex.answers.push({ text: "", isCorrectAnswer: false });
}

//delete answer from a question and remove from UI
async function removeAnswerFromDialog(answerIndex, answer) {
  newQuestion.value.answers.splice(answerIndex, 1);
  if (answer.id) {
    try {
      await AnswerServices.deleteAnswer(answer.id);
      snackbar.value = {
        value: true,
        color: "green",
        text: `Answer ${answer.id} deleted successfully!`,
      };
    } catch (error) {
      console.error(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    }
  }
}

//delete a question and its answers
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

//create a new question with answers. Includes validation checks
async function createQuestionAndAnswer() {
  try {
    // Validation stuff
    if (!newQuestion.value.questionType) {
      snackbar.value = {
        value: true,
        color: "error",
        text: "Question type required.",
      };
      return;
    }
    if (!newQuestion.value.text || !newQuestion.value.text.trim()) {
      snackbar.value = {
        value: true,
        color: "error",
        text: "Please enter a question.",
      };
      return;
    }
    const answers = newQuestion.value.answers;
    if (answers.length === 0) {
      snackbar.value = {
        value: true,
        color: "error",
        text: "At least one answer is required.",
      };
      return;
    }

    const type = newQuestion.value.questionType;
    if (type === "multiple_choice") {
      const hasCorrect = answers.some((a) => a.isCorrectAnswer);
      if (!hasCorrect) {
        snackbar.value = {
          value: true,
          color: "error",
          text: "At least one correct answer is required.",
        };
        return;
      }
    }

    if (type === "true_false") {
      const tfAnswer = answers.every(
        (a) => a.text === "True" || a.text === "False"
      );
      const hasCorrect = answers.some((a) => a.isCorrectAnswer);
      if (!tfAnswer || !hasCorrect) {
        snackbar.value = {
          value: true,
          color: "error",
          text: "Please mark answer as True/False and select as correct.",
        };
        return;
      }
    }
    if (type === "short_answer") {
      const answer = answers[0];

      if (!answer || !answer.text?.trim() || !answer.isCorrectAnswer) {
        snackbar.value = {
          value: true,
          color: "error",
          text: "Enter an answer and mark it as correct.",
        };
        return;
      }
    }

    const questionData = {
      ...newQuestion.value,
      pollId: pollId,
      questionNumber: questions.value.length + 1,
    };

    const res = await QuestionServices.createQuestion(questionData);
    //debug
    console.log("data being sent", questionData);

    const questionId = res.data.id;

    for (let index = 0; index < answers.length; index++) {
      const answer = answers[index];
      const answerData = {
        text: answer.text,
        answerIndex: index,
        isCorrectAnswer: answer.isCorrectAnswer,
      };
      await AnswerServices.createAnswer(questionId, answerData);

      //debug
      console.log("data being sent", answerData);
    }
    snackbar.value.value = true;
    snackbar.value.color = "green";
    snackbar.value.text = `Question ${questionId} and its answers created successfully!`;
  } catch (error) {
    console.error(error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = error.response.data.message;
  }
  await getQuestions();
  await getAnswers();
  addQuestionDialog.value = false;
}

//open the add question dialog and reset values
function addQuestion() {
  newQuestion.value = {
    text: "",
    questionType: "",
    answers: [{ text: "", isCorrect: false }],
    number: questions.value.length + 1,
  };
  addQuestionDialog.value = true;
}

//close the add question dialog
function closeAddQuestion() {
  addQuestionDialog.value = false;
}

//edit question and its answers
function editQuestion(item) {
  // Prepare answers array
  let answers = (item.answers || []).map((answer) => ({
    id: answer.id,
    text: answer.text,
    isCorrectAnswer: answer.isCorrectAnswer,
  }));

  newQuestion.value = {
    id: item.id,
    text: item.text,
    questionType: item.questionType,
    answers,
    number: item.questionNumber,
  };
  editQuestionDialog.value = true;
}

//close the edit question dialog
function closeEditQuestion() {
  editQuestionDialog.value = false;
}

//close the snackbar
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

      <v-row class="mb-5">
        <v-col cols="12" class="d-flex justify-end">
          <v-btn
            v-if="user !== null"
            color="primary"
            class="mr-5"
            variant="outlined"
            elevation="3"
            @click="updateQuiz()"
            >Update quiz</v-btn
          >
          <v-btn
            v-if="user !== null"
            color="amber"
            @click="addQuestion()"
            class="mr-5"
            ><v-icon icon="mdi-plus" start></v-icon>Add Question</v-btn
          >
          <v-btn v-if="user !== null" color="blue" @click="" class="mr-5"
            ><v-icon icon="mdi-plus" start></v-icon>Add Question With AI</v-btn
          >
        </v-col>
      </v-row>

      <v-col cols="12" class="mb-5 mt-5">
        <v-table
          v-if="questions.length > 0"
          class="elevation-10"
          fixed-header
          density="comfortable"
          style="max-height: 70vh; overflow-y: auto"
        >
          <thead>
            <tr>
              <th class="text-left">Question Number</th>
              <th class="text-left">Question</th>
              <th class="text-left">Question Type</th>
              <th class="text-left" colspan="2">Answers</th>
              <th class="text-left">Edit/Delete</th>
              <!-- ToDO: Implement Shuffle Answer -->
              <!-- <th class="text-left">Shuffle Answer</th> -->
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in questions" :key="item.number">
              <td>{{ item.questionNumber }}</td>
              <td>{{ item.text }}</td>
              <td>
                {{
                  item.questionType === "multiple_choice"
                    ? "Multiple Choice"
                    : item.questionType === "true_false"
                    ? "True/False"
                    : item.questionType === "short_answer"
                    ? "Short Answer"
                    : item.questionType
                }}
              </td>
              <td colspan="2">
                <ol v-if="item.questionType === 'multiple_choice'" type="A">
                  <li v-for="(answer, index) in item.answers" :key="index">
                    {{ answer.text }} —
                    <span
                      :style="{
                        color: answer.isCorrectAnswer ? 'green' : 'gray',
                      }"
                    >
                      {{
                        answer.isCorrectAnswer
                          ? "Correct Answer"
                          : "Incorrect Answer"
                      }}
                    </span>
                  </li>
                </ol>
                <ul v-else>
                  <li v-for="(answer, index) in item.answers" :key="index">
                    {{ answer.text }} —
                    <span
                      :style="{
                        color: answer.isCorrectAnswer ? 'green' : 'gray',
                      }"
                    >
                      {{
                        answer.isCorrectAnswer
                          ? "Correct Answer"
                          : "Incorrect Answer"
                      }}
                    </span>
                  </li>
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
        <div v-else>
          <h3>No Questions In Poll. Please add Questions</h3>
        </div>
      </v-col>
      <v-col cols="12">
        <v-dialog
          persistent
          :model-value="addQuestionDialog || editQuestionDialog"
          max-width="1000px"
        >
          <v-card class="rounded-lg elevation-5">
            <v-card-title class="headline mb-2">
              {{
                addQuestionDialog
                  ? "Add Question"
                  : editQuestionDialog
                  ? "Edit Question"
                  : ""
              }}
            </v-card-title>

            <v-card-text>
              <div>
                <v-select
                  v-model="newQuestion.questionType"
                  :items="[
                    { text: 'Multiple Choice', value: 'multiple_choice' },
                    { text: 'True/False', value: 'true_false' },
                    { text: 'Short Answer', value: 'short_answer' },
                  ]"
                  item-title="text"
                  item-value="value"
                  label="Question Type"
                  class="mb-2"
                ></v-select>

                <v-text-field
                  v-model="newQuestion.text"
                  label="Question"
                ></v-text-field>

                <!-- Multiple Choice Answers -->
                <div v-if="newQuestion.questionType === 'multiple_choice'">
                  <div
                    v-for="(answer, answerIndex) in newQuestion.answers"
                    :key="answer.id || answerIndex"
                    class="d-flex align-center mb-3"
                  >
                    <v-text-field
                      v-model="answer.text"
                      class="mr-5"
                      hide-details
                      label="Answer"
                    ></v-text-field>

                    <v-checkbox
                      v-model="answer.isCorrectAnswer"
                      :color="answer.isCorrectAnswer ? 'green' : ''"
                      class="mr-5"
                      hide-details
                      label="Correct Answer"
                    ></v-checkbox>

                    <v-icon
                      size="large"
                      icon="mdi-delete"
                      @click="removeAnswerFromDialog(answerIndex, answer)"
                      color="red"
                      class="mr-4 ml-2"
                    ></v-icon>
                  </div>
                  <v-btn
                    variant="text"
                    color="primary"
                    @click="addAnswer(newQuestion)"
                    class="ml-4"
                  >
                    <v-icon icon="mdi-plus" start></v-icon> Add Answer
                  </v-btn>
                </div>

                <!-- True/False Answers -->
                <div v-if="newQuestion.questionType === 'true_false'">
                  <v-label class="mb-2">Select Answer</v-label>
                  <div
                    v-for="(answer, answerIndex) in newQuestion.answers"
                    :key="answer.id || answerIndex"
                    class="d-flex align-center mb-3"
                  >
                    <v-col>
                      <v-radio-group v-model="answer.text" inline>
                        <v-radio label="True" value="True"></v-radio>
                        <v-radio
                          label="False"
                          value="False"
                        ></v-radio> </v-radio-group
                    ></v-col>
                    <div class="d-flex align-center" style="gap: 25px">
                      <v-checkbox
                        v-model="answer.isCorrectAnswer"
                        :color="answer.isCorrectAnswer ? 'green' : 'gray'"
                        label="Correct Answer"
                        hide-details
                      />
                      <v-icon
                        size="large"
                        icon="mdi-delete"
                        @click="removeAnswerFromDialog(answerIndex, answer)"
                        color="red"
                      />
                    </div>
                  </div>
                </div>

                <!-- Short Answer -->
                <div v-if="newQuestion.questionType === 'short_answer'">
                  <div
                    v-for="(answer, answerIndex) in newQuestion.answers"
                    :key="answer.id || answerIndex"
                    class="d-flex align-center mb-3"
                  >
                    <v-text-field
                      v-model="answer.text"
                      label="Answer"
                      class="mr-5"
                      hide-details
                    ></v-text-field>

                    <v-checkbox
                      v-model="answer.isCorrectAnswer"
                      :color="answer.isCorrectAnswer ? 'green' : 'gray'"
                      label="Correct Answer"
                      hide-details
                    ></v-checkbox>

                    <v-icon
                      size="large"
                      icon="mdi-delete"
                      @click="removeAnswerFromDialog(answerIndex, answer)"
                      color="red"
                      class="mr-4 ml-2"
                    ></v-icon>
                  </div>

                  <v-btn
                    v-if="newQuestion.questionType !== 'short_answer'"
                    variant="text"
                    color="primary"
                    @click="addAnswer(newQuestion)"
                    class="ml-4"
                  >
                    <v-icon icon="mdi-plus" start></v-icon> Add Answer
                  </v-btn>
                </div>
              </div>
            </v-card-text>

            <v-card-actions>
              <v-spacer />
              <v-btn
                variant="flat"
                color="primary"
                @click="
                  editQuestionDialog
                    ? updateQuestionAndAnswer()
                    : createQuestionAndAnswer()
                "
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
              >
                Close
              </v-btn>
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

.v-table ol li,
.v-table ul li {
  margin-bottom: 8px;
}
</style>
