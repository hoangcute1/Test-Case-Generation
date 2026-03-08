export type RootStackParamList = {
  Landing: undefined;
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
