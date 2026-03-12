import { create } from "zustand";
import { storage } from "../services/storage";

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthUser {
  name: string;
  email: string;
  role: "admin";
}

interface AuthState {
  // Local auth (email/password)
  authUser: AuthUser | null;
  authToken: string | null;
  isAuthenticated: boolean;

  // Jira
  jiraUser: User | null;
  jiraToken: string | null;
  isJiraAuthenticated: boolean;

  // Postman
  postmanApiKey: string | null;
  isPostmanAuthenticated: boolean;

  // Actions
  initAuth: () => Promise<void>;
  login: (user: AuthUser, token: string) => Promise<void>;
  logout: () => Promise<void>;
  loginJira: (user: User, token: string, session: string) => Promise<void>;
  logoutJira: () => Promise<void>;
  loginPostman: (apiKey: string) => Promise<void>;
  logoutPostman: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  authUser: null,
  authToken: null,
  isAuthenticated: false,
  jiraUser: null,
  jiraToken: null,
  isJiraAuthenticated: false,
  postmanApiKey: null,
  isPostmanAuthenticated: false,

  /**
   * Hydrate auth state from secure storage on app startup
   */
  initAuth: async () => {
    const [authUser, authToken, user, token, postmanKey] = await Promise.all([
      storage.getAuthUser(),
      storage.getAuthToken(),
      storage.getJiraUser(),
      storage.getJiraToken(),
      storage.getPostmanApiKey(),
    ]);

    set({
      authUser: authUser as AuthUser | null,
      authToken: authToken,
      isAuthenticated: !!(authUser && authToken),
      jiraUser: user,
      jiraToken: token,
      isJiraAuthenticated: !!(user && token),
      postmanApiKey: postmanKey,
      isPostmanAuthenticated: !!postmanKey,
    });
  },

  login: async (user, token) => {
    await Promise.all([
      storage.setAuthUser(user),
      storage.setAuthToken(token),
      storage.setAuthRole(user.role),
    ]);
    set({
      authUser: user,
      authToken: token,
      isAuthenticated: true,
    });
  },

  logout: async () => {
    await storage.clearAuth();
    set({
      authUser: null,
      authToken: null,
      isAuthenticated: false,
    });
  },

  loginJira: async (user, token, session) => {
    await Promise.all([
      storage.setJiraUser(user),
      storage.setJiraToken(token),
      storage.setJiraSession(session),
    ]);
    set({
      jiraUser: user,
      jiraToken: token,
      isJiraAuthenticated: true,
    });
  },

  logoutJira: async () => {
    await storage.clearJira();
    set({
      jiraUser: null,
      jiraToken: null,
      isJiraAuthenticated: false,
    });
  },

  loginPostman: async (apiKey) => {
    await storage.setPostmanApiKey(apiKey);
    set({
      postmanApiKey: apiKey,
      isPostmanAuthenticated: true,
    });
  },

  logoutPostman: async () => {
    await storage.clearPostman();
    set({
      postmanApiKey: null,
      isPostmanAuthenticated: false,
    });
  },

  logoutAll: async () => {
    await storage.clearAll();
    set({
      authUser: null,
      authToken: null,
      isAuthenticated: false,
      jiraUser: null,
      jiraToken: null,
      isJiraAuthenticated: false,
      postmanApiKey: null,
      isPostmanAuthenticated: false,
    });
  },
}));
