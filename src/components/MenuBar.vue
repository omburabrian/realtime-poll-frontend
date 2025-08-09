<script setup>
import ocLogo from "/oc_logo.png";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import UserServices from "../services/UserServices";

const router = useRouter();

const user = ref(null);
const userRoles = ref([]); //  List of user user roles
const title = ref("Real-time Poll");
const logoURL = ref("");

const adminMenuItems = ref([
  { title: "Admin Dashboard", name: "admin" },
  { title: "Users", name: "admin-users" },
  { title: "Database", name: "admin-database" },
  { title: "Settings", name: "admin-settings" },
]);

const professorMenuItems = ref([
  { title: "Professor Dashboard", name: "professor" },
  { title: "Professor Polls", name: "professor-polls" },
  { title: "Professor Preferences", name: "professor-preferences" },
  { title: "Manage Courses", name: "professor-courses" },
]);

onMounted(async () => {
  logoURL.value = ocLogo;
  user.value = JSON.parse(localStorage.getItem("user"));

  //  Must be authenticated user to get user roles.
  if (user.value !== null) {
    await getUserRoles();
  }
});

function logout() {
  UserServices.logoutUser()
    .then((data) => {
      console.log(data);
    })
    .catch((error) => {
      console.log(error);
    });
  localStorage.removeItem("user");
  user.value = null;
  router.push({ name: "login" });
}

//----------------------------------------------------------------
//  ToDo:  Put this in a reusable utility service.
//  Get user user roles.
async function getUserRoles() {
  await UserServices.getUserRoles()
    .then((response) => {
      //  ROLES are defined as an array of constants.
      userRoles.value = response.data;
      //  console.log('userRoles.value.PROFESSOR');
      //  console.log(userRoles.value.PROFESSOR);
    })
    .catch((error) => {
      let defaultMessage = "Unknown error while getting user roles";
      const message =
        error?.response?.data?.message || error?.message || defaultMessage;
      //  console.log(message);
    });
}

function isProfessorOrAdmin() {
  return (
    user.value &&
    (user.value.role === userRoles.value.PROFESSOR ||
      user.value.role === userRoles.value.ADMIN)
  );
}

function isAdmin() {
  return user.value && user.value.role === userRoles.value.ADMIN;
}

function isProfessor() {
  return user.value && user.value.role === userRoles.value.PROFESSOR;
}

//  Removed RECIPE options from template, below:
/*
      <v-btn class="mx-2" :to="{ name: 'recipes' }">
        Recipes
      </v-btn>
      <v-btn v-if="user === null" class="mx-2" :to="{ name: 'login' }">
        Login
      </v-btn>
      <v-btn v-if="user !== null" class="mx-2" :to="{ name: 'ingredients' }">
        Ingredients
      </v-btn>
*/

//-----------------------------------------------------------------------
</script>

<template>
  <div>
    <v-app-bar color="primary" app dark>
      <router-link :to="{ name: 'recipes' }">
        <v-img
          class="mx-2"
          :src="logoURL"
          height="50"
          width="50"
          contain
        ></v-img>
      </router-link>
      <v-toolbar-title class="title">
        {{ title }}
      </v-toolbar-title>
      <v-spacer></v-spacer>

      <v-btn v-if="user === null" class="mx-2" :to="{ name: 'login' }">
        Login
      </v-btn>

      <v-menu
        v-if="user !== null && isProfessorOrAdmin()"
        location="bottom"
        rounded
      >
        <template v-slot:activator="{ props }">
          <v-btn class="mx-2" v-bind="props">
            Professor <v-icon end>mdi-menu-down</v-icon>
          </v-btn>
          <v-btn v-if="user !== null" class="mx-2" :to="{ name: 'takeQuiz' }">
            Take Quiz
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in professorMenuItems"
            :key="index"
            :to="{ name: item.name }"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu v-if="user !== null && isAdmin()" location="bottom" rounded>
        <template v-slot:activator="{ props }">
          <v-btn class="mx-2" v-bind="props">
            Admin <v-icon end>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item
            v-for="(item, index) in adminMenuItems"
            :key="index"
            :to="{ name: item.name }"
          >
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>

      <v-menu v-if="user !== null" min-width="200px" rounded>
        <template v-slot:activator="{ props }">
          <v-btn icon v-bind="props">
            <v-avatar class="mx-auto text-center" color="accent" size="large">
              <span class="white--text font-weight-bold">{{
                `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
              }}</span>
            </v-avatar>
          </v-btn>
        </template>
        <v-card>
          <v-card-text>
            <div class="mx-auto text-center">
              <v-avatar color="accent">
                <span class="white--text text-h5">{{
                  `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                }}</span>
              </v-avatar>
              <h3>{{ `${user.firstName} ${user.lastName}` }}</h3>
              <p class="text-caption mt-1">
                {{ user.email }}
              </p>
              <v-divider class="my-3"></v-divider>
              <v-btn rounded variant="text" @click="logout()"> Logout </v-btn>
            </div>
          </v-card-text>
        </v-card>
      </v-menu>
    </v-app-bar>
  </div>
</template>
