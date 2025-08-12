<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useSnackbar } from "../composables/useSnackbar.js";
import PollEventServices from "../services/PollEventServices.js";

const router = useRouter();
const route = useRoute();
const user = ref(null); 
const { snackbar, showErrorSnackbar, closeSnackbar } = useSnackbar();
const roomCode = ref("");
const codeError = ref("");

const normalizedCode = computed(() =>
  roomCode.value.trim().replace(/\s+/g, "").toUpperCase()
);

async function doesExistPollEvent(roomCode) {
  try {
    const response = await PollEventServices.getPollEventById(roomCode);
    const pollEvent = response.data;
    const status = response.status;

    // Treat non-200 as not found
    if (status !== 200) return false;

    // Make sure the poll event is active
    if (pollEvent.description !== "inactive") {
      return true;
    }
    return false;
  } catch (error) {
    // 404 -> not found; anything else -> also false (and show snackbar)
    if (error.response?.status !== 404) {
      console.error(error);
      showErrorSnackbar(error, "Unable to verify the quiz right now.");
    }
    return false;
  }
}

async function validateCode() {
  const code = normalizedCode.value;

  if (!code) {
    codeError.value = "Please enter a room code.";
    return false;
  }
  for (const ch of code) {
    if (ch < '0' || ch > '9') {
      codeError.value = "Code must contain numbers only.";
      return false;
    }
  }

  // ✅ await the async existence check
  const exists = await doesExistPollEvent(code);
  if (!exists) {
    codeError.value = "Quiz with this code does not exist.";
    return false;
  }

  codeError.value = "";
  return true;
}

async function joinQuiz() {
  // Don’t call validateCode() twice
  const valid = await validateCode();
  if (!valid) return;

  router.push({ name: "student-quiz", params: { id: normalizedCode.value } });
}



onMounted(() => {
  const preset = (route.query.code || "").toString();
  if (preset) roomCode.value = preset;
});
</script>

<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="pa-6 rounded-xl">
          <v-card-title class="text-h5 font-weight-bold pa-0 mb-4">
            Join a Quiz
          </v-card-title>

          <v-alert
            type="info"
            variant="tonal"
            class="mb-6"
            border="start"
            elevation="0"
          >
            You can join by entering a room code below. You can also
            <strong>scan the QR code</strong> your professor shows on screen,
            or simply type the <strong>link</strong> shown there directly in your browser.
          </v-alert>

          <v-text-field
            v-model="roomCode"
            label="Room Code"
            placeholder="e.g., ABC123"
            :error-messages="codeError"
            @update:model-value="codeError=''"
            @keyup.enter="joinQuiz"
            autofocus
            clearable
            hide-details="auto"
            class="mb-4"
          />

          <v-btn color="primary" size="large" block @click="joinQuiz">
            Join Quiz
          </v-btn>

          <v-divider class="my-6" />


        
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
