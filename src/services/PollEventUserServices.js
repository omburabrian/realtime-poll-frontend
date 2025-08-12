import { id } from "vuetify/locale";
import apiClient from "./services";
export default {
  getUserPollHistory(pollEventUserId) {
    return apiClient("poll-event-users/user/" + pollEventUserId);
  },

  addPollEventUser(pollEventUser) {
    return apiClient.post("poll-event-users/", pollEventUser);
  },

  // GET /poll-event-users/lookup/event/:pollEventId/user/:userId
  getByEventAndUser(pollEventId, userId) {
    return apiClient.get(
      "poll-event-users/lookup/event/" + pollEventId + "/user/" + userId
    );
  },

  // GET /poll-event-users/lookup/poll/:pollId/user/:userId
  getByPollAndUser(pollId, userId) {
    return apiClient.get(
      "poll-event-users/lookup/poll/" + pollId + "/user/" + userId
    );
  },
};

