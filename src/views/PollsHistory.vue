<script setup>
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

function closeSnackbar() {
  snackbar.value.value = false;
}
</script>

<template>
  <v-container>
    <div id="body">
      
      <v-row align="center" class="mb-4">
        <v-col cols="10"
          ><v-card-title class="pl-0 text-h4 font-weight-bold">
            Polls History
          </v-card-title>
        </v-col>
      </v-row>

      <v-snackbar v-model="snackbar.value" rounded="pill">
        {{ snackbar.text }}

        <template v-slot:actions>
          <v-btn
            :color="snackbar.color"
            variant="text"
            @click="closeSnackbar()"
          >
            Close
          </v-btn>
        </template>
      </v-snackbar>

    </div>
  </v-container>
</template>
