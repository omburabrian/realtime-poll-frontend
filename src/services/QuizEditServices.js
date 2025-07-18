import apiClient from "./services";

export default {
  //get all polls
  getPolls() {
    return apiClient.get("polls");
  },
  //get poll by ID
  getPoll(id) {
    return apiClient.get("polls/" + id);
  },
  //   //get polls for a specific user
  //   getPollForUser(userId) {
  //     return apiClient.get("polls/user/" + userId);
  //   },
  //   //update poll with ID
  //   updatePoll(pollId) {
  //     return apiClient.put("polls/" + pollId);
  //   },
  //   getRecipe(id) {
  //     return apiClient.get("recipes/" + id);
  //   },
  //   addRecipe(recipe) {
  //     return apiClient.post("recipes", recipe);
  //   },
  //   updateRecipe(recipeId, recipe) {
  //     return apiClient.put("recipes/" + recipeId, recipe);
  //   },
  //   deleteRecipe(recipeId) {
  //     return apiClient.delete("recipes/" + recipeId);
  //   },
};
