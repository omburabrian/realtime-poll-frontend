import apiClient from "./services";

export default {

  getUser() {
    return apiClient.get("users");
  },

  getUserById(id) {
    return apiClient.get("users/" + id);
  },

  addUser(user) {
    return apiClient.post("users", user);
  },

  loginUser(user) {
    console.log(user);
    return apiClient.post("login", user.value, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        crossDomain: true,
        Authorization:
          "Basic " + btoa(user.value.email + ":" + user.value.password),
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
