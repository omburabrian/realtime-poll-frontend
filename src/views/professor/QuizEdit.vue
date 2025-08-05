<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import draggable from "vuedraggable";
import PollServices from "../../services/PollServices";
import QuestionServices from "../../services/QuestionServices";
import AnswerServices from "../../services/AnswerServices";
import CourseServices from "../../services/CourseServices.js";
import CoursePollServices from "../../services/CoursePollServices.js";

const courses = ref([]);
const selectedCourseId = ref(null);

const route = useRoute();
const pollId = route.params.id;
const poll = ref({});
const user = ref(null);
const questions = ref([]);
const addQuestionDialog = ref(false);
const editQuestionDialog = ref(false);
const showQuizInfo = ref(true);

const newQuestion = ref({
  text: "",
  questionType: "",
  answers: [{ text: "", isCorrectAnswer: false }],
});

//load user from localStorage, get poll details, questions, and answers on component mount
onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getPoll();
  await getQuestions();
  await getAnswers();
  await getCourses();

  const linkedCourses = await getPollCourses();
  if (linkedCourses.length > 0) {
    selectedCourseId.value = linkedCourses[0].id;
  }

});

async function getCourses() {
  try {
    const response = await CourseServices.getCourses();
    courses.value = [{ id: null, title: "None" }, ...response.data];
  } catch (error) {
    console.error("Failed to load courses:", error);
    showSnackbar("error", "Failed to load courses");
  }
}

async function getPollCourses() {
  try {
    const response = await CoursePollServices.getCoursesByPollId(pollId);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch courses for poll:", error);
    showSnackbar("error", "Failed to fetch courses for poll");
    return [];
  }
}

async function linkCourseToPoll(pollId, courseId) {
  try {
    
    await CoursePollServices.createCoursePollLink(pollId, courseId);
    snackbar.value.value = true;
    snackbar.value.color = "green";
    snackbar.value.text = "Course linked successfully!";
  } catch (error) {
    console.log(error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = error.response?.data?.message || "Failed to link course.";
  }
}

async function unlinkCourseFromPoll(pollId) {
  try {
    await CoursePollServices.deleteAllLinksForPoll(pollId);
    snackbar.value.value = true;
    snackbar.value.color = "green";
    snackbar.value.text = "Course unlinked successfully!";
  } catch (error) {
    console.log(error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = error.response?.data?.message || "Failed to unlink course.";
  }
}

//snackbar logic
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

//show snackbar with message and color
function showSnackbar(color, text) {
  snackbar.value = {
    value: true,
    color: color,
    text: text,
  };
}
//close the snackbar
function closeSnackbar() {
  snackbar.value.value = false;
}

//get the poll details with the pollID
async function getPoll() {
  await PollServices.getPoll(pollId)
    .then((response) => {
      poll.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      showSnackbar("error", "Failed to fetch polls");
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
      showSnackbar("error", "Failed to fetch questions");
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
    showSnackbar("error", "Failed to fetch answers");
  }
}

//update the poll name and description
async function updateQuiz() {
  if (!poll.value.name || !poll.value.name.trim()) {
    showSnackbar("error", "Quiz name cannot be empty.");
    return;
  }
  if (!poll.value.description || !poll.value.description.trim()) {
    showSnackbar("error", "Quiz description cannot be empty.");
    return;
  }
  try {
    await PollServices.updatePoll(poll.value.id, poll.value);

    // Always remove all previous course links first
    await unlinkCourseFromPoll(poll.value.id);

    // Then optionally add new one if selected
    if (selectedCourseId.value) {
      await linkCourseToPoll(poll.value.id, selectedCourseId.value);
    }

    showSnackbar("green", `Poll ID ${poll.value.id} updated successfully!`);
  } catch (error) {
    console.log(error);
    showSnackbar("error", "Failed to update poll");
  }
  await getPoll();
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

//validate new question and its answers before saving
function validateNewQuestion() {
  const question = newQuestion.value;
  const type = question.questionType;

  if (!type) {
    showSnackbar("error", "Please select a question type.");
    return false;
  }

  if (!question.text || !question.text.trim()) {
    showSnackbar("error", "Please enter a question.");
    return false;
  }

  question.answers = question.answers
    .filter((a) => a.text && a.text.trim() !== "")
    .map((a, i) => ({
      ...a,
      text: a.text.trim(),
      isCorrectAnswer: !!a.isCorrectAnswer,
      answerIndex: i,
    }));

  const answers = question.answers;

  if (answers.length === 0) {
    showSnackbar("error", "At least one answer is required.");
    return false;
  }

  if (type === "multiple_choice") {
    const correct = answers.filter((a) => a.isCorrectAnswer);
    if (correct.length === 0) {
      showSnackbar("error", "Please select at least one answer as correct.");
      return false;
    }
  }

  if (type === "true_false") {
    const tfValid = answers.every(
      (a) => a.text === "True" || a.text === "False"
    );
    const hasCorrect = answers.some((a) => a.isCorrectAnswer);
    if (!tfValid || !hasCorrect) {
      showSnackbar(
        "error",
        "Please select 'True' or 'False' and mark one as correct."
      );
      return false;
    }
  }

  if (type === "short_answer") {
    const a = answers[0];
    if (!a || !a.text?.trim() || !a.isCorrectAnswer) {
      showSnackbar(
        "error",
        "Please provide a valid answer and mark it as correct."
      );
      return false;
    }
  }

  return true;
}

//save question and its answers
async function saveQuestionAndAnswers() {
  const questionData = {
    ...newQuestion.value,
    pollId: pollId,
    questionNumber: questions.value.length + 1,
  };

  const res = await QuestionServices.createQuestion(questionData);
  const questionId = res.data.id;

  for (let index = 0; index < newQuestion.value.answers.length; index++) {
    const answer = newQuestion.value.answers[index];
    const answerData = {
      text: answer.text,
      answerIndex: index,
      isCorrectAnswer: answer.isCorrectAnswer,
    };
    await AnswerServices.createAnswer(questionId, answerData);
  }
  showSnackbar(
    "green",
    `Question ${questionData.questionNumber} and answers created successfully!`
  );
}

//create a new question and its answers
async function createQuestionAndAnswer() {
  try {
    if (!validateNewQuestion()) return;
    await saveQuestionAndAnswers();
  } catch (error) {
    console.error(error);
    showSnackbar("error", "Failed to create question");
  }

  await getQuestions();
  await getAnswers();
  addQuestionDialog.value = false;
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

//validate question on edit
function validateQuestionOnEdit(question) {
  if (!question.text || question.text.trim() === "") {
    showSnackbar("error", "Please enter a question.");
    return false;
  }

  if (!question.answers || question.answers.length === 0) {
    showSnackbar("error", "At least one answer is required.");
    return false;
  }

  const selectedAnswer = question.answers.every(
    (a) => a.text && a.text.trim() !== ""
  );
  if (!selectedAnswer) {
    showSnackbar("error", "Select a value for answer.");
    return false;
  }

  if (question.questionType === "true_false") {
    const hasAnswer = question.answers.some(
      (a) => a.isCorrectAnswer && (a.text === "True" || a.text === "False")
    );
    if (!hasAnswer) {
      showSnackbar(
        "error",
        "Please select either True or False as the correct answer."
      );
      return false;
    }
  }

  const isCorrect = question.answers.some((a) => a.isCorrectAnswer);
  if (!isCorrect) {
    showSnackbar("error", "At least one answer must be marked as correct.");
    return false;
  }
  return true;
}

// save answers for a question on edit
async function saveAnswers(question) {
  for (const [index, answer] of question.answers.entries()) {
    const answerData = {
      text: answer.text,
      isCorrectAnswer: answer.isCorrectAnswer,
      answerIndex: index,
      questionId: question.id,
    };

    if (answer.id) {
      await AnswerServices.updateQuestionAndAnswer(answer.id, {
        id: answer.id,
        ...answerData,
      });
      console.log("Answer updated:", answerData);
    } else {
      await AnswerServices.createAnswer(question.id, answerData);
      console.log("Answer created:", answerData);
    }
  }
}

//update question and its answers on v-dialog update
async function updateQuestionAndAnswer() {
  const question = newQuestion.value;

  if (!validateQuestionOnEdit(question)) return;

  try {
    const questionData = {
      text: question.text,
      questionType: question.questionType,
      pollId: pollId,
      questionNumber: question.number,
    };

    await QuestionServices.updateQuestionAndAnswer(question.id, questionData);
    await saveAnswers(question);

    showSnackbar(
      "green",
      `Question ${questionData.questionNumber} updated successfully!`
    );
    editQuestionDialog.value = false;
    await getQuestions();
    await getAnswers();
  } catch (error) {
    console.error(error);
    showSnackbar("error", "Failed to update question");
  }
}
//add an answer text-field to the question dialog
function addAnswer(qIndex) {
  qIndex.answers.push({
    text: "",
    isCorrectAnswer: false,
    tempKey: Date.now() + Math.random(),
  });
}

//delete answer from a question and remove from UI
async function removeAnswerFromDialog(answerIndex, answer) {
  newQuestion.value.answers.splice(answerIndex, 1);
  if (answer.id) {
    try {
      await AnswerServices.deleteAnswer(answer.id);
      showSnackbar("green", `Answer ${answer.id} deleted successfully!`);
    } catch (error) {
      console.error(error);
      showSnackbar("error", "Failed to delete answer");
    }
  }
}

//delete a question and its answers and reindex question numbers
async function deleteQuestionandAnswer(question) {
  await AnswerServices.deleteAnswerFromQuestion(question.id);
  await QuestionServices.deleteQuestionFromPoll(question.id)
    .then(() => {
      showSnackbar(
        "green",
        `Question ${question.questionNumber} and answers deleted successfully!`
      );
    })
    .catch((error) => {
      console.log(error);
      showSnackbar("error", "Failed to delete question");
    });

  await getQuestions();

  // Reindex question numbers after deletion
  for (let i = 0; i < questions.value.length; i++) {
    const currentQuestion = questions.value[i];
    const newNumber = i + 1;
    if (currentQuestion.questionNumber !== newNumber) {
      currentQuestion.questionNumber = newNumber;
      await QuestionServices.updateQuestion(currentQuestion.id, {
        questionNumber: newNumber,
      });
    }
  }

  await getQuestions();
}

// Drag-and-drop handler for reordering questions
async function dragToReorder() {
  for (let i = 0; i < questions.value.length; i++) {
    const question = questions.value[i];
    const newNumber = i + 1;
    if (question.questionNumber !== newNumber) {
      question.questionNumber = newNumber;
      await QuestionServices.updateQuestion(question.id, {
        questionNumber: newNumber,
      });
    }
  }
  await getQuestions();
}
</script>
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <v-card-title class="pl-0 text-h4 font-weight-bold"
          >Quiz Edit
          <v-btn
            variant="elevated"
            icon
            color="primary"
            class="ml-2"
            size="small"
            @click="showQuizInfo = !showQuizInfo"
          >
            <v-icon>{{
              showQuizInfo ? "mdi-chevron-up" : "mdi-chevron-down"
            }}</v-icon>
          </v-btn>
        </v-card-title>
      </v-col>
      <v-col cols="12" v-if="showQuizInfo">
        <v-card class="elevation-3">
          
         <v-card-text>

              <v-text-field label="Quiz Name" v-model="poll.name" />

              <v-textarea
                label="Description"
                v-model="poll.description"
                rows="3"
              />

              <v-row>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="selectedCourseId"
                    :items="courses"
                    item-title="title"
                    item-value="id"
                    label="Course"
                    clearable
                    hint="Select a course for this quiz"
                    persistent-hint
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-text-field
                    v-model.number="poll.secondsPerQuestion"
                    type="number"
                    min="0"
                    label="Time Per Question (seconds)"
                    hint="Leave blank or set to 0 for unlimited"
                    persistent-hint
                  />
                </v-col>
              </v-row>
            </v-card-text>

          <v-card-actions class="d-flex justify-space-between mb-2">
            <v-btn
              color="primary"
              variant="elevated"
              class="ml-2"
              @click="updateQuiz()"
              >Update quiz</v-btn
            >
            <div>
              <v-btn
                color="orange"
                variant="elevated"
                class="mr-2"
                @click="addQuestion()"
                ><v-icon icon="mdi-plus" start></v-icon>Add Question</v-btn
              >
              <v-btn color="blue" variant="elevated" class="mr-2" @click=""
                ><v-icon icon="mdi-plus" start></v-icon>Add Question With
                AI</v-btn
              >
            </div>
          </v-card-actions>
        </v-card>
      </v-col>
      <v-col cols="12">
        <div v-if="questions.length === 0" class="text-center py-3">
          <v-icon size="45" color="grey-lighten-1"
            >mdi-comment-question-outline</v-icon
          >
          <h3 class="text-h6">No Questions Added Yet</h3>
          <p class="text-body-1 mt-2">Click "Add Question" to get started</p>
        </div>
      </v-col>

      <v-col cols="12">
        <v-table
          v-if="questions.length > 0"
          class="elevation-10"
          fixed-header
          density="comfortable"
          style="max-height: 100vh; overflow-y: auto"
        >
          <thead>
            <tr>
              <th class="text-center">Order</th>
              <th class="text-left">
                <span
                  >{{ questions.length }}
                  {{ questions.length === 1 ? "Question" : "Questions" }}</span
                >
              </th>
              <th class="text-left">Question Type</th>
              <th class="text-left" colspan="2">Answers</th>
              <th class="text-left">Edit/Delete</th>
            </tr>
          </thead>
          <draggable
            v-model="questions"
            tag="tbody"
            handle=".drag-handle"
            item-key="id"
            @end="dragToReorder"
          >
            <template #item="{ element: item }">
              <tr>
                <td>
                  <span class="drag-handle ml-10" style="cursor: grab"
                    >&#9776;</span
                  >
                </td>
                <td>
                  <span class="text-subtitle-1 font-weight-bold"
                    >Q{{ item.questionNumber }}: </span
                  ><span class="text-body-1">{{ item.text }}</span>
                </td>
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
                  <div v-if="item.questionType === 'multiple_choice'">
                    <div v-for="(answer, index) in item.answers" :key="index">
                      {{ String.fromCharCode(65 + index) }}. {{ answer.text }} —
                      <span
                        :style="{
                          color: answer.isCorrectAnswer ? 'green' : 'gray',
                        }"
                      >
                        {{ answer.isCorrectAnswer ? "Correct " : "Incorrect " }}
                      </span>
                    </div>
                  </div>
                  <ul v-else>
                    <div v-for="(answer, index) in item.answers" :key="index">
                      {{ answer.text }} —
                      <span
                        :style="{
                          color: answer.isCorrectAnswer ? 'green' : 'gray',
                        }"
                      >
                        {{ answer.isCorrectAnswer ? "Correct " : "Incorrect " }}
                      </span>
                    </div>
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
            </template>
          </draggable>
        </v-table>
      </v-col>
      <v-col cols="12">
        <v-dialog
          persistent
          :model-value="addQuestionDialog || editQuestionDialog"
          max-width="800px"
        >
          <v-card class="rounded-lg elevation-5">
            <v-card-title class="d-flex justify-space-between align-center">
              {{
                addQuestionDialog
                  ? "Add Question"
                  : editQuestionDialog
                  ? "Edit Question"
                  : ""
              }}
              <v-btn v-if="addQuestionDialog" icon @click="closeAddQuestion">
                <v-icon>mdi-close</v-icon>
              </v-btn>
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
                    v-for="(answer, index) in newQuestion.answers"
                    :key="answer.tempKey || answer.id || index"
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
                      :key="index"
                      label="Correct Answer"
                    ></v-checkbox>

                    <v-icon
                      size="large"
                      icon="mdi-delete"
                      @click="removeAnswerFromDialog(index, answer)"
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
                  <div
                    v-for="(answer, answerIndex) in newQuestion.answers"
                    :key="answer.tempKey || answer.id || answerIndex"
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
                  <v-btn
                    v-if="editQuestionDialog"
                    variant="text"
                    color="primary"
                    @click="addAnswer(newQuestion)"
                    class="ml-2"
                  >
                    <v-icon icon="mdi-plus" start></v-icon> Add Answer
                  </v-btn>
                </div>

                <!-- Short Answer -->
                <div v-if="newQuestion.questionType === 'short_answer'">
                  <div
                    v-for="(answer, answerIndex) in newQuestion.answers"
                    :key="answer.tempKey || answer.id || answerIndex"
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
                class="mr-3"
                @click="
                  editQuestionDialog
                    ? updateQuestionAndAnswer()
                    : createQuestionAndAnswer()
                "
              >
                {{ editQuestionDialog ? "Update Question" : "Save" }}
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
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
