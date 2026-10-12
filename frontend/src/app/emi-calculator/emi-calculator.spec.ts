import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmiCalculator } from './emi-calculator';

describe('EmiCalculator', () => {
  let component: EmiCalculator;
  let fixture: ComponentFixture<EmiCalculator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmiCalculator]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmiCalculator);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
