<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import PollServices from "../../services/PollServices";
import { useSnackbar } from "../../composables/useSnackbar.js";

const user = ref(null);
const polls = ref([]);
const router = useRouter();
const { snackbar, showSnackbar, closeSnackBar } = useSnackbar();

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getPolls(user.value.id);
});

async function getPolls(userId) {
  await PollServices.getPolls(userId)
    .then((response) => {
      polls.value = response.data;
    })
    .catch((error) => {
      console.log(error);
      showErrorSnackbar(error, "Failed to load polls.");
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
