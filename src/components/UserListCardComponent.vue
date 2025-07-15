<script setup>
import { onMounted, ref } from "vue";

//  This (user) is the logged in current user.
//  Not the displayed user on the card, "aUser".
const user = ref(null);

const props = defineProps({
  aUser: {
    type: Object,
    required: true,
  },
  roles: {
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
  alert("Update user role");
  //  emit("update-role", { userId: props.aUser.id, role: newRole });
}

function deleteUser() {
  alert("Delete user");
  //  emit("delete-user", props.aUser.id);
}

function navigateToEdit() {
  alert("Edit user");
  //  router.push({ name: "editUser", params: { id: props.aUser.id } });
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
        <v-col cols="10">
          {{ aUser.lastName }}, {{ aUser.firstName }}
          <v-chip class="ma-2" color="accent" label>
            <v-icon start icon="mdi-email-outline"></v-icon>
            {{ aUser.email }} 
          </v-chip>
        </v-col>
        <v-col class="d-flex justify-end">
          <v-icon
            v-if="user !== null"
            size="small"
            icon="mdi-pencil"
            @click="navigateToEdit()"
          ></v-icon>
        </v-col>

        <v-col class="d-flex justify-end">
          <v-select
            v-model="aUser.role"
            :item-title="ROLE"
            :items="roles"
            item-title="name"
            item-value="name"
            label="Role"
            density="compact"
            hide-details
            @update:modelValue="updateUserRole"
            :disabled="user && user.id === aUser.id"

            ></v-select>
        </v-col>  
        <v-col cols="4" sm="2" md="2" class="d-flex justify-end">
          <v-icon
            v-if="user && user.id !== aUser.id"
            size="small"
            icon="mdi-delete"
            color="error"
            @click.stop="deleteUser()"
            aria-label="Delete User"
          ></v-icon>
        </v-col>

      </v-row>
    </v-card-title>
    <v-card-text class="body-1">
      Username: {{ aUser.userName }}
    </v-card-text>
    <v-expand-transition>
      <v-card-text class="pt-0" v-show="showDetails">
        <h3>User Details</h3>
      </v-card-text>
    </v-expand-transition>
  </v-card>
</template>
