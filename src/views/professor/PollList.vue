<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import PollCard from "../../components/PollCardComponent.vue";
import PollServices from "../../services/PollServices.js";

const polls = ref([]);
const isAdd = ref(false);
const user = ref(null);
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

onMounted(async () => {
 
  user.value = JSON.parse(localStorage.getItem("user"));
   await getPolls();
});


async function getPolls() {
  user.value = JSON.parse(localStorage.getItem("user"));
  if (user.value !== null && user.value.id !== null) {
    await PollServices.getPollsByUserId(user.value.id)
      .then((response) => {
        polls.value = response.data;
        console.log(polls.value);
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
      });
  } else {
    await PollServices.getPolls()
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
}

async function addPoll() {
  isAdd.value = false;
  newPoll.value.userId = user.value.id;
  await PollServices.addPoll(newPoll.value)
    .then(() => {
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = `${newPoll.value.name} added successfully!`;
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
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
        <v-col cols="10"
          ><v-card-title class="pl-0 text-h4 font-weight-bold"
            >Polls and Quizzes
          </v-card-title>
        </v-col>
        <v-col class="d-flex justify-end" cols="2">
          <v-btn v-if="user !== null" color="accent" @click="openAdd()"
            >Add</v-btn
          >
        </v-col>
      </v-row>

      <PollCard
        v-for="poll in polls"
        :key="poll.id"
        :poll="poll"
        @deletedList="getPolls()"
      />

      <v-dialog persistent v-model="isAdd" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="headline mb-2">Add Poll </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="newPoll.name"
              label="Poll Name"
              required
            ></v-text-field>

            <v-text-field
              v-model="newPoll.description"
              label="Class/Group"
            ></v-text-field>
            <v-text-field
              v-model.number="newPoll.secondsPerQuestion"
              label="seconds per Question"
              type="number"
            ></v-text-field>
            <v-switch
              v-model="newPoll.isPublished"
              hide-details
              inset
              :label="`Publish? ${newPoll.isPublished ? 'Yes' : 'No'}`"
            ></v-switch>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn variant="flat" color="secondary" @click="closeAdd()"
              >Close</v-btn
            >
            <v-btn variant="flat" color="primary" @click="addPoll()"
              >Add Poll</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>
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
