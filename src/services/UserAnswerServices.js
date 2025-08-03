import apiClient from "./services";
export default {
  // Create User Answer
  CreateUserAnswer(pollEventUserId, questionId, data) {
    return apiClient.post(
      "user-answers/pol-event-user/" +
        pollEventUserId +
        "/question/" +
        questionId,
      data
    );
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
