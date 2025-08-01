<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";


const route = useRoute();

const recipe = ref({});



const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

function updateUser() {
    alert("Update User . . . ");
}

</script>


<template>
  <v-container>

    <v-row align="center">
      <v-col cols="10"
        ><v-card-title class="pl-0 text-h4 font-weight-bold"
          >Edit User
        </v-card-title>
      </v-col>
    </v-row>

    <v-row>
      <v-col>
        <v-card class="rounded-lg elevation-5">
          <v-card-text>
            <v-row>

              <v-col>

                <v-text-field
                  v-model="user.firstName"
                  label="First Name"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="user.lastName"
                  label="Last Name"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="user.email"
                  label="Email"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="user.username"
                  label="Username"
                  required
                ></v-text-field>

                <v-text-field
                  v-model="user.role"
                  label="Role"
                  required
                ></v-text-field>

              </v-col>

            </v-row>

          </v-card-text>
          <v-card-actions class="pt-0">
            <v-btn variant="flat" color="primary" @click="updateUser()"
              >Update User</v-btn
            >
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.value" rounded="pill">
      {{ snackbar.text }}

      <template v-slot:actions>
        <v-btn :color="snackbar.color" variant="text" @click="closeSnackBar()">
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>
