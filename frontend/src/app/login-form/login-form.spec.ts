import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginForm } from './login-form';
import { UserService } from '../Shared/Custom-Services/user-service';
import { ToastrService } from 'ngx-toastr';
import { App } from '../app';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { of, throwError } from 'rxjs';
import { ChangeDetectorRef, provideZonelessChangeDetection } from '@angular/core';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

describe('LoginForm', () => {
  let component: LoginForm;
  let fixture: ComponentFixture<LoginForm>;

  let serviceSpy: jasmine.SpyObj<UserService>;
  let toasterSpy: jasmine.SpyObj<ToastrService>;
  let authStateSpy: jasmine.SpyObj<AuthService>;
  let appSpy: jasmine.SpyObj<App>;
  let cdSpy: jasmine.SpyObj<ChangeDetectorRef>;
  let router: Router;

  beforeEach(async () => {
    serviceSpy = jasmine.createSpyObj('UserService', ['login']);
    toasterSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);
    authStateSpy = jasmine.createSpyObj('AuthService', ['setAuthData']);
    appSpy = jasmine.createSpyObj('App', ['startIdleTimer']);
    cdSpy = jasmine.createSpyObj('ChangeDetectorRef', ['detectChanges']);

    await TestBed.configureTestingModule({
      imports: [
        LoginForm,
        RouterTestingModule 
      ],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserService, useValue: serviceSpy },
        { provide: ToastrService, useValue: toasterSpy },
        { provide: AuthService, useValue: authStateSpy },
        { provide: App, useValue: appSpy },
        { provide: ChangeDetectorRef, useValue: cdSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginForm);
    component = fixture.componentInstance;
    router = TestBed.inject(Router); 
    spyOn(router, 'navigate');      

    fixture.detectChanges();
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should show error if username and password are empty', () => {
    component.username = '';
    component.password = '';
    component.Submit();
    expect(toasterSpy.error).toHaveBeenCalledWith('Enter some inputs');
  });

  it('should show error if username and password are invalid', () => {
    component.username = 'abc';
    component.password = '123';
    component.Submit();
    expect(toasterSpy.error).toHaveBeenCalledWith('enter appropriate inputs');
  });

  it('should show error if username invalid', () => {
    component.username = 'abc';
    component.password = 'Password1!';
    component.Submit();
    expect(toasterSpy.error).toHaveBeenCalledWith('enter appropriate username');
  });

  it('should show error if password invalid', () => {
    component.username = 'Valid Name';
    component.password = '123';
    component.Submit();
    expect(toasterSpy.error).toHaveBeenCalledWith('enter appropriate password');
  });

  it('should login successfully and navigate home', () => {
    component.username = 'Valid Name';
    component.password = 'Password1!';
    serviceSpy.login.and.returnValue(of({
      status: true,
      token: 'fake-token',
      userDetails: { id: 1, name: 'Test User' }
    }));

    component.Submit();

    expect(component.Show).toBeFalse();
    expect(authStateSpy.setAuthData).toHaveBeenCalledWith({
      status: true,
      token: 'fake-token',
      userDetails: { id: 1, name: 'Test User' }
    });
    expect(appSpy.startIdleTimer).toHaveBeenCalled();
    expect(toasterSpy.success).toHaveBeenCalledWith('Login Successful', 'Hurray!');
    expect(router.navigate).toHaveBeenCalledWith(['home']); 
  });

  it('should handle failed login and navigate to login page', () => {
    component.username = 'Valid Name';
    component.password = 'Password1!';
    serviceSpy.login.and.returnValue(of({
      status: false,
      token: '',
      userDetails: null
    }));

    component.Submit();

    expect(component.Show).toBeTrue();
    expect(toasterSpy.error).toHaveBeenCalledWith('Login Failed');
    expect(router.navigate).toHaveBeenCalledWith(['login']); 
  });

  it('should handle login API error', () => {
    component.username = 'Valid Name';
    component.password = 'Password1!';
    serviceSpy.login.and.returnValue(throwError({ message: 'Server error' }));
    spyOn(window, 'alert');

    component.Submit();

    expect(window.alert).toHaveBeenCalledWith('Login failed due to server error');
    expect(component.Show).toBeTrue();
  });

  it('clickEvent toggles hide signal', () => {
    const event = new MouseEvent('click');
    component.hide.set(true);
    component.clickEvent(event);
    expect(component.hide()).toBeFalse();
  });
});