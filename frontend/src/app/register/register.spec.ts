import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Register } from './register';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../Shared/Custom-Services/user-service';
import { provideZonelessChangeDetection } from '@angular/core';

describe('Register Component', () => {

  let component: Register;
  let fixture: ComponentFixture<Register>;
  let userServiceSpy: jasmine.SpyObj<UserService>;
  let routerSpy: jasmine.SpyObj<Router>;
  let toastrSpy: jasmine.SpyObj<ToastrService>;

  beforeEach(async () => {

    userServiceSpy = jasmine.createSpyObj('UserService', [
      'getAllAccountTypes',
      'getAllBranches',
      'createUser',
      'getUserId',
      'createAccount'
    ]);

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    toastrSpy = jasmine.createSpyObj('ToastrService', ['success', 'error']);

    userServiceSpy.getAllAccountTypes.and.returnValue(of({
      status: true,
      data: [{ accountTypeId: 1, name: 'Savings' }]
    }));

    userServiceSpy.getAllBranches.and.returnValue(of({
      status: true,
      data: [{ branchId: 1, city: 'Chennai', branchLocation: 'T Nagar' }]
    }));

    await TestBed.configureTestingModule({
      imports: [Register, ReactiveFormsModule],
      providers: [
        provideZonelessChangeDetection(),
        { provide: UserService, useValue: userServiceSpy },
        { provide: Router, useValue: routerSpy },
        { provide: ToastrService, useValue: toastrSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Register);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // ================= BASIC =================
  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize forms', () => {
    expect(component.userForm).toBeDefined();
    expect(component.accountForm).toBeDefined();
  });

  // ================= PASSWORD =================
  it('should generate password of length 10', () => {
    const password = component.generatePassword();
    expect(password.length).toBe(10);
  });

  // ================= ACCOUNT TYPES =================
  it('should fetch account types', () => {
    component.getAllAccountTypes();
    expect(userServiceSpy.getAllAccountTypes).toHaveBeenCalled();
    expect(component.accountTypes.length).toBeGreaterThan(0);
  });

  it('should handle error when fetching account types fails', () => {
    userServiceSpy.getAllAccountTypes.and.returnValue(
      throwError(() => new Error('Test Error'))
    );
    spyOn(console, 'error');
    component.getAllAccountTypes();
    expect(console.error).toHaveBeenCalledWith('Error fetching account types', jasmine.any(Error));
  });

  // ================= BRANCHES =================
  it('should fetch branches', () => {
    component.getAllBranches();
    expect(userServiceSpy.getAllBranches).toHaveBeenCalled();
    expect(component.branchCities.length).toBeGreaterThan(0);
  });

  it('should handle error when fetching branches fails', () => {
    userServiceSpy.getAllBranches.and.returnValue(
      throwError(() => new Error('Branch Error'))
    );
    spyOn(console, 'error');
    component.getAllBranches();
    expect(console.error).toHaveBeenCalledWith('Error fetching branches:', jasmine.any(Error));
  });

  // ================= ADDRESS STEP =================
  it('should move to address form when basic details valid', () => {
    component.userForm.patchValue({
      fullName: 'Test User',
      email: 'test@test.com',
      phone: '0000000001',
      dateOfBirth: new Date(),
      gender: 'Male',
      occupation: 'Engineer',
      maritalStatus: 'Single',
      accountTypeId: 1
    });
    component.continueToAddress();
    expect(component.showAddressForm).toBeTrue();
  });

  it('should not move to address if form invalid', () => {
    component.continueToAddress();
    expect(component.showAddressForm).toBeFalse();
  });

  it('should go back to basic form', () => {
    component.showAddressForm = true;
    component.goBackToBasic();
    expect(component.showAddressForm).toBeFalse();
  });

  // ================= KYC STEP =================
  it('should continue to KYC when address valid', () => {
    component.userForm.get('address')?.patchValue({
      doorNumber: '12A',
      landMark: 'Near Park',
      street: 'Main Street',
      city: 'Chennai',
      district: 'Chennai',
      state: 'Tamil Nadu',
      country: 'India',
      pinCode: '600001'
    });
    component.continueToKyc();
    expect(component.showKycForm).toBeTrue();
    expect(component.showAddressForm).toBeFalse();
  });

  it('should go back to address from KYC', () => {
    component.showKycForm = true;
    component.showAddressForm = false;
    component.goBackToAddress();
    expect(component.showKycForm).toBeFalse();
    expect(component.showAddressForm).toBeTrue();
  });

  // ================= CITY SELECTION =================
  it('should filter branch locations by city', () => {
    component.allBranches = [
      { branchId: 1, city: 'Chennai', branchLocation: 'T Nagar' },
      { branchId: 2, city: 'Chennai', branchLocation: 'Adyar' }
    ];
    component.branchForm.patchValue({ city: 'Chennai' });
    component.onCitySelected();
    expect(component.branchLocations.length).toBe(2);
  });

  // ================= BRANCH CONTINUE =================
  it('should show error if branch not selected', () => {
    component.branchForm.patchValue({ city: '', location: '' });
    component.continueFromBranch();
    expect(toastrSpy.error).toHaveBeenCalledWith('Please select both city and location');
  });

  it('should select branch correctly', () => {
    component.allBranches = [
      { branchId: 1, city: 'Chennai', branchLocation: 'T Nagar' }
    ];
    component.branchForm.patchValue({ city: 'Chennai', location: 'T Nagar' });
    component.continueFromBranch();
    expect(component.accountForm.get('branchId')?.value).toBe(1);
  });

  it('should show error if branch not found', () => {
    component.allBranches = [
      { branchId: 1, city: 'Chennai', branchLocation: 'T Nagar' }
    ];
    component.branchForm.patchValue({ city: 'Chennai', location: 'Invalid' });
    component.continueFromBranch();
    expect(toastrSpy.error).toHaveBeenCalledWith('Branch not found for selected city & location');
  });

  // ================= ACCOUNT TYPE CHANGE =================
  it('should update accountTypeId when onAccountTypeChange called', () => {
    component.onAccountTypeChange(2);
    expect(component.accountForm.get('accountTypeId')?.value).toBe(2);
  });

  // ================= CREATE USER & ACCOUNT =================
  it('should create user and account successfully', () => {
    userServiceSpy.createUser.and.returnValue(of('success'));
    userServiceSpy.getUserId.and.returnValue(of(1));
    userServiceSpy.createAccount.and.returnValue(of('account created'));

    component.userForm.patchValue({
      fullName: 'Test User',
      email: 'test@test.com',
      phone: '0000000001',
      dateOfBirth: new Date(),
      gender: 'Male',
      occupation: 'Engineer',
      maritalStatus: 'Single',
      accountTypeId: 1
    });

    component.userForm.get('address')?.patchValue({
      doorNumber: '1',
      landMark: 'Park',
      street: 'Main',
      city: 'Chennai',
      district: 'Chennai',
      state: 'TN',
      country: 'India',
      pinCode: '600001'
    });

    component.userForm.get('kyc')?.patchValue({ adhaarNumber: '2'.padEnd(12, '0') });

    component.onSubmit();

    expect(userServiceSpy.createUser).toHaveBeenCalled();
    expect(userServiceSpy.getUserId).toHaveBeenCalled();
    expect(userServiceSpy.createAccount).toHaveBeenCalled();
    expect(component.successMessage).toBeTrue();
  });

  it('should set submitted as false and show error when createUser fails', () => {
    // Arrange: make createUser throw error
    userServiceSpy.createUser.and.returnValue(
      throwError(() => new Error('Server error'))
    );

    // Patch all required fields so form is valid
    component.userForm.patchValue({
      fullName: 'Test User',
      email: 'test@test.com',
      phone: '0000000001',
      dateOfBirth: new Date(),
      gender: 'Male',
      occupation: 'Engineer',
      maritalStatus: 'Single',
      accountTypeId: 1
    });

    component.userForm.get('address')?.patchValue({
      doorNumber: '12',
      landMark: 'Near Park',
      street: 'Main Street',
      city: 'Chennai',
      district: 'Chennai',
      state: 'TN',
      country: 'India',
      pinCode: '600001'
    });

    component.userForm.get('kyc')?.patchValue({
      adhaarNumber: '2'.padEnd(12, '0')
    });

    component.accountForm.patchValue({
      branchId: 1,
      accountTypeId: 1,
      accountStatus: 1,
      createdBy: 'Admin',
      modifiedBy: ''
    });

    // Act
    component.onSubmit();

    // Assert
    expect(component.submitted).toBeFalse();
    expect(toastrSpy.error).toHaveBeenCalledWith('User creation failed');
  });

  // ================= GET USER ID =================
  it('should show error if getUserId returns 0', () => {
    // Arrange: simulate createUser succeeds
    userServiceSpy.createUser.and.returnValue(of('created'));

    // Simulate getUserId returns 0
    userServiceSpy.getUserId.and.returnValue(of(0));

    // Patch all required fields so form is valid
    component.userForm.patchValue({
      fullName: 'Test User',
      email: 'test@test.com',
      phone: '0000000001',
      dateOfBirth: new Date(),
      gender: 'Male',
      occupation: 'Engineer',
      maritalStatus: 'Single',
      accountTypeId: 1
    });

    component.userForm.get('address')?.patchValue({
      doorNumber: '12',
      landMark: 'Near Park',
      street: 'Main Street',
      city: 'Chennai',
      district: 'Chennai',
      state: 'TN',
      country: 'India',
      pinCode: '600001'
    });

    component.userForm.get('kyc')?.patchValue({
      adhaarNumber: '2'.padEnd(12, '0')
    });

    component.accountForm.patchValue({
      branchId: 1,
      accountTypeId: 1,
      accountStatus: 1,
      createdBy: 'Admin',
      modifiedBy: ''
    });

    // Act: call submit
    component.onSubmit();

    // Assert: the "userId <= 0" branch executes
    expect(toastrSpy.error).toHaveBeenCalledWith('Could not get User ID');
  });

  it('should show error if getUserId fails', () => {
    // Arrange: simulate createUser succeeds
    userServiceSpy.createUser.and.returnValue(of('created'));

    // Simulate getUserId throws an error
    userServiceSpy.getUserId.and.returnValue(throwError(() => new Error('Server error')));

    // Fill all required fields so onSubmit proceeds
    component.userForm.patchValue({
      fullName: 'Test User',
      email: 'test@test.com',
      phone: '0000000001',
      dateOfBirth: new Date(),
      gender: 'Male',
      occupation: 'Engineer',
      maritalStatus: 'Single',
      accountTypeId: 1
    });

    component.userForm.get('address')?.patchValue({
      doorNumber: '12',
      landMark: 'Near Park',
      street: 'Main Street',
      city: 'Chennai',
      district: 'Chennai',
      state: 'TN',
      country: 'India',
      pinCode: '600001'
    });

    component.userForm.get('kyc')?.patchValue({
      adhaarNumber: '2'.padEnd(12, '0')
    });

    // Act: call submit
    component.onSubmit();

    // Assert: the error callback executes
    expect(toastrSpy.error).toHaveBeenCalledWith('Failed to fetch User ID');
  });
  // ================= NAVIGATION =================
  it('should navigate to login page', () => {
    component.ContinuetoLogin();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
  it('should execute error block when createUser API fails', () => {

    // make createUser throw error
    userServiceSpy.createUser.and.returnValue(
      throwError(() => new Error('API Failed'))
    );

    // Fill required fields so submit proceeds
    component.userForm.patchValue({
      fullName: 'Test User',
      email: 'test@test.com',
      phone: '0000000001',
      dateOfBirth: new Date(),
      gender: 'Male',
      occupation: 'Engineer',
      maritalStatus: 'Single',
      accountTypeId: 1
    });

    component.userForm.get('address')?.patchValue({
      doorNumber: '12',
      landMark: 'Near Park',
      street: 'Main Street',
      city: 'Chennai',
      district: 'Chennai',
      state: 'TN',
      country: 'India',
      pinCode: '600001'
    });

    component.userForm.get('kyc')?.patchValue({
      adhaarNumber: '2'.padEnd(12, '0')
    });

    component.accountForm.patchValue({
      branchId: 1,
      accountTypeId: 1
    });

    // run submit
    component.onSubmit();

    // EXPECT the error block to run
    expect(component.submitted).toBeFalse();
    expect(toastrSpy.error).toHaveBeenCalledWith('User creation failed');
  });

  it('should show error if getUserId returns 0', () => {
    // Arrange: simulate createUser succeeds
    userServiceSpy.createUser.and.returnValue(of('created'));

    // Simulate getUserId returns 0
    userServiceSpy.getUserId.and.returnValue(of(0));

    // Fill all required fields so onSubmit proceeds
    component.userForm.patchValue({
      fullName: 'Test User',
      email: 'test@test.com',
      phone: '0000000001',
      dateOfBirth: new Date(),
      gender: 'Male',
      occupation: 'Engineer',
      maritalStatus: 'Single',
      accountTypeId: 1
    });

    component.userForm.get('address')?.patchValue({
      doorNumber: '12',
      landMark: 'Near Park',
      street: 'Main Street',
      city: 'Chennai',
      district: 'Chennai',
      state: 'TN',
      country: 'India',
      pinCode: '600001'
    });

    component.userForm.get('kyc')?.patchValue({
      adhaarNumber: '2'.padEnd(12, '0')
    });

    // Act: call submit
    component.onSubmit();

    // Assert: the "userId <= 0" branch executes
    expect(toastrSpy.error).toHaveBeenCalledWith('Could not get User ID');
  });

  it('should mark controls as touched if required fields are invalid in continueToAddress', () => {
    // Arrange: make form invalid
    component.userForm.patchValue({
      fullName: '', // required field left empty
      email: '',
      phone: ''
    });

    // Act
    component.continueToAddress();

    // Assert
    const fullNameControl = component.userForm.get('fullName');
    expect(fullNameControl?.touched).toBeTrue();
    expect(component.showAddressForm).toBeFalse();
  });
  it('should mark required address fields as touched when invalid', () => {
    // Leave address fields empty
    component.userForm.get('address')?.patchValue({
      doorNumber: '',
      landMark: '',
      street: '',
      city: '',
      district: '',
      state: '',
      country: '',
      pinCode: ''
    });

    // Act
    component.continueToKyc();

    // Assert
    const addressFields = [
      'doorNumber',
      'landMark',
      'street',
      'city',
      'district',
      'state',
      'country',
      'pinCode'
    ];

    addressFields.forEach(field => {
      expect(component.userForm.get(`address.${field}`)?.touched).toBeTrue();
    });

    // KYC form should not proceed
    expect(component.showKycForm).toBeFalse();
  });

  it('should access accountForm controls via getter f', () => {
    // Access the getter
    const controls = component.f;

    // Expect it to return the same controls as accountForm.controls
    expect(controls).toBe(component.accountForm.controls);
  });

  it('should show error if createAccount fails', () => {
    // Arrange: make createAccount throw an error
    userServiceSpy.createAccount.and.returnValue(
      throwError(() => new Error('Server error'))
    );

    // Patch the accountForm with valid data so createAccount runs
    component.accountForm.patchValue({
      accountStatus: 0,
      createdBy: 'Admin',
      modifiedBy: '',
      userId: 1,
      branchId: 1,
      accountTypeId: 1,
      PIN: 1234
    });

    // Act: call createAccount (it's private, so call via any type or through public method)
    (component as any).createAccount();

    // Assert: toaster error should be called
    expect(toastrSpy.error).toHaveBeenCalledWith('Account creation failed');
  });
  
  it('should show error when form is invalid in onSubmit', () => {

  component.userForm.patchValue({
    fullName: '',
    email: '',
    phone: ''
  });
  component.onSubmit();
  expect(component.submitted).toBeTrue();
  expect(toastrSpy.error).toHaveBeenCalledWith(
    'Please fill all required fields correctly.'
  );

});
});