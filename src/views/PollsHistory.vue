<script setup>
import { onMounted } from "vue";
import { ref, computed } from "vue";
import PollServices from "../services/PollServices.js";
import PollEventUserServices from "../services/PollEventUserServices.js";

const user = ref(null);
const userPolls = ref([]);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getPollHistoryForUser();
});

async function getPollHistoryForUser() {
  await PollEventUserServices.getUserPollHistory(user.value.id)
    .then((response) => {
      userPolls.value = (response.data || []).map((item) => ({
        pollId: item.poll_event?.poll?.id || null,
        pollName: item.poll_event?.poll?.name || "",
        description: item.poll_event?.poll?.description || "",
        dateTaken: item.createdAt || null,
      }));

      console.log(userPolls.value);
      console.log(JSON.stringify(response.data, null, 2));
    })
    .catch((error) => {
      console.error(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message;
    });
}

function closeSnackbar() {
  snackbar.value.value = false;
}
</script>

<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="mt-3 pa-5">
        <v-card-title class="headline">My Polls</v-card-title>

        <v-expansion-panels
          v-if="userPolls && userPolls.length > 0"
          variant="accordion"
          class="mt-4"
          rounded="md"
          color="secondary"
        >
          <v-expansion-panel v-for="(poll, index) in userPolls" :key="poll.id">
            <v-expansion-panel-title>
              <span>Quiz Title: {{ poll.pollName }}</span>
              <v-chip color="primary" class="ml-2" v-if="poll.score">
                Score: {{ poll.score }}%
              </v-chip>
            </v-expansion-panel-title>
            <v-expansion-panel-text>
              <div>
                <div class="mb-2">
                  <b>Description:</b> {{ poll.description }}
                </div>
                <div class="mb-2">
                  <b>Date Taken:</b>
                  {{
                    poll.dateTaken
                      ? new Date(poll.dateTaken).toLocaleDateString()
                      : "Unknown"
                  }}
                </div>
                <!-- To Do: Unfinished: Questions (if available in poll object) -->
                <!-- <v-list v-if="poll.questions">
                  <v-list-item
                    v-for="question in poll.questions"
                    :key="question.id"
                  >
                    <v-list-item-content>
                      <v-list-item-title>
                        Q: {{ question.text }}
                      </v-list-item-title>
                      <v-list-item-subtitle>
                        <span>Your answer:</span>
                        <v-chip
                          :color="question.correct ? 'success' : 'error'"
                          class="ma-1"
                          label
                          dark
                        >
                          {{ question.userAnswer || "None" }}
                        </v-chip>
                        <v-chip color="primary" class="ma-1" label dark>
                          Correct: {{ question.correctAnswer }}
                        </v-chip>
                        <v-chip
                          :color="question.correct ? 'success' : 'error'"
                          class="ma-1"
                          label
                          dark
                        >
                          <v-icon start>
                            {{ question.correct ? "mdi-check" : "mdi-close" }}
                          </v-icon>
                          {{ question.correct ? "Correct" : "Incorrect" }}
                        </v-chip>
                      </v-list-item-subtitle>
                    </v-list-item-content>
                  </v-list-item>
                </v-list> -->
              </div>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>

        <div v-else class="pa-4 text-center">
          <v-card variant="elevated" class="mx-auto" max-width="400">
            <v-card-text>
              <v-icon color="grey" size="80">mdi-information-outline</v-icon>
              <div class="mt-2">No poll history found.</div>
            </v-card-text>
          </v-card>
        </div>
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
