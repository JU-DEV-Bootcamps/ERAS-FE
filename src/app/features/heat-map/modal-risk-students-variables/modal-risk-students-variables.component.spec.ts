import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRiskStudentsVariablesComponent } from './modal-risk-students-variables.component';

describe('ModalRiskStudentsVariablesComponent', () => {
  let component: ModalRiskStudentsVariablesComponent;
  let fixture: ComponentFixture<ModalRiskStudentsVariablesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalRiskStudentsVariablesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalRiskStudentsVariablesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
