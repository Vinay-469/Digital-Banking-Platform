import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router, NavigationEnd } from '@angular/router';
import { of, throwError, Subject } from 'rxjs';

import { App } from './app';
import { UserService } from './Shared/Custom-Services/user-service';
import { AuthService } from './Shared/Custom-Services/auth-state';
import { Idle } from '@ng-idle/core';
import { Keepalive } from '@ng-idle/keepalive';

describe('App', () => {

  let component: App;
  let fixture: ComponentFixture<App>;

  let userSpy: jasmine.SpyObj<UserService>;
  let authSpy: jasmine.SpyObj<AuthService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let idleSpy: jasmine.SpyObj<Idle>;
  let keepAliveSpy: jasmine.SpyObj<Keepalive>;
  let idleTimeout$: Subject<number>;
  let routerEvents$: Subject<any>;

  beforeEach(async () => {

    idleTimeout$ = new Subject<number>();

    idleSpy = jasmine.createSpyObj(
      'Idle',
      ['setIdle', 'setTimeout', 'setInterrupts', 'watch', 'stop'],
      { onTimeout: idleTimeout$ }
    );

    routerEvents$ = new Subject();

    userSpy = jasmine.createSpyObj('UserService', [
      'getNotificationsByUserId',
      'markAsRead'
    ]);

    authSpy = jasmine.createSpyObj('AuthService', [
      'userId',
      'userName'
    ]);

    routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
      events: routerEvents$
    });

    idleSpy = jasmine.createSpyObj(
      'Idle',
      ['setIdle', 'setTimeout', 'setInterrupts', 'watch', 'stop'],
      { onTimeout: new Subject() }
    );

    keepAliveSpy = jasmine.createSpyObj('Keepalive', ['ping']);

    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserService, useValue: userSpy },
        { provide: AuthService, useValue: authSpy },
        { provide: Router, useValue: routerSpy },
        { provide: Idle, useValue: idleSpy },
        { provide: Keepalive, useValue: keepAliveSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(App);
    component = fixture.componentInstance;
  });

  it('should create the app', () => {
    expect(component).toBeTruthy();
  });

  it('constructor should subscribe to router events', () => {

    spyOn(component, 'checkLoginStatus');

    routerEvents$.next(new NavigationEnd(1, '/home', '/home'));

    expect(component.checkLoginStatus).toHaveBeenCalled();
  });

  it('ngOnInit should initialize idle timer and notifications', () => {

    authSpy.userId.and.returnValue(1);
    authSpy.userName.and.returnValue('John Doe');

    userSpy.getNotificationsByUserId.and.returnValue(of([]));

    spyOn(localStorage, 'getItem').and.returnValue('token');

    spyOn(component, 'startIdleTimer'); // prevents Zone error

    component.ngOnInit();

    expect(userSpy.getNotificationsByUserId).toHaveBeenCalledWith(1);
    expect(idleSpy.setIdle).toHaveBeenCalledWith(500);
    expect(idleSpy.setTimeout).toHaveBeenCalledWith(5);
    expect(component.startIdleTimer).toHaveBeenCalled();
  });

  it('toggleDropdown should toggle dropdown', () => {

    const event = new Event('click');
    spyOn(event, 'stopPropagation');

    component.toggleDropdown(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.isOpen).toBeTrue();
  });

  it('toggleNotifications should toggle notifications', () => {

    const event = new Event('click');
    spyOn(event, 'stopPropagation');

    component.toggleNotifications(event);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.showNotifications).toBeTrue();
  });

  it('selectItem should navigate to Home', () => {

    component.selectItem('Home');

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
  });

  it('selectItem should navigate to reset', () => {

    component.selectItem('Change password');

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/reset']);
  });

  it('selectItem should navigate to profile', () => {

    component.selectItem('Profile');

    expect(routerSpy.navigate).toHaveBeenCalledWith(['/profile']);
  });

  it('selectItem should logout', () => {

    spyOn(component, 'logout');

    component.selectItem('Logout');

    expect(component.logout).toHaveBeenCalled();
  });

  it('closeDropdown should close menus', () => {

    component.isOpen = true;
    component.showNotifications = true;

    component.closeDropdown();

    expect(component.isOpen).toBeFalse();
    expect(component.showNotifications).toBeFalse();
  });

  it('startIdleTimer should watch idle', () => {

    component.startIdleTimer();

    expect(component.showBlurCard).toBeFalse();
    expect(idleSpy.watch).toHaveBeenCalled();
  });

  it('stopIdleTimer should stop idle', () => {

    component.stopIdleTimer();

    expect(idleSpy.stop).toHaveBeenCalled();
  });

  it('loadNotifications should return when userId missing', () => {

    authSpy.userId.and.returnValue(null);

    component.loadNotifications();

    expect(userSpy.getNotificationsByUserId).not.toHaveBeenCalled();
  });

  it('loadNotifications should load notifications', () => {

    const notifications = [
      { id: 1, isRead: false },
      { id: 2, isRead: true }
    ];

    authSpy.userId.and.returnValue(1);
    userSpy.getNotificationsByUserId.and.returnValue(of(notifications));

    component.loadNotifications();

    expect(component.notifications.length).toBe(2);
    expect(component.unreadCount).toBe(1);
  });

  it('loadNotifications should handle error', () => {

    authSpy.userId.and.returnValue(1);

    userSpy.getNotificationsByUserId.and.returnValue(
      throwError(() => new Error())
    );

    component.loadNotifications();

    expect(userSpy.getNotificationsByUserId).toHaveBeenCalled();
  });

  it('markNotificationsAsRead should return if invalid id', () => {

    component.markNotificationsAsRead(0);

    expect(userSpy.markAsRead).not.toHaveBeenCalled();
  });

  it('markNotificationsAsRead should update notifications', () => {

    userSpy.markAsRead.and.returnValue(of({}));

    spyOn(component, 'loadNotifications');

    component.unreadCount = 2;

    component.markNotificationsAsRead(1);

    expect(component.unreadCount).toBe(1);
    expect(component.loadNotifications).toHaveBeenCalled();
  });

  it('markNotificationsAsRead should handle error', () => {

    userSpy.markAsRead.and.returnValue(
      throwError(() => new Error())
    );

    component.markNotificationsAsRead(1);

    expect(userSpy.markAsRead).toHaveBeenCalled();
  });

  it('checkLoginStatus should set username and isNew', () => {

    spyOn(sessionStorage, 'getItem').and.returnValue(null);

    authSpy.userName.and.returnValue('John Doe Smith');

    component.checkLoginStatus();

    expect(component.isNew).toBeTrue();
    expect(component.userName).toBe('John Doe');
  });

  it('logout should clear session and navigate', () => {

    spyOn(sessionStorage, 'clear');

    component.logout();

    expect(sessionStorage.clear).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should set showBlurCard to true when idle timeout occurs', () => {

  component.startIdleTimer(); 
  idleTimeout$.next(1);        
  expect(component.showBlurCard).toBeTrue();

});
});