import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFieldSkeletonComponent } from './form-field-skeleton.component';

describe('FormFieldSkeletonComponent', () => {
  let component: FormFieldSkeletonComponent;
  let fixture: ComponentFixture<FormFieldSkeletonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldSkeletonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldSkeletonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
