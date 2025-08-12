<script setup>
import { ref, computed, onMounted } from "vue";
import { useRoute } from "vue-router";
import PollEventServices from "../services/PollEventServices.js";

const route = useRoute();

const pollEvent = ref(null);
const loading = ref(true);
const error = ref("");

const pollName = computed(() => {
  const pe = pollEvent.value;
  const poll = pe?.Poll || pe?.poll; // handle different casing from Sequelize include
  return poll?.name || poll?.title || "(Untitled Poll)";
});

onMounted(async () => {
  try {
    const id = route.params.id;
    const { data } = await PollEventServices.getPollEventById(id);
    pollEvent.value = data;
  } catch (e) {
    error.value =
      e?.response?.status === 404 ? "Quiz not found." : "Failed to load quiz.";
    console.error(e);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <v-container class="py-10">
    <v-row justify="center">
      <v-col cols="12" sm="10" md="8" lg="6">
        <v-card class="pa-6 rounded-xl">
          <template v-if="loading">
            <div class="d-flex align-center justify-center" style="min-height: 120px;">
              <v-progress-circular indeterminate />
            </div>
          </template>

          <template v-else-if="error">
            <v-alert type="error" variant="tonal" border="start">{{ error }}</v-alert>
          </template>

          <template v-else>
            <v-card-title class="text-h5 font-weight-bold pa-0">
              {{ pollName }}
            </v-card-title>
          </template>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
