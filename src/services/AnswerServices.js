import apiClient from "./services";
export default {
  //create an answer for a question with ID
  createAnswer(questionId, answerData) {
    return apiClient.post("questions/" + questionId + "/answers", answerData);
  },
  //retrieve all answers for a question ID
  getAnswersForQuestion(questionId) {
    return apiClient.get("questions/" + questionId + "/answers");
  },
  //update answer and question
  updateQuestionAndAnswer(questionId, data) {
    return apiClient.put("answers/" + questionId, data);
  },
  //delete answer for a question with ID
  deleteAnswerFromQuestion(questionId) {
    return apiClient.delete("questions/" + questionId + "/answers");
  },
  //delete an answer by ID
  deleteAnswer(answerId) {
    return apiClient.delete("answers/" + answerId);
  },
};
