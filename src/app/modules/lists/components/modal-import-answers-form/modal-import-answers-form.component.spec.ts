import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalImportAnswersFormComponent } from './modal-import-answers-form.component';

describe('ModalImportAnswersFormComponent', () => {
  let component: ModalImportAnswersFormComponent;
  let fixture: ComponentFixture<ModalImportAnswersFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalImportAnswersFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalImportAnswersFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
