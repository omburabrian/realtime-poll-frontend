import apiClient from "./services";
export default {
  // Create User Answer
  CreateUserAnswer(data) {
    return apiClient.post(
      "user-answers/poll-event-user/" +
        pollEventUserId +
        "/question/" +
        questionId,
      data
    );
  },
};
