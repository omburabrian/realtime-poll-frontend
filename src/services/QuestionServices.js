import { da } from "vuetify/locale";
import apiClient from "./services";
export default {
  getQuestionsForPoll(pollId) {
    return apiClient.get("polls/" + pollId + " /questions");
  },
  //add Question to a poll
  addQuestionToPoll() {
    return apiClient.post("questions");
  },
  //delete Question from a poll
  deleteQuestionFromPoll(pollId) {
    return apiClient.delete("questions/" + pollId);
  },
  //update Question in a poll
  updateQuestionInPoll(pollId, data) {
    return apiClient.put("questions/" + pollId, data);
  },
};
