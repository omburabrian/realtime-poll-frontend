<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import QuizEditServices from "../services/QuizEditServices";

const user = ref(null);
const polls = ref([]);
const router = useRouter();

onMounted(async () => {
  await getPolls();
  user.value = JSON.parse(localStorage.getItem("user"));
});
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

async function getPolls() {
  await QuizEditServices.getPolls()
    .then((response) => {
      polls.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}
function navigateToEdit(pollId) {
  if (!pollId) {
    snackbar.value = {
      value: true,
      color: "error",
      text: "Invalid poll ID",
    };
    return;
  }
  router.push({ name: "quizEdit", params: { id: pollId } });
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>
<template>
  <v-container>
    <v-row>
      <v-col cols="12" class="justify-center mt-10">
        <v-table
          class="rounded-lg elevation-5"
          height="auto"
          fixed-header
          density="comfortable"
        >
          <thead>
            <tr>
              <th class="text-left">Poll ID</th>
              <th class="text-left">Name</th>
              <th class="text-left">Description</th>
              <th class="text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="poll in polls" :key="poll.id">
              <td>{{ poll.id }}</td>
              <td>{{ poll.name }}</td>
              <td>{{ poll.description }}</td>

              <td>
                <v-icon
                  size="small"
                  icon="mdi-pencil"
                  @click="navigateToEdit(poll.id)"
                  class="mr-4"
                ></v-icon>
              </td>
            </tr>
          </tbody>
        </v-table>
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
