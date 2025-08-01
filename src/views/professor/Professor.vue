<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import ProfessorServices from "../../services/ProfessorServices.js";

const user = ref(null);
const dashboardData = ref(null);

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  await getDashboardData();
  user.value = JSON.parse(localStorage.getItem("user"));
});

async function getDashboardData() {
  await ProfessorServices.getDashboardData()
    .then((response) => {
      dashboardData.value = response.data;
    })
    .catch((error) => {
      console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
    });
}

function closeSnackBar() {
  snackbar.value.value = false;
}

</script>

<template>
  <v-container>
    <div id="body">
      
      <v-row align="center" class="mb-4">
        <v-col cols="10"
          ><v-card-title class="pl-0 text-h4 font-weight-bold"
            >Professor Dashboard
          </v-card-title>
        </v-col>
      </v-row>

      <v-row align="center" class="mb-4">
        <v-col cols="10">
          <pre>
{{ dashboardData }}
          </pre>
        </v-col>
      </v-row>

      <v-snackbar v-model="snackbar.value" rounded="pill">
        {{ snackbar.text }}

        <template v-slot:actions>
          <v-btn
            :color="snackbar.color"
            variant="text"
            @click="closeSnackBar()"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>

    </div>
  </v-container>
</template>
