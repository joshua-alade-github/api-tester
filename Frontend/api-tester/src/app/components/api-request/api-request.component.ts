import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ApiTesterService } from '../../services/api-tester.service';
import { NotificationService } from '../../services/notification.service';
import { ApiRequestModel } from '../../models/api-request.model';
import { ApiResponseModel } from '../../models/api-response.model';
import { SavedRequestsService } from '../../services/saved-requests.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-api-request',
  templateUrl: './api-request.component.html',
  styleUrls: ['./api-request.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule
  ]
})
export class ApiRequestComponent implements OnInit {
  @Output() responseSent = new EventEmitter<ApiResponseModel>();
  
  requestForm!: FormGroup;
  httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  contentTypes = [
    'application/json',
    'application/xml',
    'application/x-www-form-urlencoded',
    'multipart/form-data',
    'text/plain'
  ];
  authTypes = ['None', 'Basic', 'Bearer', 'ApiKey'];
  isLoading = false;
  activeTab = 'request';
  showSaveForm = false;
  requestName = '';
  requestDescription = '';
  isAuthenticated = false;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiTesterService,
    private savedRequestsService: SavedRequestsService,
    private authService: AuthService,
    private notificationService: NotificationService
  ) { }

  ngOnInit(): void {
    this.initForm();
    this.isAuthenticated = this.authService.isLoggedIn;
    this.authService.currentUser$.subscribe(user => {
      this.isAuthenticated = !!user;
    });
  }

  setActiveTab(tab: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.activeTab = tab;
  }

  toggleSaveForm(): void {
    if (!this.isAuthenticated) {
      this.notificationService.error('Please log in to save requests');
      return;
    }
    this.showSaveForm = !this.showSaveForm;
  }

  saveRequest(): void {
    if (!this.requestName) {
      this.notificationService.error('Request name is required');
      return;
    }

    const request = this.prepareRequestModel();
    this.savedRequestsService.saveRequest(this.requestName, this.requestDescription, request).subscribe({
      next: () => {
        this.notificationService.success('Request saved successfully');
        this.showSaveForm = false;
        this.requestName = '';
        this.requestDescription = '';
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.notificationService.error('Error sending request: ' + error.message);
      }
    });
  }

  loadSavedRequest(request: ApiRequestModel): void {
    this.requestForm.patchValue({
      url: request.url,
      method: request.method,
      contentType: request.contentType,
      requestBody: request.requestBody,
      timeoutSeconds: request.timeoutSeconds,
      authType: request.authType || 'None'
    });

    this.headersArray.clear();
    if (request.headers && Object.keys(request.headers).length) {
      Object.entries(request.headers).forEach(([key, value]) => {
        this.headersArray.push(this.fb.group({
          key: [key],
          value: [value]
        }));
      });
    } else {
      this.addHeader();
    }

    if (request.authType === 'Basic') {
      this.requestForm.get('basicAuth')?.patchValue({
        username: request.username,
        password: request.password
      });
    } else if (request.authType === 'Bearer') {
      this.requestForm.get('bearerAuth')?.patchValue({
        token: request.bearerToken
      });
    } else if (request.authType === 'ApiKey') {
      this.requestForm.get('apiKeyAuth')?.patchValue({
        name: request.apiKeyName,
        value: request.apiKeyValue
      });
    }

    const methodControl = this.requestForm?.get('method');
    if (methodControl) {
      methodControl.updateValueAndValidity();
    }

    this.setActiveTab('request');
  }

  initForm(): void {
    this.requestForm = this.fb.group({
      url: ['', [Validators.required]],
      method: ['GET', Validators.required],
      contentType: ['application/json'],
      requestBody: [''],
      timeoutSeconds: [30, [Validators.required, Validators.min(1), Validators.max(300)]],
      headers: this.fb.array([]),
      authType: ['None'],
      basicAuth: this.fb.group({
        username: [''],
        password: ['']
      }),
      bearerAuth: this.fb.group({
        token: ['']
      }),
      apiKeyAuth: this.fb.group({
        name: [''],
        value: ['']
      })
    });

    this.addHeader();

    const methodControl = this.requestForm?.get('method');
    if (methodControl) {
      methodControl.valueChanges.subscribe(method => {
        const bodyControl = this.requestForm?.get('requestBody');
        if (bodyControl) {
          if (method === 'GET' || method === 'DELETE' || method === 'HEAD') {
            bodyControl.disable();
          } else {
            bodyControl.enable();
          }
        }
      });
      
      methodControl.updateValueAndValidity();
    }
  }

  get headersArray(): FormArray {
    return this.requestForm.get('headers') as FormArray;
  }

  addHeader(): void {
    this.headersArray.push(
      this.fb.group({
        key: [''],
        value: ['']
      })
    );
  }

  removeHeader(index: number): void {
    this.headersArray.removeAt(index);
  }

  onAuthTypeChange(event: any): void {
    const authType = event.target.value;
    this.requestForm.patchValue({ authType });
  }

  formatJson(): void {
    try {
      const bodyControl = this.requestForm?.get('requestBody');
      const body = bodyControl?.value;
      if (!body) return;
      
      const formatted = JSON.stringify(JSON.parse(body), null, 2);
      this.requestForm?.patchValue({ requestBody: formatted });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      this.notificationService.error('Invalid JSON: ' + errorMessage);
    }
  }

  sendRequest(): void {
    if (this.requestForm.invalid) {
      this.markFormGroupTouched(this.requestForm);
      this.notificationService.error('Please fix the errors in the form before submitting.');
      return;
    }

    this.isLoading = true;
    const request = this.prepareRequestModel();

    this.apiService.sendRequest(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.responseSent.emit(response);
      },
      error: (error) => {
        this.isLoading = false;
        this.notificationService.error('Error sending request: ' + error.message);
      }
    });
  }

  resetForm(): void {
    this.requestForm.reset({
      method: 'GET',
      contentType: 'application/json',
      timeoutSeconds: 30,
      authType: 'None'
    });
    
    this.headersArray.clear();
    this.addHeader();
    
    const methodControl = this.requestForm?.get('method');
    if (methodControl) {
      methodControl.updateValueAndValidity();
    }
  }

  private prepareRequestModel(): ApiRequestModel {
    const formValue = this.requestForm.value;
    
    const headers: {[key: string]: string} = {};
    formValue.headers.forEach((header: {key: string, value: string}) => {
      if (header.key && header.value) {
        headers[header.key] = header.value;
      }
    });

    let authType = formValue.authType;
    let username = null;
    let password = null;
    let bearerToken = null;
    let apiKeyName = null;
    let apiKeyValue = null;

    if (authType === 'Basic') {
      username = formValue.basicAuth.username;
      password = formValue.basicAuth.password;
    } else if (authType === 'Bearer') {
      bearerToken = formValue.bearerAuth.token;
    } else if (authType === 'ApiKey') {
      apiKeyName = formValue.apiKeyAuth.name;
      apiKeyValue = formValue.apiKeyAuth.value;
    } else {
      authType = '';
    }

    return {
      url: formValue.url,
      method: formValue.method,
      headers: headers,
      requestBody: formValue.requestBody,
      contentType: formValue.contentType,
      timeoutSeconds: formValue.timeoutSeconds,
      authType: authType,
      username: username,
      password: password,
      bearerToken: bearerToken,
      apiKeyName: apiKeyName,
      apiKeyValue: apiKeyValue
    };
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
}