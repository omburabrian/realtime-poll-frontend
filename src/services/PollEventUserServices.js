import { id } from "vuetify/locale";
import apiClient from "./services";
export default {
  getUserPollHistory(pollEventUserId) {
    return apiClient("poll-event-users/user/" + pollEventUserId);
  },
};
