<script setup>
import { onMounted } from "vue";
import { ref } from "vue";

import UserCard from "../../components/UserListCardComponent.vue";
import UserServices from "../../services/UserServices.js";

const user = ref(null);   //  Current logged in user
const users = ref([]);    //  List of users
const roles = ref([]);    //  List of user roles

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

//----------------------------------------------------------------
onMounted(async () => {
  await getUsers();
  await getRoles();
  user.value = JSON.parse(localStorage.getItem("user"));
  //  console.log(user.value);
});

//----------------------------------------------------------------
//  Get users.  ToDo:  paginate
async function getUsers() {

  await UserServices.getUsers()
    .then((response) => {
      users.value = response.data;
      //  console.log(users.value);
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

//----------------------------------------------------------------
//  Get user roles.
async function getRoles() {

  await UserServices.getRoles()
    .then((response) => {
      roles.value = response.data;
      console.log(roles.value);
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = error.response.data.message;
    });
}

//----------------------------------------------------------------
//  Handle role update from child component
async function handleUpdateRole({ userId, role }) {
  // NOTE: Assumes a UserServices.updateUserRole(id, data) method exists.
  // You may need to create this in your services file.
  await UserServices.updateUserRole(userId, { role: role })
    .then(() => {
      // Find the user in the list and update their role locally for instant UI feedback
      const userIndex = users.value.findIndex((u) => u.id === userId);
      if (userIndex !== -1) {
        users.value[userIndex].role = role;
      }
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "User role updated successfully!";
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text =
        error.response?.data?.message || "Error updating user role.";
      // Optional: Re-fetch users to revert optimistic update on failure
      getUsers();
    });
}

//----------------------------------------------------------------
//  Handle user deletion from child component
async function handleDeleteUser(userId) {
  // NOTE: Assumes a UserServices.deleteUser(id) method exists.
  if (confirm("Are you sure you want to delete this user?")) {
    await UserServices.deleteUser(userId)
      .then(() => {
        // Remove the user from the local list for instant UI feedback
        users.value = users.value.filter((u) => u.id !== userId);
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = "User deleted successfully!";
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response?.data?.message || "Error deleting user.";
      });
  }
}

//----------------------------------------------------------------
function closeSnackBar() {
  snackbar.value.value = false;
}
//----------------------------------------------------------------
</script>

<template>
  <v-container>
    <div id="body">
      
      <v-row align="center" class="mb-4">
        <v-col cols="10"
          ><v-card-title class="pl-0 text-h4 font-weight-bold">
            User List
          </v-card-title>
        </v-col>
      </v-row>

      <UserCard
        v-for="aUser in users"
        :key="aUser.id"
        :aUser="aUser"
        :roles="roles"
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
