import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadKycDocuments } from './upload-kyc-documents';

describe('UploadKycDocuments', () => {
  let component: UploadKycDocuments;
  let fixture: ComponentFixture<UploadKycDocuments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadKycDocuments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadKycDocuments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
