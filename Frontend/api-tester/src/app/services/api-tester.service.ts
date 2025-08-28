import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { ApiRequestModel } from '../models/api-request.model';
import { ApiResponseModel } from '../models/api-response.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiTesterService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { 
    console.log('API URL:', this.apiUrl);
  }

  sendRequest(request: ApiRequestModel): Observable<ApiResponseModel> {
    return this.http.post<ApiResponseModel>(`${this.apiUrl}/ApiTester/SendRequest`, request)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}