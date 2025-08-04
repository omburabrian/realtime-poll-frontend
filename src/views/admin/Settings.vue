<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import { useSnackbar } from "../../composables/useSnackbar.js";

const user = ref(null);
const { snackbar, showSnackbar, closeSnackBar } = useSnackbar();

onMounted(async () => {
  //  await getRecipes();
  user.value = JSON.parse(localStorage.getItem("user"));
});
</script>

<template>
  <v-container>
    <div id="body">
      
      <v-row align="center" class="mb-4">
        <v-col cols="10"
          ><v-card-title class="pl-0 text-h4 font-weight-bold">
            Admin Settings
          </v-card-title>
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
