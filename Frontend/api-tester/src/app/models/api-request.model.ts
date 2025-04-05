export interface ApiRequestModel {
    url: string;
    method: string;
    headers: { [key: string]: string };
    requestBody: string;
    contentType: string;
    timeoutSeconds: number;
    authType: string;
    username?: string;
    password?: string;
    bearerToken?: string;
    apiKeyName?: string;
    apiKeyValue?: string;
    cronExpression?: string;
  }