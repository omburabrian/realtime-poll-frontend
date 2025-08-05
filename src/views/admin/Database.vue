<script setup>

import AdminServices from "../../services/AdminServices.js";

import { onMounted } from "vue";
import { ref } from "vue";
import { useSnackbar } from "../../composables/useSnackbar.js";

const user = ref(null);

//  Snackbar composable
const { snackbar, showSnackbar, showErrorSnackbar, closeSnackbar } = useSnackbar();

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
});

async function loadTestData_users() {
  await AdminServices.loadTestData_users()
    .then((response) => {
      console.log(response);
      showSnackbar(response?.data?.message || "Test data loaded successfully for USERS");
    })
    .catch((error) => {
      console.log(error);
      showErrorSnackbar(error, "Error loading test data for USERS");
    });
}

async function loadTestData_pollsQuestionsAnswers() {

  await AdminServices.loadTestData_pollsQuestionsAnswers()
    .then((response) => {
      console.log(response);
      showSnackbar(response?.data?.message || "Test data loaded successfully for POLLS");
    })
    .catch((error) => {
      console.log(error);
      showErrorSnackbar(error, "Error loading test data for POLLS");
    });
}

async function loadTestData_courses() {

  await AdminServices.loadTestData_courses()
    .then((response) => {
      //  console.log(response);
      showSnackbar(response?.data?.message || "Test data loaded successfully for COURSES");
    })
    .catch((error) => {
      console.log(error);
      showErrorSnackbar(error, "Error loading test data for COURSES");
    });
}

</script>

<template>
  <v-container>
    <div id="body">

      <v-row align="center" class="mb-4">
        <v-col cols="10"><v-card-title class="pl-0 text-h4 font-weight-bold">
            Database
          </v-card-title>
        </v-col>
      </v-row>

      <v-row align="center" class="mb-4">
        <v-col cols="10">
          <v-card class="rounded-lg elevation-5">
            <v-card-title class="headline mb-2">Test Data </v-card-title>
            <v-card-text>

              <v-btn variant="flat" color="primary" class="mb-5" @click="loadTestData_users()">
                Load Users
              </v-btn>

              <v-spacer></v-spacer>

              <v-btn variant="flat" color="primary" class="mb-2" @click="loadTestData_pollsQuestionsAnswers()">
                Load Polls (Quizzes)
              </v-btn>

              <v-spacer></v-spacer>

              <v-btn variant="flat" color="primary" class="mb-2" @click="loadTestData_courses()">
                Load Courses
              </v-btn>

            </v-card-text>
          </v-card>
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

    </div>
  </v-container>
</template>
