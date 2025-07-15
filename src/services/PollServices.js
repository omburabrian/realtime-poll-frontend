import apiClient from "./services";

export default {
  getPolls() {
    return apiClient.get("polls");
  },
  getPollsByUserId(userId) {
    return apiClient.get("polls/user/" + userId);
  },
  getPoll(id) {
    return apiClient.get("polls/" + id);
  },
  addPoll(poll) {
    return apiClient.post("polls", poll);
  },
  updatePoll(pollId, poll) {
    return apiClient.put("polls/" + pollId, poll);
  },
  deletePoll(pollId) {
    return apiClient.delete("polls/" + pollId);
  },
};
