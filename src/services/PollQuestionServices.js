import apiClient from "./services";

export default {

  getPollQuestionsForPoll(PollId) {
    return apiClient.get("polls/" + PollId + "/questions");
  },
 
  getPollQuestionAnswers(pollQuestionId) {
    return apiClient.get("questions/" + pollQuestionId + "/answers");
  },
  addPollQuestion(pollQuestion) {
    return apiClient.post(
      "questions/",
      pollQuestion
    );
  },
  updatePollQuestion(pollQuestion) {
    return apiClient.put(
      "questions/" + pollQuestion.id,
      pollQuestion
    );
  },
  deletePollQuestion(pollQuestion) {
    return apiClient.delete(
      "questions/" +
        pollQuestion.id
    );
  },

};
