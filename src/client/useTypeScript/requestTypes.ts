export type AutocompleteRequest = {
  event: 'autocomplete-request';
  fileName: string;
  fileContent: string;
  position: number;
  requestId: string;
};

export type AutocompleteResponse = {
  event: 'post-completions';
  completions: any;
  requestId: string;
};
