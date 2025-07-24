import apiClient from "./services";

export default {
  //get all polls for the user
  getPolls(userId) {
    return apiClient.get("users/" + userId + "/polls");
  },
  //get poll by ID
  getPoll(id) {
    return apiClient.get("polls/" + id);
  },
  //update poll
  updatePoll(id, data) {
    return apiClient.put("polls/" + id, data);
  },
  //delete poll
};
