import apiClient from "./services";

export default {
  getPollQuestions() {
    return apiClient.get("questions");
  },
  getPollQuestionsForPoll(PollId) {
    return apiClient.get("questions/poll/" + PollId );
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

  getPollQuestionAnswers(questionId) {
    return apiClient.get("answers/question/" + questionId);
  },
};
