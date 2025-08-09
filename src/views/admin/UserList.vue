<script setup>
import { onMounted } from "vue";
import { ref } from "vue";

import UserCard from "../../components/UserListCardComponent.vue";
import UserServices from "../../services/UserServices.js";
import { useSnackbar } from "../../composables/useSnackbar.js";

const user = ref(null);   //  Current logged in user
const users = ref([]);    //  List of users
const userRoles = ref([]);    //  List of user user roles

//  Snackbar composable
const { snackbar, showSnackbar, showErrorSnackbar, closeSnackbar } = useSnackbar();

//----------------------------------------------------------------
onMounted(async () => {
  user.value = JSON.parse(localStorage.getItem("user"));
  //  console.log(user.value);

    //  Must be authenticated user to get user roles.
  if (user.value !== null) {
    await getUserRoles();
    await getUsers();
  }
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
      showErrorSnackbar(error, "Failed to load users.");
    });
}

//----------------------------------------------------------------
//  Get user user roles.
async function getUserRoles() {

  //  Object.getOwnPropertyNames()
  //  Object.keys()
  //  Object.values()

  await UserServices.getUserRoles()
    .then((response) => {
      //  ROLES are defined as an array of constants.
      //  Just send the *values*, not the ROLES *object* with its constant keys.
      userRoles.value = Object.values(response.data);
      //  NO:  userRoles.value = response.data;
      //  console.log(userRoles.value);
    })
    .catch((error) => {
      console.log(error);
      showErrorSnackbar(error, "Failed to load user roles.");
    });
}

//----------------------------------------------------------------
//  Handle ROLE UPDATE (from user card component)
async function handleUpdateRole({ userId, role }) {

  await UserServices.updateUser(userId, { role: role })
    .then(() => {
      //  User role has now been updated in the DB.  Now update in UI:
      //  Find user in current user list view and update their role.
      const userIndex = users.value.findIndex((u) => u.id === userId);
      if (userIndex !== -1) {
        users.value[userIndex].role = role;
      }
      showSnackbar("User ROLE updated successfully", "green");
    })
    .catch((error) => {
      console.log(error);
      showErrorSnackbar(error, "Error updating user ROLE");

      //  Optional: Re-fetch users to revert optimistic update on failure.
      //  (In case the user did not actually get updated in the DB.)
      getUsers();
    });
}

//----------------------------------------------------------------
//  Handle DELETE USER (from user card component)
async function handleDeleteUser(userId) {

  //  ToDo:  Include the user's name in the confirmation?
  if (confirm("Are you sure you want to delete this user?")) {

    await UserServices.deleteUser(userId)
      .then(() => {
        //  Remove the user from the local list for instant UI feedback
        users.value = users.value.filter((u) => u.id !== userId);
        showSnackbar("User deleted successfully", "green");
      })
      .catch((error) => {
        console.log(error);
        showErrorSnackbar(error, "Error deleting user");
      });
  }
}
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
        :userRoles="userRoles"
        @update-role="handleUpdateRole"
        @delete-user="handleDeleteUser"
      />

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
