<script setup>
import { onMounted, ref, computed } from "vue";
import PollCard from "../../components/PollCardComponent.vue";
import PollServices from "../../services/PollServices.js";
import CourseServices from "../../services/CourseServices.js";

const polls = ref([]);
const courses = ref([]);
const search = ref("");
const user = ref(null);
const isAdd = ref(false);
const snackbar = ref({
  value: false,
  color: "",
  text: "",
});
const newPoll = ref({
  name: "",
  description: "",
  timePerQuestion: "30",
  isPublished: false,
});

const pollsByCourse = computed(() => {
  const grouped = {};
  for (const course of courses.value) {
    grouped[course.name] = [];
  }

  for (const poll of polls.value) {
    const course = poll.courses?.[0] || null; // assuming one course per poll
    const courseName = course?.name || "Uncategorized";
    if (!grouped[courseName]) grouped[courseName] = [];
    grouped[courseName].push(poll);
  }

  // Apply search filter
  if (search.value.trim() === "") return grouped;

  const filtered = {};
  for (const [courseName, coursePolls] of Object.entries(grouped)) {
    const matching = coursePolls.filter(p =>
      p.name.toLowerCase().includes(search.value.toLowerCase())
    );
    if (matching.length > 0) filtered[courseName] = matching;
  }
  return filtered;
});

onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  await getPolls();
  await getCourses();
});

async function getPolls() {
  user.value = JSON.parse(localStorage.getItem("user"));
  try {
    const response =
      user.value && user.value.id
        ? await PollServices.getPolls(user.value.id)
        : await PollServices.getPolls();
    polls.value = response.data;
  } catch (error) {
    console.log(error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = error.response?.data?.message || "Failed to load polls.";
  }
}

async function getCourses() {
  try {
    const response = await CourseServices.getCourses();
    courses.value = response.data;
  } catch (error) {
    console.log(error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = error.response?.data?.message || "Failed to load courses.";
  }
}

async function addPoll() {
  isAdd.value = false;
  newPoll.value.userId = user.value.id;
  try {
    await PollServices.addPoll(newPoll.value);
    snackbar.value.value = true;
    snackbar.value.color = "green";
    snackbar.value.text = `${newPoll.value.name} added successfully!`;
    
  } catch (error) {
    console.log(error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = error.response?.data?.message || "Failed to add poll.";
  }
  await getPolls();
}

function openAdd() {
  isAdd.value = true;
}

function openUpdate(poll) {
  isAdd.value = true;
  newPoll.value = { ...poll };
}

function closeAdd() {
  isAdd.value = false;
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>


<template>
  <v-container>
    <div id="body">
      <v-row align="center" class="mb-4">
        <v-col cols="8">
          <v-card-title class="pl-0 text-h4 font-weight-bold">Polls and Quizzes</v-card-title>
        </v-col>
        <v-col cols="4" class="d-flex justify-end align-center">
          <v-text-field
            v-model="search"
            label="Search quizzes..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            dense
            clearable
            class="mr-4"
          ></v-text-field>
          <v-btn v-if="user !== null" color="accent" @click="openAdd()">Add</v-btn>
        </v-col>
      </v-row>

      <v-expansion-panels multiple>
        <v-expansion-panel
          v-for="(pollList, courseName) in pollsByCourse"
          :key="courseName"
        >
          <v-expansion-panel-title class="text-h6 font-weight-medium">
            {{ courseName }}
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <PollCard
              v-for="poll in pollList"
              :key="poll.id"
              :poll="poll"
              @deletedList="getPolls()"
            />
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <v-dialog persistent v-model="isAdd" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">Add Poll</v-card-title>
          <v-card-text>
            <v-text-field v-model="newPoll.name" label="Poll Name" required />
            <v-text-field v-model="newPoll.description" label="Class/Group" />
            <v-text-field
              v-model.number="newPoll.secondsPerQuestion"
              label="Seconds per Question"
              type="number"
            />
            <v-switch
              v-model="newPoll.isPublished"
              hide-details
              inset
              :label="`Publish? ${newPoll.isPublished ? 'Yes' : 'No'}`"
            />
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn variant="flat" color="secondary" @click="closeAdd()">Close</v-btn>
            <v-btn variant="flat" color="primary" @click="addPoll()">Add Poll</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="snackbar.value" rounded="pill">
        {{ snackbar.text }}
        <template v-slot:actions>
          <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">Close</v-btn>
        </template>
      </v-snackbar>
    </div>
  </v-container>
</template>
