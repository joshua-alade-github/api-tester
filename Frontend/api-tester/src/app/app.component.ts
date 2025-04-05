import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter } from 'rxjs/operators';
import { ApiRequestComponent } from './components/api-request/api-request.component';
import { ResponseViewerComponent } from './components/response-viewer/response-viewer.component';
import { SavedRequestsComponent } from './components/saved-requests/saved-requests.component';
import { ApiResponseModel } from './models/api-response.model';
import { ApiRequestModel } from './models/api-request.model';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ApiRequestComponent,
    ResponseViewerComponent,
    SavedRequestsComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild(ApiRequestComponent) apiRequestComponent!: ApiRequestComponent;
  
  title = 'API Tester';
  activeTab = 'tester';
  apiResponse: ApiResponseModel | null = null;
  isLoggedIn = false;
  username = '';
  currentYear = new Date().getFullYear();

  constructor(
    public router: Router,
    private authService: AuthService
  ) {
    this.authService.currentUser$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.username = user?.username || '';
    });
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {

      if (this.router.url === '/tester' || this.router.url === '/') {
        this.activeTab = 'tester';
      }
    });
  }

  setActiveTab(tab: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.activeTab = tab;
  }

  handleResponse(response: ApiResponseModel): void {
    this.apiResponse = response;
  }

  loadRequest(request: ApiRequestModel): void {
    this.activeTab = 'tester';
    setTimeout(() => {
      if (this.apiRequestComponent) {
        this.apiRequestComponent.loadSavedRequest(request);
      }
    });
  }

  logout(event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.authService.logout();
  }
}