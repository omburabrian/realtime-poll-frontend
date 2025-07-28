import apiClient from "./services";

export default {

  getDashboardData() {
    return apiClient.get("/professor");
  },

  getPollListForProfessorId(id) {
    return apiClient.get("/professor/" + id + "/polls");
  },

};
