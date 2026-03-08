export type JiraProject = {
  uuid: string;
  id: string;
  key: string;
  name: string;
  avatarUrls: {
    "48x48": string;
    "24x24": string;
    "16x16": string;
    "32x32": string;
  };
  projectTypeKey: string,
    simplified: boolean,
    style: string,
    isPrivate: boolean,
    entityId: string,
};

export type JiraIssue = {
  expand:  string ,
  id :  string ,
  self :  string ,
  key :  string   ,
  fields : {
    summary :  string ,
    statusCategory : {
      self :  string ,
      id :  number,
      key :  string ,
      colorName :  string ,
      name :  string 
    },
    description :  string
  }
}
