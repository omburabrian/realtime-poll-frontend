import apiClient from "./services";
export default {
  //get all answers for a question
  getAnswersForQuestion(questionId) {
    return apiClient.get("questions/" + questionId + "/answers");
  },
  //add answer to a question
  addAnswerToQuestion() {
    return apiClient.post("questions/" + questionId + "/answers");
  },

  //update answer in a question
  updateAnswerInQuestion(questionId, data) {
    return apiClient.put("answers/" + questionId, data);
  },
  //delete answer from a question
  deleteAnswerFromQuestion(questionId) {
    return apiClient.delete("questions/" + questionId + "/answers");
  },
};
