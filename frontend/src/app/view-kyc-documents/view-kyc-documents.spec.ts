import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewKycDocuments } from './view-kyc-documents';

describe('ViewKycDocuments', () => {
  let component: ViewKycDocuments;
  let fixture: ComponentFixture<ViewKycDocuments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewKycDocuments]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ViewKycDocuments);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
