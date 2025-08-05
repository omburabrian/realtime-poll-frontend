import apiClient from "./services";

export default {
  getCourses() {
    return apiClient.get("courses/");
  },
  getCourse(id) {
    return apiClient.get("courses/" + id);
  },
  addCourse(course) {
    return apiClient.post("courses/", course);
  },
  updateCourse(courseId, course) {
    return apiClient.put("courses/" + courseId, course);
  },
  deleteCourse(courseId) {
    return apiClient.delete("courses/" + courseId);
  },
  deleteAllCourses() {
    return apiClient.delete("courses/");
  },
  bulkCreateCourses(courses) {
    return apiClient.post("courses/bulk-create", courses);
  },
};
