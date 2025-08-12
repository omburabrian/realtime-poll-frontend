import apiClient from "./services";

export default {

  getDashboardData() {
    return apiClient.get("admin");
  },

  loadTestData_users() {
    return apiClient.post("admin/load-test-data/users");
  },

  loadTestData_polls() {
    return apiClient.post("/admin/load-test-data/polls");
  },

  loadTestData_quizzesAndAnswers() {
    return apiClient.post("/admin/load-test-data/quizzes");
  },

  loadTestData_discussionPolls() {
    return apiClient.post("/admin/load-test-data/discussion-polls");
  },
    
  loadTestData_courses() {
    return apiClient.post("/admin/load-test-data/courses");
  },

};
