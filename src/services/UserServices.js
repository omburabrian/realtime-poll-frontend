import apiClient from "./services";

/*
NOTE:
Using try-catch blocks to catch and explictily re-throw errors, making it
clear that any errors are propogated to the calling components.  This also
prevents any unhandled "promise rejection" errors from displaying in the
console.
*/

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

  // fixed login error
  async loginUser(loginCredentials) {
    try {
      const response = await apiClient.post("login", loginCredentials, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
          crossDomain: true,
          Authorization:
            "Basic " + btoa(loginCredentials.email + ":" + loginCredentials.password),
        },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },

  async logoutUser() {
    try {
      const response = await apiClient.post("logout");
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getUsers() {
    try {
      const response = await apiClient.get("users");
      return response;
    } catch (error) {
      throw error;
    }
  },

  async getUserRoles() {
    try {
      const response = await apiClient.get("user-roles");
      return response;
    } catch (error) {
      throw error;
    }
  },

  async updateUser(id, data) {
    try {
      const response = await apiClient.put("users/" + id, data);
      return response;
    } catch (error) {
      throw error;
    }
  },

  async deleteUser(id) {
    try {
      const response = await apiClient.delete("users/" + id);
      return response;
    } catch (error) {
      throw error;
    }
  },

};
