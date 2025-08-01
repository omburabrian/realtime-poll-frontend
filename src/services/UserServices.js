import apiClient from "./services";

export default {

  getUser() {
    return apiClient.get("users");
  },

  addUser(user) {
    return apiClient.post("users", user);
  },

  loginUser(loginCredentials) {
    console.log(loginCredentials);
    return apiClient.post("login", loginCredentials, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        crossDomain: true,
        Authorization:
          "Basic " + btoa(loginCredentials.email + ":" + loginCredentials.password),
      },
    });
  },

  logoutUser() {
    return apiClient.post("logout");
  },
  
  getUsers() {
    return apiClient.get("users");
  },

  getUserRoles() {
    return apiClient.get("user-roles");
  },

  updateUser(id, data) {
    return apiClient.put("users/" + id, data);
  },

  deleteUser(id) {
    return apiClient.delete("users/" + id);
  },

};
