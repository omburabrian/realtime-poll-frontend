import apiClient from "./services";
export default {
  // Create User Answer
  CreateUserAnswer(answer) {
    return apiClient.post("user-answers/", answer);
  },
  UpdateUserAnswer(pollEventUserId, questionId, data) {
    return apiClient.put(
      "/user-answers/poll-event-user/" +
        pollEventUserId +
        "/question/" +
        questionId,
      data
    );
  },
  getUserAnswers(pollEventUserId, questionId) {
    return apiClient(
      "/user-answers/poll-event-user/" +
        pollEventUserId +
        "/question/" +
        questionId
    );
  },
};
