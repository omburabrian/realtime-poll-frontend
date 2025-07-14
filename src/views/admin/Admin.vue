<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
//  import UserCard from "../../components/UserListCardComponent.vue";
import AdminServices from "../../services/AdminServices.js";
import UserServices from "../../services/UserServices.js";

const user = ref(null);
const users = ref([]);

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  await getUsers();
  user.value = JSON.parse(localStorage.getItem("user"));
});

async function getUsers() {
  await UserServices.getUsers()
    .then((response) => {
      users.value = response.data.users;
      //  console.log(users.value);
    })
    .catch((error) => {
      console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response.data.message;
    });
}""

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
            >Admin Dashboard
          </v-card-title>
        </v-col>
      </v-row>

      <UserCard
        v-for="aUser in users"
        :key="aUser.id"
        :user="aUser"
        @deletedList="getLists()"
      />

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
