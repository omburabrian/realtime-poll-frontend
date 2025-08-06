<script setup>
import { onMounted } from "vue";
import { ref } from "vue";
import ProfessorServices from "../../services/ProfessorServices.js";
import UserServices from "../../services/UserServices.js";
import { useSnackbar } from "../../composables/useSnackbar.js";

const user = ref(null);     //  Current logged in user
const userRoles = ref([]);  //  List of user user roles
const polls = ref(null);    //  List of polls

//  Snackbar composable
const { snackbar, showErrorSnackbar, closeSnackbar } = useSnackbar();

//----------------------------------------------------------------
onMounted(async () => {
    user.value = JSON.parse(localStorage.getItem("user"));
    //  console.log(user.value);

    //  Must be authenticated user to get user roles.
    if (user.value !== null) {
        await getUserRoles();
    }
});

function getUserFirstNameLastName() {
    return user.value?.firstName + " " + user.value?.lastName;
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
            console.log(error);
            showErrorSnackbar(error, "Failed to load user roles.");
        });
}

//  ToDo:   Add name to title
//  Polls for Professor {{ getUserFirstNameLastName() }}

//----------------------------------------------------------------
</script>

<template>
    <v-container>
        <div id="body">

            <v-row align="center" class="mb-4">
                <v-col cols="10"><v-card-title class="pl-0 text-h4 font-weight-bold">
                        Polls for Professor {{ getUserFirstNameLastName() }}
                    </v-card-title>
                </v-col>
            </v-row>


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
