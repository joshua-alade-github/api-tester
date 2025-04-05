import { ApiRequestModel } from './api-request.model';

export interface SavedRequestModel {
  id?: string;
  userId?: string;
  name: string;
  description?: string;
  created?: Date;
  request: ApiRequestModel;
}