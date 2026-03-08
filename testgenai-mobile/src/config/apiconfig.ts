const API_CONFIG = {
  // Change this to your backend URL
  // For Android emulator, use 10.0.2.2 instead of localhost
  // For physical device, use your machine's LAN IP
  API_BASE_URL: __DEV__
    ? "http://10.0.2.2:8000" // Android emulator default
    : "https://your-production-url.com",
  jira: {
    login: "/jira/login",
    projects: "/jira/projects",
    issues: "/jira/issues",
  },
};

export const API_BASE_URL = API_CONFIG.API_BASE_URL;

export const POSTMAN_API_KEY_URL = "https://go.postman.co/settings/me/api-keys";

export default API_CONFIG;
