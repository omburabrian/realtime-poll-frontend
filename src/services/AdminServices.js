import apiClient from "./services";

export default {

  getDashboardData() {
    return apiClient.get("admin");
  },

  loadTestData_users() {
    return apiClient.post("admin/load-test-data/users");
  },

};
