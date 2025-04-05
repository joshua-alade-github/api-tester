import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiRequestModel } from '../models/api-request.model';
import { ApiResponseModel } from '../models/api-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiTesterService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  sendRequest(request: ApiRequestModel): Observable<ApiResponseModel> {
    return this.http.post<ApiResponseModel>(`${this.apiUrl}/ApiTester/SendRequest`, request);
  }
}