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
    required: true,
  },
});

onMounted(async () => {
  // await getRecipeIngredients();
  // await getRecipeSteps();
  // user.value = JSON.parse(localStorage.getItem("user"));
});

/*
async function getRecipeIngredients() {
  await RecipeIngredientServices.getRecipeIngredientsForRecipe(props.recipe.id)
    .then((response) => {
      recipeIngredients.value = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

async function getRecipeSteps() {
  await RecipeStepServices.getRecipeStepsForRecipeWithIngredients(
    props.recipe.id
  )
    .then((response) => {
      recipeSteps.value = response.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

function navigateToEdit() {
  router.push({ name: "editRecipe", params: { id: props.recipe.id } });
}
  
//  */

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
      </v-row>
    </v-card-title>
    <v-card-text class="body-1">
      {{ aUser.userName }} - {{ aUser.role }}
    </v-card-text>
    <v-expand-transition>
      <v-card-text class="pt-0" v-show="showDetails">
        <h3>User Details</h3>
      </v-card-text>
    </v-expand-transition>
  </v-card>
</template>
