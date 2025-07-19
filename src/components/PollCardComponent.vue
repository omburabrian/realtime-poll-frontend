<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import PollQuestionServices from "../services/PollQuestionServices.js";
import PollReports from "../reports/PollReports.js";

const router = useRouter();

const showDetails = ref(false);
const pollQuestions = ref([]);
const user = ref(null);

const props = defineProps({
  poll: {
    required: true,
  },
});

onMounted(async () => {
  await getPollQuestions();
  user.value = JSON.parse(localStorage.getItem("user"));
});

async function getPollQuestions() {
  await PollQuestionServices.getPollQuestionsForPoll(props.poll.id)
    .then((response) => {
      pollQuestions.value = response.data;
      console.log(pollQuestions.value);
    })
    .catch((error) => {
      console.log(error);
    });
}

async function getAnswers(questionId) {
  return PollQuestionServices.getPollQuestionAnswers(questionId)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

function navigateToEdit() {
  router.push({ name: "editPoll", params: { id: props.poll.id } });
}
</script>

<template>
  <v-card
    class="rounded-lg elevation-5 mb-8"
    @click="showDetails = !showDetails"
  >
    <v-card-title class="headline">
      <v-row align="center">
        <v-col cols="10">
          {{ poll.name }}
          <v-chip class="ma-2" color="primary" label>
            <v-icon start icon="mdi-account-circle-outline"></v-icon>
            {{ poll.schoolGroup }} 
          </v-chip>
          <v-chip class="ma-2" color="accent" label>
            <v-icon start icon="mdi-clock-outline"></v-icon>
            {{ poll.timePerQuestion }} minutes per question
          </v-chip>
        </v-col>
        <v-col class="d-flex justify-end">
          <v-icon
            v-if="user !== null"
            size="small"
            icon="mdi-file-pdf-box"
            @click.stop="PollReports.generatePollCSV(poll)"
          ></v-icon>
          <v-icon
            v-if="user !== null"
            size="small"
            icon="mdi-pencil"
            @click="navigateToEdit()"
          ></v-icon>
        </v-col>
      </v-row>
    </v-card-title>
    <v-card-text class="body-1">
      {{ poll.description }}
    </v-card-text>
    <v-expand-transition>
      <v-card-text class="pt-0" v-show="showDetails">
        <h3>Questions</h3>
        <v-table>
          <thead>
            <tr>
              <th class="text-left">Question</th>
              <th class="text-left">Answers</th>
              <th class="text-left">Correct Answer</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="question in pollQuestions" :key="question.id">
              <td>{{ question.questionNumber + ". " + question.text }}</td>
              <td>
                <v-chip
                  v-for="answer in getAnswers(question.id)"
                  console.log(answer)
                  :key="answer.id"
                  size="small"
                  class="ma-1"
                  color="secondary"
                >
                  {{ answer.text }}
                </v-chip></td>
              <td>{{ question.text }}</td>
              <td>
                <v-chip
                  size="small"
                  pill
                  >{{ question.questionType }}</v-chip
                >
              </td>
            </tr>
          </tbody>
        </v-table>
      </v-card-text>
    </v-expand-transition>
  </v-card>
</template>
