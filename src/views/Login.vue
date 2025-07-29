<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSnackbar } from "../composables/useSnackbar.js";
import UserServices from "../services/UserServices.js";

const router = useRouter();
const isCreateAccount = ref(false);

//  For logging in with a current user
const loginCredentials = ref({
  email: "",
  password: "",
});

//  For creating a new account
const newUser = ref({
  firstName: "",
  lastName: "",
  username: "",
  email: "",
  password: "",
});

//  For toggling password visibility
const showPassword = ref(false);

//  Snackbar composable
const { snackbar, showSnackbar, showErrorSnackbar, closeSnackbar } = useSnackbar();

onMounted(async () => {
  localStorage.removeItem("user");
  // if (localStorage.getItem("user") !== null) {
  //   router.push({ name: "recipes" });
  // }
});

function navigateToPollsHistory() {
  router.push({ name: "polls-history" });
}

async function createAccount() {
  await UserServices.addUser(newUser.value)
    .then(() => {
      showSnackbar("Account created successfully!", "green");
      closeCreateAccount();
    })
    .catch((error) => {
      console.log(error);
      showErrorSnackbar(error.response.data.message);
    });
}

async function login() {
  await UserServices.loginUser(loginCredentials.value)
    .then((data) => {
      window.localStorage.setItem("user", JSON.stringify(data.data));
      showSnackbar("Login successful!", "green");
      router.push({ name: "polls-history" });
    })
    .catch((error) => {
      console.log(error);
      showErrorSnackbar(error.response.data.message);
    });
}

function openCreateAccount() {
  isCreateAccount.value = true;
  //  Clear the form input fields when opening the dialog
  newUser.value = {
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
  };
}

function closeCreateAccount() {
  isCreateAccount.value = false;
}

</script>

<template>
  <v-container>
    <div id="body">
      <v-card class="rounded-lg elevation-5">
        <v-form @submit.prevent="login">
          <v-card-title class="headline mb-2">Login </v-card-title>
          <v-card-text>
            <v-text-field
              v-model="loginCredentials.email"
              label="Email or Username"
              required
            ></v-text-field>

            <v-text-field
              v-model="loginCredentials.password"
              :type="showPassword ? 'text' : 'password'"
              :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append-inner="showPassword = !showPassword"
              label="Password"
              required
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn variant="flat" color="secondary" @click="openCreateAccount()"
              >Create Account</v-btn
            >
            <v-spacer></v-spacer>

            <v-btn variant="flat" color="primary" type="submit">Login</v-btn>
          </v-card-actions>
        </v-form>
      </v-card>

      <v-card class="rounded-lg elevation-5 my-8">
        <v-card-title class="text-center headline">
          <v-btn
            class="ml-2"
            variant="flat"
            color="secondary"
            @click="navigateToPollsHistory()"
          >
            View Polls History
          </v-btn>
        </v-card-title>
      </v-card>

      <v-dialog persistent v-model="isCreateAccount" width="800">
        <v-card class="rounded-lg elevation-5">
          <v-form @submit.prevent="createAccount">
            <v-card-title class="headline mb-2">Create Account </v-card-title>
            <v-card-text>
              <v-text-field
                v-model="newUser.firstName"
                label="First Name"
                required
              ></v-text-field>

              <v-text-field
                v-model="newUser.lastName"
                label="Last Name"
                required
              ></v-text-field>

              <v-text-field
                v-model="newUser.username"
                label="Username"
                required
              ></v-text-field>

              <v-text-field
                v-model="newUser.email"
                label="Email"
                required
              ></v-text-field>

              <v-text-field
                v-model="newUser.password"
                :type="showPassword ? 'text' : 'password'"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                label="Password"
                required
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-spacer></v-spacer>
              <v-btn
                variant="flat"
                color="secondary"
                @click="closeCreateAccount()"
                >Close</v-btn
              >
              <v-btn variant="flat" color="primary" type="submit"
                >Create Account</v-btn
              >
            </v-card-actions>
          </v-form>
        </v-card>
      </v-dialog>

      <v-snackbar v-model="snackbar.value" rounded="pill">
        {{ snackbar.text }}

        <template v-slot:actions>
          <v-btn :color="snackbar.color" variant="text" @click="closeSnackbar()">
            Close
          </v-btn>
        </template>
      </v-snackbar>
    </div>
  </v-container>
</template>
