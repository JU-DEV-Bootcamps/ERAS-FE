import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ImportAnswersComponent } from './import-answers.component';
import { provideNoopAnimations  } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { CostmicLatteService } from '../../core/services/cosmic-latte.service';

describe('ImportAnswersComponent', () => {
  let component: ImportAnswersComponent;
  let fixture: ComponentFixture<ImportAnswersComponent>;
  let mockService: jasmine.SpyObj<CostmicLatteService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('CostmicLatteService', ['importAnswerBySurvey']);
    await TestBed.configureTestingModule({
      imports: [ImportAnswersComponent, ReactiveFormsModule],
      providers: [
        { provide: CostmicLatteService, useValue: mockService }, provideNoopAnimations()
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should reset the form after a successful submission', () => {
    component.form.controls['surveyName'].setValue('Test Survey');
    mockService.importAnswerBySurvey.and.returnValue(of({ message: 'Success' }));
    component.onSubmit();
    expect(mockService.importAnswerBySurvey).toHaveBeenCalledWith('Test Survey', '', '');
    expect(component.form.value.surveyName).toBe(null);
    expect(component.form.pristine).toBeTrue();
    expect(component.form.untouched).toBeTrue();
  });
});
