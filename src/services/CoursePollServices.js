import apiClient from "./services";

export default {
  // Get all courses linked to a specific poll
  getCoursesByPollId(pollId) {
    return apiClient.get("coursePolls/" + pollId);
  },

  // Create a new course-poll link
  createCoursePollLink(pollId, courseId) {
    link = { pollId, courseId };
    return apiClient.post("coursePolls/", link);
  },

  // Update a course-poll link for a specific poll
  updateCoursePollLink(pollId, oldCourseId, newCourseId) {
    return apiClient.put("coursePolls/" + pollId, {
      oldCourseId,
      newCourseId,
    });
  },

  // Delete all course-poll links for a specific poll
  deleteAllLinksForPoll(pollId) {
    return apiClient.delete("coursePolls/" + pollId);
  },
};
