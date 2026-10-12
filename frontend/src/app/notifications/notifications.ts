import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../Shared/Custom-Services/user-service';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { App } from '../app';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss'
})
export class Notifications implements OnInit {

  notifications: any[] = [];
  filteredNotifications: any[] = [];

  // -1 = All, 0 = Unread, 1 = Read
  filter: number = -1;

  userId: number | null = null;

  constructor(
    private userService: UserService,
    private authState: AuthService,
    private appService:App
  ) {}

  ngOnInit(): void {
    this.userId = this.authState.userId();
    this.loadNotifications();
  }

  //  Load notifications from backend
  loadNotifications() {
    if (!this.userId) return;

    this.userService.getNotificationsByUserId(this.userId).subscribe({
      next: (res: any[]) => {
        this.notifications = res|| [];
        this.filter=1;
        this.applyFilter();
      },
      error: () => {
        console.error('Failed to load notifications');
      }
    });
  }

  //  Change filter (-1, 0, 1)
  setFilter(value: number) {
    this.filter = value;
    this.applyFilter();
  }

  //  Apply filter logic
  applyFilter() {
    if (this.filter === -1) {
      this.filteredNotifications = this.notifications;
    } 
    else if (this.filter === 1) {
      this.filteredNotifications = this.notifications.filter(n => n.isRead === true);
    } 
    else if (this.filter === 0) {
      this.filteredNotifications = this.notifications.filter(n => n.isRead === false);
    }
  }

  //  Mark single notification as read
  markAsRead(notification: any) {
    if (!notification || notification.isRead) return;

    this.userService.markAsRead(notification.notificationId).subscribe({
      next: () => {
        notification.isRead = true;
        this.applyFilter();
        this.appService.markNotificationsAsRead(notification.notificationId)
      },
      error: () => {
        console.error('Error marking notification as read');
      }
    });
  }

  //  Mark all as read (frontend + optional backend call)
  markAllAsRead() {
    const unread = this.notifications.filter(n => !n.isRead);

    unread.forEach(n => {
      this.userService.markAsRead(n.notificationId).subscribe();
      n.isRead = true;
    });

    this.applyFilter();
  }

  //  Helper counts (for UI badges)
  get unreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  get readCount(): number {
    return this.notifications.filter(n => n.isRead).length;
  }

}