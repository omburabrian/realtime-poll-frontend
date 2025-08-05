<script setup>
import { onMounted, ref, computed } from "vue";
import { useRouter } from "vue-router";
import PollQuestionServices from "../services/PollQuestionServices.js";
import PollServices from "../services/PollServices.js";
import { defineEmits } from "vue";
const emit = defineEmits(["delete"]);

const router = useRouter();
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
  try {
    const response = await PollQuestionServices.getPollQuestionsForPoll(props.poll.id);
    pollQuestions.value = response.data;
  } catch (error) {
    console.log(error);
  }
}

async function PollDelete(pollId) {

  
  if (!pollId) return;
  try {
    await PollServices.deletePoll(pollId);
    emit("delete");
  } catch (error) {
    console.error("Failed to delete poll:", error);
  }
}

function navigateToEdit(pollId) {
  if (!pollId) return;
  router.push({ name: "quizEdit", params: { id: pollId } });
}

function navigateToStart() {
  // Optional: implement start screen navigation
}

const totalTime = computed(() => {
  return (pollQuestions.value.length * (props.poll.secondsPerQuestion || 0)/60).toFixed(1);
});
</script>

<template>
  <v-card class="rounded-lg elevation-4 mb-4 pa-4">
    <v-row align="center" class="flex-wrap">
      <!-- Left: Info -->
      <v-col cols="12" md="9">
        <!-- Quiz Name -->
        <div class="font-weight-bold text-h6 mb-1" style="white-space: normal; word-wrap: break-word;">
          {{ poll.name }}
        </div>

        <!-- Description -->
        <div class="text-subtitle-2 text-grey-darken-1 mb-2" style="white-space: normal; word-wrap: break-word;">
          {{ poll.description || "No description provided." }}
        </div>

        <!-- Summary Chips -->
        <div class="d-flex align-center flex-wrap">
          <v-chip class="ma-1" color="primary" label>
            {{ poll.isQuiz ? "Quiz" : "Poll" }}
          </v-chip>

          <v-chip class="ma-1" color="accent" label>
            {{ pollQuestions.length }} Question{{ pollQuestions.length !== 1 ? "s" : "" }}
          </v-chip>

          <v-chip class="ma-1" color="indigo lighten-1" label>
            <v-icon start icon="mdi-clock-outline" />
            {{ poll.secondsPerQuestion }}s / Q
          </v-chip>

          <v-chip class="ma-1" color="deep-purple lighten-1" label>
            <v-icon start icon="mdi-timer-outline" />
            {{ totalTime }} min Total
          </v-chip>

          <v-chip class="ma-1" :color="poll.isPublic ? 'green' : 'grey'" label>
            {{ poll.isPublic ? "Public" : "Private" }}
          </v-chip>
        </div>
      </v-col>

      <!-- Right: Actions -->
      <v-col cols="12" md="3" class="d-flex justify-end">

        <v-btn icon variant="text" @click="navigateToStart">
          <v-icon icon="mdi-play" />
        </v-btn>
        <v-btn icon variant="text" @click="navigateToEdit(poll.id)">
          <v-icon icon="mdi-pencil" />
        </v-btn>
        <v-btn icon variant="text" @click="PollDelete(poll.id)">
          <v-icon icon="mdi-delete" />
        </v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>
