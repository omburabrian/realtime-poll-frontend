<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import UserServices from "../../services/UserServices.js";

const route = useRoute();
const router = useRouter();

const user = ref({
  firstName: "",
  lastName: "",
  email: "",
  username: "",
  role: "",
});

const userRoles = ref([]);
const loading = ref(false);

const snackbar = ref({
  value: false,
  color: "",
  text: "",
});

onMounted(async () => {
  await getUserRoles();
  await loadUser();
});

async function loadUser() {
  try {
    loading.value = true;
    
    // Try to get user by ID first
    try {
      const response = await UserServices.getUserById(route.params.id);
      console.log("User data received from getUserById:", response.data);
      
      if (response.data) {
        user.value = { ...response.data };
        console.log("User object after assignment:", user.value);
        return;
      }
    } catch (getByIdError) {
      console.log("getUserById failed, trying alternative approach:", getByIdError);
    }
    
         // Fallback: get all users and find the specific user
     const allUsersResponse = await UserServices.getUsers();
     
     const foundUser = allUsersResponse.data.find(u => u.id == route.params.id);
     
     if (foundUser) {
       user.value = { ...foundUser };
     } else {
      snackbar.value.value = true;
      snackbar.value.color = "error";
      snackbar.value.text = "User not found";
    }
  } catch (error) {
    console.log(error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = error.response?.data?.message || "Error loading user";
  } finally {
    loading.value = false;
  }
}

async function getUserRoles() {
  try {
    const response = await UserServices.getUserRoles();
    userRoles.value = Object.values(response.data);
  } catch (error) {
    console.log(error);
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = error.response?.data?.message || "Error loading user roles";
  }
}

async function updateUser() {
  // Validate form
  if (!user.value.firstName || !user.value.lastName || 
      !user.value.email || !user.value.username || !user.value.role) {
    snackbar.value.value = true;
    snackbar.value.color = "error";
    snackbar.value.text = "Please fill in all fields";
    return;
  }

     try {
     loading.value = true;
     
     // Create update payload with only the fields we want to update
     const updatePayload = {
       firstName: user.value.firstName,
       lastName: user.value.lastName,
       email: user.value.email,
       username: user.value.username,
       role: user.value.role
     };
     
     await UserServices.updateUser(route.params.id, updatePayload);
    
    snackbar.value.value = true;
    snackbar.value.color = "green";
    snackbar.value.text = "User updated successfully";
    
    // Navigate back to user list after a short delay
    setTimeout(() => {
      router.push({ name: "admin-users" });
    }, 1500);
     } catch (error) {
     console.log(error);
     snackbar.value.value = true;
     snackbar.value.color = "error";
     snackbar.value.text = error.response?.data?.message || "Error updating user";
   } finally {
    loading.value = false;
  }
}

function cancelEdit() {
  router.push({ name: "admin-users" });
}

function closeSnackBar() {
  snackbar.value.value = false;
}
</script>


<template>
  <v-container>
    <v-row align="center" class="mb-4">
      <v-col cols="8">
        <v-card-title class="pl-0 text-h4 font-weight-bold">
          Edit User
        </v-card-title>
      </v-col>
      <v-col cols="4" class="text-right">
        <v-btn
          variant="outlined"
          color="secondary"
          @click="cancelEdit()"
          class="mr-2"
        >
          Cancel
        </v-btn>
      </v-col>
    </v-row>

    <v-row>
      <v-col cols="12" md="8" lg="6">
        <v-card class="rounded-lg elevation-5">
          <v-card-title class="text-h6 pb-0">
            User Information
          </v-card-title>
          <v-card-text>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="user.firstName"
                  label="First Name"
                  required
                  :loading="loading"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="user.lastName"
                  label="Last Name"
                  required
                  :loading="loading"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="user.email"
                  label="Email"
                  type="email"
                  required
                  :loading="loading"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="user.username"
                  label="Username"
                  required
                  :loading="loading"
                  variant="outlined"
                  density="comfortable"
                ></v-text-field>
              </v-col>
                             <v-col cols="12" md="6">
                 <v-select
                   v-model="user.role"
                   :items="userRoles"
                   label="Role"
                   required
                   :loading="loading"
                   variant="outlined"
                   density="comfortable"
                   :disabled="user.role === 'admin'"
                 ></v-select>
                 <v-alert
                   v-if="user.role === 'admin'"
                   type="info"
                   variant="tonal"
                   density="compact"
                   class="mt-2"
                 >
                   Admin roles cannot be changed for security reasons.
                 </v-alert>
               </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions class="pa-4">
            <v-btn
              variant="flat"
              color="primary"
              @click="updateUser()"
              :loading="loading"
              :disabled="loading"
            >
              Update User
            </v-btn>
            <v-spacer></v-spacer>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

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
  </v-container>
</template>
