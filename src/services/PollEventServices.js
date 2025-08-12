import apiClient from "./services";

export default {
  // Create a new PollEvent (specific instance of a poll)
  addPollEvent(pollEvent) {
    return apiClient.post("poll-events/", pollEvent);
  },

  // Retrieve all PollEvents for a Poll
  getPollEventsForPoll(pollId) {
    return apiClient.get(`poll-events/poll/${pollId}`);
  },

  // Retrieve all PollEvents for a User
  getPollEventsForUser(userId) {
    return apiClient.get(`poll-events/user/${userId}`);
  },

  // Retrieve a single PollEvent by ID
  getPollEventById(id) {
    return apiClient.get(`poll-events/${id}`);
  },

  // Update a PollEvent by ID
  updatePollEvent(pollEvent) {
    return apiClient.put(`poll-events/${pollEvent.id}`, pollEvent);
  },

  // Delete a PollEvent by ID (accepts object with id or raw id)
  deletePollEvent(pollEvent) {
    const id = typeof pollEvent === "object" ? pollEvent.id : pollEvent;
    return apiClient.delete(`poll-events/${id}`);
  },

  // Delete ALL PollEvents (admin only)
  deleteAllPollEvents() {
    return apiClient.delete("poll-events/");
  },

  // Bulk create PollEvents
  // Accepts an array (wrapped as { events }) or a pre-shaped payload
  bulkCreatePollEvents(eventsOrPayload) {
    const payload = Array.isArray(eventsOrPayload)
      ? { events: eventsOrPayload }
      : eventsOrPayload;
    return apiClient.post("poll-events/bulk-create", payload);
  },
};
