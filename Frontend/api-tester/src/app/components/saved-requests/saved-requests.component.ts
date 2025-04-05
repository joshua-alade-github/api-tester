import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SavedRequestsService } from '../../services/saved-requests.service';
import { NotificationService } from '../../services/notification.service';
import { SavedRequestModel } from '../../models/saved-request.model';
import { ApiRequestModel } from '../../models/api-request.model';

@Component({
  selector: 'app-saved-requests',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './saved-requests.component.html',
  styleUrls: ['./saved-requests.component.scss']
})
export class SavedRequestsComponent implements OnInit {
  @Output() loadRequest = new EventEmitter<ApiRequestModel>();
  
  savedRequests: SavedRequestModel[] = [];
  isLoading = false;
  
  constructor(
    private savedRequestsService: SavedRequestsService,
    private notificationService: NotificationService
  ) {}
  
  ngOnInit(): void {
    this.loadSavedRequests();
  }
  
  loadSavedRequests(): void {
    this.isLoading = true;
    this.savedRequestsService.getSavedRequests().subscribe({
      next: (requests) => {
        this.savedRequests = requests;
        this.isLoading = false;
      },
      error: (error) => {
        this.notificationService.error('Failed to load saved requests');
        this.isLoading = false;
      }
    });
  }
  
  onLoadRequest(request: SavedRequestModel): void {
    this.loadRequest.emit(request.request);
    this.notificationService.success('Request loaded');
  }
  
  onDeleteRequest(id: string | undefined): void {
    if (!id) {
      this.notificationService.error('Request ID is missing');
      return;
    }
    
    if (confirm('Are you sure you want to delete this saved request?')) {
      this.savedRequestsService.deleteSavedRequest(id).subscribe({
        next: () => {
          this.notificationService.success('Request deleted');
          this.loadSavedRequests();
        },
        error: () => {
          this.notificationService.error('Failed to delete request');
        }
      });
    }
  }
}