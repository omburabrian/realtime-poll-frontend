import { id } from "vuetify/locale";
import apiClient from "./services";
export default {
  // Create User Answer
  CreateUserAnswer(answer) {
    return apiClient.post("user-answers/", answer);
  },
  UpdateUserAnswer(id) {
    return apiClient.put("/user-answers/" + id);
  },
  GetUserAnswersForPoll(pollEventUserId) {
    return apiClient("/user-answers/poll-event-user/" + pollEventUserId);
  },
};
