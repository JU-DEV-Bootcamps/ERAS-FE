import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAssessmentModalComponent } from './edit-assessment-modal.component';

describe('EditAssessmentModalComponent', () => {
  let component: EditAssessmentModalComponent;
  let fixture: ComponentFixture<EditAssessmentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditAssessmentModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditAssessmentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
