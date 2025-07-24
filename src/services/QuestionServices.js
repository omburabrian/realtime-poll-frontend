import apiClient from "./services";
export default {
  //retrieve all questions for a poll ID
  getQuestionsForPoll(pollId) {
    return apiClient.get("polls/" + pollId + " /questions");
  },
  //create a new Question
  createQuestion(questionData) {
    return apiClient.post("questions/", questionData);
  },
  //delete Question from a poll with ID
  deleteQuestionFromPoll(pollId) {
    return apiClient.delete("questions/" + pollId);
  },
  //update Question and Answers with question ID
  updateQuestionAndAnswer(questionId, data) {
    return apiClient.put("questions/" + questionId, data);
  },
};
