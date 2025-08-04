import apiClient from "./services";

export default {

  getDashboardData() {
    return apiClient.get("admin");
  },

  loadTestData_users() {
    return apiClient.post("admin/load-test-data/users");
  },

  loadTestData_pollsQuestionsAnswers() {
    return apiClient.post("/admin/load-test-data/polls");
  },

    loadTestData_courses() {
    return apiClient.post("/admin/load-test-data/courses");
  },

};
