export interface ApiResponseModel {
    statusCode: number;
    headers: { [key: string]: string };
    contentType: string;
    body: string;
    formattedBody: string;
    isValidJson: boolean;
    responseTimeMs: number;
    error?: string;
  }