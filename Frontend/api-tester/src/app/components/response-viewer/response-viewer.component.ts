import { AfterViewChecked, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ApiResponseModel } from '../../models/api-response.model';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-response-viewer',
  templateUrl: './response-viewer.component.html',
  styleUrls: ['./response-viewer.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NgbModule
  ]
})
export class ResponseViewerComponent implements AfterViewChecked {
  @Input() response: ApiResponseModel | null = null;
  
  activeTab = 'response';

  constructor(private notificationService: NotificationService) { }

  ngAfterViewChecked() {
    // @ts-ignore: Accessing global hljs
    if (window.hljs && this.response?.isValidJson) {
      // @ts-ignore: Accessing global hljs
      document.querySelectorAll('pre code').forEach((block) => {
        // @ts-ignore: Accessing global hljs
        hljs.highlightElement(block);
      });
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  copyToClipboard(): void {
    if (!this.response) return;
    
    const textToCopy = this.response.isValidJson 
      ? (this.response.formattedBody || '') 
      : (this.response.body || '');
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        this.notificationService.success('Response copied to clipboard');
      })
      .catch(err => {
        this.notificationService.error('Failed to copy: ' + err);
      });
  }

  getStatusClass(): string {
    const statusCode = this.response?.statusCode ?? 0;
    if (statusCode >= 200 && statusCode < 300) {
      return 'badge-success';
    } else if (statusCode >= 400) {
      return 'badge-danger';
    } else {
      return 'badge-warning';
    }
  }

  getStatusText(): string {
    const statusCode = this.response?.statusCode ?? 0;
    switch (statusCode) {
      case 200: return 'OK (200)';
      case 201: return 'Created (201)';
      case 204: return 'No Content (204)';
      case 400: return 'Bad Request (400)';
      case 401: return 'Unauthorized (401)';
      case 403: return 'Forbidden (403)';
      case 404: return 'Not Found (404)';
      case 500: return 'Internal Server Error (500)';
      case 502: return 'Bad Gateway (502)';
      case 503: return 'Service Unavailable (503)';
      default: return '';
    }
  }
}