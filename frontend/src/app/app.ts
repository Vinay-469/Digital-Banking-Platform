import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet, NavigationEnd } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { faBell } from '@fortawesome/free-solid-svg-icons';
import { UserService } from './Shared/Custom-Services/user-service';
import { AuthService } from './Shared/Custom-Services/auth-state';
import { Keepalive, NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { Idle, DEFAULT_INTERRUPTSOURCES } from '@ng-idle/core';
import { FormsModule } from '@angular/forms';
import { NgOtpInputConfig } from 'ng-otp-input';
import { Chat } from "./chatbot/chatbot";
import { filter } from 'rxjs/operators';
import { Loader } from './Shared/loader';
import { NgHttpLoaderModule, Spinkit } from 'ng-http-loader';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterModule,
    CommonModule, FormsModule,
    MatIconModule,
    MatBadgeModule,
    MatButtonModule,
    NgIdleKeepaliveModule,
    Chat,
    NgHttpLoaderModule
  ],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  spinKit = Spinkit;
  userName: string | null | undefined;
  faBellIcon = faBell;
  unreadCount = 0;
  panelNotifications: any[] = [];
  notifications: any[] = [];
  showNotifications = false;
  isNew = false;
  showBlurCard = false;
  isOpen = false;
  userRole: string | null = null;
  showChatbot: boolean = false;
  showNotificationScrolling: boolean = false;
  scrolling = '';

  otpConfig: NgOtpInputConfig = {
    length: 4,
    allowNumbersOnly: true,
    inputStyles: {
      width: '55px',
      height: '55px',
      'font-size': '22px',
      'border-radius': '10px',
      border: '2px solid #d1d5db',
      margin: '12px',
      'text-align': 'center',
      'font-weight': '600',
      'background-color': '#f9fafb',
      outline: '1px solid #d1d5db'
    }
  };

  constructor(
    private user: UserService,
    private router: Router,
    private authState: AuthService,
    private idle: Idle,
    private keepalive: Keepalive,
    public loader: Loader
  ) {

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkLoginStatus();
        const url = event.urlAfterRedirects;
        const allowedRoutes = [
          '/home',
          '/expenseTracker'
        ];
        this.showNotificationScrolling = url.includes(allowedRoutes[0])
        this.showChatbot = allowedRoutes.some(route => url.includes(route));
      });
  }

  ngOnInit(): void {
    this.checkLoginStatus();
    this.loadNotifications();
    this.idle.setIdle(500);
    this.idle.setTimeout(5);
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);

    this.idle.onTimeout.subscribe(() => {
      this.showBlurCard = true;
    });

    if (localStorage.getItem('token')) {
      this.startIdleTimer();
    }

    this.userRole = this.authState.role();
  }

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    this.showNotifications = false;
  }

  toggleNotifications(event: Event) {
    event.stopPropagation();
    this.showNotifications = !this.showNotifications;
    this.isOpen = false;
  }

  selectItem(item: string) {
    if (item === 'Home') {
      this.router.navigate(['/home']);
    }
    else if (item === 'Change password') {
      this.router.navigate(['/reset']);
    }
    else if (item === 'Profile') {
      this.router.navigate(['/profile']);
    }
    else if (item === 'Logout') {
      this.logout();
    }
  }

  @HostListener('document:click')
  closeDropdown() {
    this.isOpen = false;
    this.showNotifications = false;
  }

  startIdleTimer() {
    this.showBlurCard = false;
    this.idle.watch();
  }

  stopIdleTimer() {
    this.idle.stop();
  }

  loadNotifications() {
    const userId = this.authState.userId();

    if (!userId) {
      console.warn("No valid userId found.");
      return;
    }

    this.user.getNotificationsByUserId(userId).subscribe({
      next: (res: any[]) => {
        this.notifications = res.filter(n => n.isRead == 0) || [];
        this.panelNotifications = this.notifications.slice(0, 3);
        this.unreadCount = this.notifications.filter(n => !n.isRead).length;
        this.scrolling += this.panelNotifications[0].message;
      },
      error: () => {
        console.log("Error loading notifications");
      }
    });
  }

  markNotificationsAsRead(notificationId: number) {
    if (!notificationId || notificationId <= 0) {
      console.warn("notificationId missing.");
      return;
    }

    this.user.markAsRead(notificationId).subscribe({
      next: () => {
        this.unreadCount -= 1;
        this.loadNotifications();
      },
      error: (err) => {
        console.error("Error updating read status:", err);
      }
    });
  }

  checkLoginStatus() {
    this.isNew = sessionStorage.getItem("userToken") === null;
    this.userName = this.authState.userName()?.split(' ').slice(0, 2).join(' ');
  }

  logout() {
    this.showBlurCard = false;
    sessionStorage.clear();
    this.router.navigate(['/login']);
    this.checkLoginStatus();
    this.authState.removeToken();
  }
  viewAllNotifications() {
    this.router.navigate(['/notifications']);
    this.showNotifications = false;
  }
  get isHomePage() {
    if (this.router.url === '/home' || '')
      return true
    else return false;
  }
}