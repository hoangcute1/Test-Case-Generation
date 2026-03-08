import { create } from "zustand";
import { storage } from "../services/storage";

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthState {
  // Jira
  jiraUser: User | null;
  jiraToken: string | null;
  isJiraAuthenticated: boolean;

  // Postman
  postmanApiKey: string | null;
  isPostmanAuthenticated: boolean;

  // Actions
  initAuth: () => Promise<void>;
  loginJira: (user: User, token: string, session: string) => Promise<void>;
  logoutJira: () => Promise<void>;
  loginPostman: (apiKey: string) => Promise<void>;
  logoutPostman: () => Promise<void>;
  logoutAll: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  jiraUser: null,
  jiraToken: null,
  isJiraAuthenticated: false,
  postmanApiKey: null,
  isPostmanAuthenticated: false,

  /**
   * Hydrate auth state from secure storage on app startup
   */
  initAuth: async () => {
    const [user, token, postmanKey] = await Promise.all([
      storage.getJiraUser(),
      storage.getJiraToken(),
      storage.getPostmanApiKey(),
    ]);

    set({
      jiraUser: user,
      jiraToken: token,
      isJiraAuthenticated: !!(user && token),
      postmanApiKey: postmanKey,
      isPostmanAuthenticated: !!postmanKey,
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
      jiraUser: null,
      jiraToken: null,
      isJiraAuthenticated: false,
      postmanApiKey: null,
      isPostmanAuthenticated: false,
    });
  },
}));
