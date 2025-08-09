import apiClient from "./services";

export default {
  // Get all courses linked to a specific poll
  getCoursesByPollId(pollId) {
    return apiClient.get("course-polls/poll/" + pollId);
  },

  // Create a new course-poll link
  createCoursePollLink(pollId, courseId) {
    const link = { pollId, courseId };
    return apiClient.post("course-polls/", link);
  },

  // Update a course-poll link for a specific poll
  updateCoursePollLink(pollId, oldCourseId, newCourseId) {
    return apiClient.put("course-polls/" + pollId, {
      oldCourseId,
      newCourseId,
    });
  },

  // Delete all course-poll links for a specific poll
  deleteAllLinksForPoll(pollId) {
    return apiClient.delete("course-polls/poll/" + pollId);
  },
};
