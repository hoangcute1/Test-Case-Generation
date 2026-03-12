export type RootStackParamList = {
  Landing: undefined;
  Login: undefined;
  ForgotPassword: undefined;
  JiraAuth: undefined;
  Dashboard: undefined;
  Issues: { projectKey: string };
  CollectionDetail: { collectionId: string };
  CollectionPicker: { issueDescriptions: string[] };
};

export type TabParamList = {
  ProjectsTab: undefined;
  PostmanTab: undefined;
  SettingsTab: undefined;
};
