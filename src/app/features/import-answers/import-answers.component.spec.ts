import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ImportAnswersComponent } from './import-answers.component';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';

import { AuditModel } from '../../core/models/common/audit.model';
import { CosmicLatteService } from '../../core/services/api/cosmic-latte.service';
import { PollService } from '../../core/services/api/poll.service';
import { PollInstance } from '../../core/models/poll-instance.model';

describe('ImportAnswersComponent', () => {
  let component: ImportAnswersComponent;
  let fixture: ComponentFixture<ImportAnswersComponent>;
  let mockService: jasmine.SpyObj<CosmicLatteService>;

  const mockPollService = jasmine.createSpyObj('PollService', [
    'savePollsCosmicLattePreview',
  ]);

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('CosmicLatteService', [
      'importAnswerBySurvey',
      'getPollNames',
    ]);

    mockPollService.savePollsCosmicLattePreview.and.returnValue([]);

    mockService.getPollNames.and.returnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [ImportAnswersComponent, ReactiveFormsModule],
      providers: [
        { provide: CosmicLatteService, useValue: mockService },
        { provide: PollService, useValue: mockPollService },
        provideNoopAnimations(),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  const audit: AuditModel = {
    createdBy: 'string',
    modifiedBy: 'string',
    createdAt: new Date(),
    modifiedAt: new Date(),
  };
  const poll: PollInstance[] = [
    {
      id: 0,
      idCosmicLatte: 'string',
      uuid: 'string',
      name: 'string',
      version: 'string',
      finishedAt: 'string',
      components: [],
      audit: audit,
    },
  ];
  it('should reset the form after a successful submission', () => {
    component.form.controls['surveyName'].setValue('Test Survey');
    mockService.importAnswerBySurvey.and.returnValue(of(poll));
    component.onSubmit();
    expect(mockService.importAnswerBySurvey).toHaveBeenCalledWith(
      'Test Survey',
      null,
      null
    );
    expect(component.form.value.surveyName).toBe(null);
    expect(component.form.pristine).toBeTrue();
    expect(component.form.untouched).toBeTrue();
  });
});
