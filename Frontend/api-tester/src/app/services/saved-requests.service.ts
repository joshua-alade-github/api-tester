import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { SavedRequestModel } from '../models/saved-request.model';
import { ApiRequestModel } from '../models/api-request.model';

@Injectable({
  providedIn: 'root'
})
export class SavedRequestsService {
  constructor(private http: HttpClient) {}
  
  getSavedRequests(): Observable<SavedRequestModel[]> {
    return this.http.get<SavedRequestModel[]>(`${environment.apiUrl}/SavedRequests`);
  }
  
  saveRequest(name: string, description: string, request: ApiRequestModel): Observable<SavedRequestModel> {
    const model: SavedRequestModel = {
      name,
      description,
      request
    };
    return this.http.post<SavedRequestModel>(`${environment.apiUrl}/SavedRequests`, model);
  }
  
  getSavedRequest(id: string): Observable<SavedRequestModel> {
    return this.http.get<SavedRequestModel>(`${environment.apiUrl}/SavedRequests/${id}`);
  }
  
  deleteSavedRequest(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/SavedRequests/${id}`);
  }
}