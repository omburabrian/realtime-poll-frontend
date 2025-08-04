<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import PollQuestionServices from "../services/PollQuestionServices.js";
import PollReports from "../reports/PollReports.js";

const router = useRouter();

const showDetails = ref(false);
const pollQuestions = ref([]);
const user = ref(null);
const questionAnswers = ref({});

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
  try {
    const response = await PollQuestionServices.getPollQuestionsForPoll(props.poll.id);
    pollQuestions.value = response.data;

    for (const question of pollQuestions.value) {
      const answersRes = await getAnswers(question.id);
      questionAnswers.value[question.id] = answersRes || [];
    }
  } catch (error) {
    console.log(error);
  }
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

function navigateToEdit(pollId) {
  if (!pollId) {
    showSnackbar("Invalid poll ID", "error");
    return;
  }
  router.push({ name: "quizEdit", params: { id: pollId } });
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
          <v-chip class="ma-2" color="accent" label>
            <v-icon start icon="mdi-clock-outline"></v-icon>
            {{ poll.secondsPerQuestion }} seconds per question
          </v-chip>
        </v-col>
        <v-col class="d-flex justify-end">
          <v-icon
            v-if="user !== null"
            size="small"
            icon="mdi-play"
            @click="navigateToStart()"
          ></v-icon>
          <v-icon
            v-if="user !== null"
            size="small"
            icon="mdi-pencil"
            @click="navigateToEdit(poll.id)"
          ></v-icon>
        </v-col>
      </v-row>
    </v-card-title>
    <v-expand-transition>
      <v-card-text class="pt-0" v-show="showDetails">
        <h3>Questions</h3>
        <v-table>
          <tbody>
            <div v-for="question in pollQuestions" :key="question.id" class="mb-6">
              <v-card class="pa-4" outlined>
                <h4 class="mb-2">
                  {{ question.questionNumber }}. {{ question.text }}

                   <v-chip class="ml-2" size="small" pill>
                  Type: {{ question.questionType.replace("_"," ") }}
                  </v-chip>
                </h4>
               
                <div class="mb-2">
                  <div v-for="answer in questionAnswers[question.id] || []" :key="answer.id">
                     <v-chip
                      class="ma-1"
                      :color="answer.isCorrectAnswer ? 'green' : 'grey lighten-2'"
                      :text-color="answer.isCorrectAnswer ? 'white' : 'black'"
                      size="small"
                      style="font-weight: 600"
                      
                    >
                      <v-icon start v-if="answer.isCorrectAnswer" icon="mdi-check-circle-outline" />
                      {{ answer.answerIndex }}. {{ answer.text }}
                    </v-chip>
                  </div>
                </div>

               
              </v-card>
            </div>

          </tbody>
        </v-table>
      </v-card-text>
    </v-expand-transition>
  </v-card>
</template>
