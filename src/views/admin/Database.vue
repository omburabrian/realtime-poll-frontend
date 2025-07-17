<script setup>

import AdminServices from "../../services/AdminServices.js";

import { onMounted } from "vue";
import { ref } from "vue";

const user = ref(null);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
});

async function loadTestData_users() {
  await AdminServices.loadTestData_users()
    .then((response) => {
      console.log(response);
      snackbar.value.value = true;
      snackbar.value.color = "green";
      //  snackbar.value.text = response.data.message;
      snackbar.value.text = response?.data?.message || "Test data loaded successfully for users";
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response?.data?.message || "Error loading test data for users";
    });
}

function loadTestData_polls() {
  alert("loadTestData_polls");
}

function closeSnackBar() {
  snackbar.value.value = false;
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

              <v-btn variant="flat" color="primary" class="mb-2" @click="loadTestData_polls()">
                Load Polls (Quizes)
              </v-btn>

            </v-card-text>
          </v-card>
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

    </div>
  </v-container>
</template>
