import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Profile } from './profile';
import { UserService } from '../Shared/Custom-Services/user-service';
import { AuthService } from '../Shared/Custom-Services/auth-state';
import { ToastrService } from 'ngx-toastr';
import { of, throwError } from 'rxjs';
import { provideZonelessChangeDetection } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

describe('Profile', () => {
  let component: Profile;
  let fixture: ComponentFixture<Profile>;

  let userServiceSpy: jasmine.SpyObj<UserService>;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let toasterSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {
    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getUserById',
      'updateUserProfile',
      'updateAddress'
    ]);
    authServiceSpy = jasmine.createSpyObj('AuthService', ['userId']);
    toasterSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    await TestBed.configureTestingModule({
  imports: [Profile],
  providers: [
    provideZonelessChangeDetection(),
    { provide: UserService, useValue: userServiceSpy },
    { provide: AuthService, useValue: authServiceSpy },
    { provide: ToastrService, useValue: toasterSpy },
    { 
      provide: ActivatedRoute, 
      useValue: { 
        params: of({ id: 1 }),
        snapshot: { paramMap: { get: () => '1' } }
      } 
    },
  ]
}).compileComponents();
    fixture = TestBed.createComponent(Profile);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should load user if userId exists', () => {
      authServiceSpy.userId.and.returnValue(1);
      const userData = { name: 'Test User', address: {}, dateOfBirth: '2023-01-01', dateJoined: '2023-01-01' };
      userServiceSpy.getUserById.and.returnValue(of(userData));

      component.ngOnInit();

      expect(component.userId).toBe(1);
      expect(component.user).toEqual({
        ...userData,
        dateOfBirth: '2023-01-01',
        dateJoined: '2023-01-01',
        address: {}
      });
    });

    it('should log error if userId missing', () => {
      authServiceSpy.userId.and.returnValue(null);
      spyOn(console, 'error');

      component.ngOnInit();

      expect(component.userId).toBeNull();
      expect(console.error).toHaveBeenCalledWith('User ID not found');
    });
  });

  describe('loadUser', () => {
    it('should not call service if userId is null', () => {
      component.userId = null;
      component.loadUser();
      expect(userServiceSpy.getUserById).not.toHaveBeenCalled();
    });

    it('should handle successful user load', () => {
      component.userId = 1;
      const response = { name: 'Alice', address: { doorNumber: '1' }, dateOfBirth: '2023-01-01', dateJoined: '2023-01-01' };
      userServiceSpy.getUserById.and.returnValue(of(response));

      component.loadUser();

      expect(component.user.name).toBe('Alice');
      expect(component.originalUser.name).toBe('Alice');
      expect(component.originalAddress.doorNumber).toBe('1');
    });

    it('should handle error in user load', () => {
      component.userId = 1;
      spyOn(console, 'error');
      userServiceSpy.getUserById.and.returnValue(throwError('error'));

      component.loadUser();

      expect(console.error).toHaveBeenCalledWith('Failed to load user', 'error');
    });
  });

  describe('toggleEdit', () => {
    it('should enable edit mode', () => {
      component.isEditing = false;
      component.toggleEdit();
      expect(component.isEditing).toBeTrue();
    });

    it('should reset user if toggled off', () => {
      component.isEditing = true;
      component.originalUser = { name: 'Original' };
      component.user = { name: 'Changed' };
      component.toggleEdit();
      expect(component.isEditing).toBeFalse();
      expect(component.user.name).toBe('Original');
    });
  });

  describe('saveProfile', () => {
    it('should show error if userId missing', () => {
      component.userId = null;
      component.saveProfile();
      expect(toasterSpy.error).toHaveBeenCalledWith('User ID missing');
    });

    it('should save profile successfully', () => {
      component.userId = 1;
      component.user = { occupation: 'Dev', phone: '123', maritalStatus: 'Single' };
      // Fix: return string instead of object
      userServiceSpy.updateUserProfile.and.returnValue(of('Profile updated successfully'));

      component.saveProfile();

      expect(toasterSpy.success).toHaveBeenCalledWith('Profile updated successfully');
      expect(component.isEditing).toBeFalse();
      expect(component.originalUser.occupation).toBe('Dev');
    });

    it('should handle error on profile save', () => {
      component.userId = 1;
      component.user = { occupation: 'Dev' };
      spyOn(console, 'error');
      userServiceSpy.updateUserProfile.and.returnValue(throwError('error'));

      component.saveProfile();

      expect(toasterSpy.error).toHaveBeenCalledWith('Update failed');
      expect(console.error).toHaveBeenCalledWith('error');
    });
  });

  describe('toggleAddressEdit', () => {
    it('should enable address editing', () => {
      component.isAddressEditing = false;
      component.user.address = { doorNumber: '1' };
      component.toggleAddressEdit();
      expect(component.isAddressEditing).toBeTrue();
      expect(component.originalAddress.doorNumber).toBe('1');
    });

    it('should cancel address editing', () => {
      component.isAddressEditing = true;
      component.originalAddress = { doorNumber: 'Original' };
      component.user.address = { doorNumber: 'Changed' };
      component.toggleAddressEdit();
      expect(component.isAddressEditing).toBeFalse();
      expect(component.user.address.doorNumber).toBe('Original');
    });
  });

  describe('saveAddress', () => {
    it('should show error if userId missing', () => {
      component.userId = null;
      component.saveAddress();
      expect(toasterSpy.error).toHaveBeenCalledWith('User ID missing');
    });

    it('should save address successfully', () => {
      component.userId = 1;
      component.user.address = {
        doorNumber: '123',
        landMark: 'LM',
        street: 'St',
        pinCode: '10001',
        city: 'City',
        district: 'D',
        state: 'S',
        country: 'C'
      };
      // Fix: return string instead of object
      userServiceSpy.updateAddress.and.returnValue(of('Address updated successfully'));

      component.saveAddress();

      expect(toasterSpy.success).toHaveBeenCalledWith('Address updated successfully');
      expect(component.isAddressEditing).toBeFalse();
      expect(component.originalAddress.doorNumber).toBe('123');
    });

    it('should handle error on address save', () => {
      component.userId = 1;
      component.user.address = { doorNumber: '123' };
      spyOn(console, 'error');
      userServiceSpy.updateAddress.and.returnValue(throwError('error'));

      component.saveAddress();

      expect(toasterSpy.error).toHaveBeenCalledWith('Address update failed');
      expect(console.error).toHaveBeenCalledWith('error');
    });
  });
});