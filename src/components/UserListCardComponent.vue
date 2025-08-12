<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();
const showDetails = ref(false);

//  This (user) is the logged in current user.
//  Not the displayed user on the card, "aUser".
const user = ref(null);

const props = defineProps({
  aUser: {
    type: Object,
    required: true,
  },
  userRoles: {
    type: Array,
    required: true,
  },
});

//  If the user attributes change, notify the parent list view.
const emit = defineEmits(["update-role", "delete-user"]);

onMounted(async () => {
  //  Don't allow an ADMIN user to accidentally downgrade their own permissions.
  //  So get the current user.  (ToDo:  Pass in as a prop.)
  user.value = JSON.parse(localStorage.getItem("user"));
});

function updateUserRole(newRole) {
  //  alert("Update user role");
  emit("update-role", { userId: props.aUser.id, role: newRole });
}

function deleteUser() {
  //  alert("Delete user");
  emit("delete-user", props.aUser.id);
}

function navigateToEdit() {
  router.push({ name: "editUser", params: { id: props.aUser.id } });
}

//----------------------------------------------------------------
</script>

<template>
  <v-card
    class="rounded-lg elevation-5 mb-8"
    @click="showDetails = !showDetails"
  >
    <v-card-title class="headline">
      <v-row align="center">

                 <v-col cols="6" class="d-lg-3">
           {{ aUser.lastName }}, {{ aUser.firstName }}
           <v-chip class="ma-2" color="accent" label>
             <v-icon start icon="mdi-email-outline"></v-icon>
             {{ aUser.email }} 
           </v-chip>
           <v-chip v-if="aUser.role === 'admin'" class="ma-1" color="primary" size="small" label>
             <v-icon start icon="mdi-shield-crown"></v-icon>
             Admin
           </v-chip>
         </v-col>

                 <v-col cols="3" class="d-lg-2">
           <v-select
             v-model="aUser.role"
             :items="userRoles"
             label="Role"
             density="compact"
             hide-details
             @update:modelValue="updateUserRole"
             @click.stop
             :disabled="user && (user.id === aUser.id || aUser.role === 'admin')"
             ></v-select>
         </v-col>  

        <v-col cols="1" class="d-lg-1 ml-auto mr-3">

                     <v-icon
             v-if="user && user.id !== aUser.id && aUser.role !== 'admin'"
             size="small"
             icon="mdi-delete"
             color="error"
             @click.stop="deleteUser()"
             aria-label="Delete User"
           ></v-icon>

          <v-icon
            v-if="user !== null"
            size="small"
            icon="mdi-pencil"
            class="ml-4"
            @click.stop="navigateToEdit()"
          ></v-icon>

        </v-col>

      </v-row>
    </v-card-title>
    <v-card-text class="body-1">
      Username: &nbsp; {{ aUser.username || 'Not set' }}
    </v-card-text>
    <v-expand-transition>
      <v-card-text class="pt-0" v-show="showDetails">
        <h3>User Details</h3>
        (User detail line 1) <br>
        (User detail line 2) <br>
        (User detail line 3)
      </v-card-text>
    </v-expand-transition>
  </v-card>
</template>
