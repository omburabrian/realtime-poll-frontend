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

  //  Object.getOwnPropertyNames()
  //  Object.keys()
  //  Object.values()

  await UserServices.getRoles()
    .then((response) => {
      //  ROLES are defined as an array of constants.
      //  Just send the *values*, not the ROLES object with its constant keys.
      roles.value = Object.values(response.data);
      //  roles.value = response.data;
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
      snackbar.value.value = true;
      snackbar.value.color = "green";
      snackbar.value.text = "User ROLE updated successfully";
    })
    .catch((error) => {
      console.log(error);
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text =
        error.response?.data?.message || "Error updating user ROLE";

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
        snackbar.value.value = true;
        snackbar.value.color = "green";
        snackbar.value.text = "User deleted successfully";
      })
      .catch((error) => {
        console.log(error);
        snackbar.value.value = true;
        snackbar.value.color = "error";
        snackbar.value.text = error.response?.data?.message || "Error deleting user";
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
        @update-role="handleUpdateRole"
        @delete-user="handleDeleteUser"
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
