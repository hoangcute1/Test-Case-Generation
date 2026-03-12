export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  JiraAuth: undefined;
  Dashboard: undefined;
  Issues: { projectKey: string };
  CollectionDetail: { collectionId: string };
  CollectionPicker: { issueDescriptions: string[] };
  UserManagement: undefined;
  AdminTestCases: { projectKey?: string };
};

export type TabParamList = {
  AdminTab: undefined;
  ProjectsTab: undefined;
  PostmanTab: undefined;
  SettingsTab: undefined;
};
