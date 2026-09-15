import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportAnswersPreviewComponent } from './import-answers-preview.component';
import {
  BrowserAnimationsModule,
  provideNoopAnimations,
} from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { MatTableDataSource } from '@angular/material/table';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CosmicLatteService } from '@core/services/api/cosmic-latte.service';
import { PollService } from '@core/services/api/poll.service';
import { PollInstance } from '@core/models/poll-instance.model';
import { Component as PollComponentModel } from '@core/models/component.model';
import { Variable } from '@core/models/variable.model';
import { Answer } from '@core/models/answer.model';
import { Student } from '@core/models/student.model';
import { CohortModel } from '@core/models/cohort.model';
import { StudentPreview } from '@modules/imports/models/preview';

function createCohort(overrides: Partial<CohortModel> = {}): CohortModel {
  return {
    id: 1,
    name: 'Cohort A',
    courseCode: 'C001',
    ...overrides,
  };
}

function createStudent(overrides: Partial<Student> = {}): Student {
  return {
    id: 1,
    uuid: 'student-uuid-1',
    name: 'John Doe',
    email: 'john@example.com',
    studentDetail: null,
    cohort: createCohort(),
    ...overrides,
  };
}

function createAnswer(overrides: Partial<Answer> = {}): Answer {
  return {
    id: 1,
    answer: 'Yes',
    score: 5,
    pollInstanceId: 1,
    pollVariableId: 1,
    student: createStudent(),
    ...overrides,
  };
}

function createVariable(overrides: Partial<Variable> = {}): Variable {
  return {
    id: 1,
    name: 'Var 1',
    position: 1,
    type: 'text',
    answer: createAnswer(),
    ...overrides,
  };
}

function createComponent(
  overrides: Partial<PollComponentModel> = {}
): PollComponentModel {
  return {
    id: 1,
    name: 'Component 1',
    variables: [createVariable()],
    ...overrides,
  };
}

function createPollInstance(
  overrides: Partial<PollInstance> = {}
): PollInstance {
  return {
    id: 1,
    idCosmicLatte: 'CL-1',
    uuid: 'poll-uuid-1',
    name: 'Poll A',
    version: 'v1',
    finishedAt: '2026-01-01',
    components: [createComponent()],
    isAlreadyImported: false,
    ...overrides,
  };
}

describe('ImportAnswersPreviewComponent', () => {
  let component: ImportAnswersPreviewComponent;
  let fixture: ComponentFixture<ImportAnswersPreviewComponent>;
  let mockPollService: jasmine.SpyObj<PollService>;
  let mockCosmicLatteService: jasmine.SpyObj<CosmicLatteService>;

  beforeEach(async () => {
    mockPollService = jasmine.createSpyObj('PollService', ['getPolls']);
    mockCosmicLatteService = jasmine.createSpyObj('CosmicLatteService', [
      'getPollNames',
      'savePollsCosmicLattePreview',
    ]);

    mockCosmicLatteService.getPollNames.and.returnValue(of([]));
    mockCosmicLatteService.savePollsCosmicLattePreview.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ImportAnswersPreviewComponent, BrowserAnimationsModule],
      providers: [
        { provide: CosmicLatteService, useValue: mockCosmicLatteService },
        { provide: PollService, useValue: mockPollService },
        provideNoopAnimations(),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportAnswersPreviewComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('evaluationId', 1);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges / mapDataCreatedPoll', () => {
    it('should map poll data into pollDetails and studentPreviews', () => {
      const poll1 = createPollInstance({
        id: 1,
        name: 'Risk Poll',
        version: 'v2',
        idCosmicLatte: 'CL-42',
        components: [
          createComponent({
            name: 'Section 1',
            variables: [
              createVariable({
                answer: createAnswer({
                  student: createStudent({
                    name: 'John Doe',
                    email: 'john@example.com',
                    cohort: createCohort({ name: 'Cohort A' }),
                  }),
                }),
              }),
            ],
          }),
        ],
        isAlreadyImported: false,
      });
      const poll2 = createPollInstance({
        id: 2,
        components: [
          createComponent({
            variables: [
              createVariable({
                answer: createAnswer({
                  student: createStudent({
                    name: 'Jane Smith',
                    email: 'jane@example.com',
                    cohort: createCohort({ name: 'Cohort B' }),
                  }),
                }),
              }),
            ],
          }),
        ],
        isAlreadyImported: true,
      });

      fixture.componentRef.setInput('importedPollData', [poll1, poll2]);
      fixture.detectChanges();

      expect(component.totalStudents).toBe(2);
      expect(component.pollDetails.name).toBe('Risk Poll');
      expect(component.pollDetails.version).toBe('v2');
      expect(component.pollDetails.cosmicLatteId).toBe('CL-42');
      expect(component.pollDetails.components).toEqual(['Section 1']);

      expect(component.studentPreviews).toEqual([
        {
          '#': 1,
          name: 'John Doe',
          email: 'john@example.com',
          cohort: 'Cohort A',
          save: true,
        },
        {
          '#': 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          cohort: 'Cohort B',
          save: false,
        },
      ]);
      expect(component.dataStudents.data.length).toBe(2);
    });

    it('should exclude already-imported students and mark allStudentsChecked false', () => {
      const alreadyImported = createPollInstance({
        isAlreadyImported: true,
        components: [
          createComponent({
            variables: [
              createVariable({
                answer: createAnswer({
                  student: createStudent({ email: 'imported@example.com' }),
                }),
              }),
            ],
          }),
        ],
      });

      fixture.componentRef.setInput('importedPollData', [alreadyImported]);
      fixture.detectChanges();

      let excluded: string[] = [];
      component.studentExcludedEmails$.subscribe(value => (excluded = value));
      expect(excluded).toEqual(['imported@example.com']);

      let allChecked = true;
      component.allStudentsChecked$.subscribe(value => (allChecked = value));
      expect(allChecked).toBeFalse();
    });

    it('should mark allStudentsChecked true when nothing was already imported', () => {
      const poll = createPollInstance({ isAlreadyImported: false });

      fixture.componentRef.setInput('importedPollData', [poll]);
      fixture.detectChanges();

      let excluded: string[] = [];
      component.studentExcludedEmails$.subscribe(value => (excluded = value));
      expect(excluded).toEqual([]);

      let allChecked = false;
      component.allStudentsChecked$.subscribe(value => (allChecked = value));
      expect(allChecked).toBeTrue();
    });
  });

  describe('getInvalidStudents / isStudentValid', () => {
    it('should flag students with an invalid name or email as invalid', () => {
      const validStudent: StudentPreview = {
        '#': 1,
        name: 'John Doe',
        email: 'john@example.com',
        cohort: 'Cohort A',
        save: true,
      };
      const invalidNameStudent: StudentPreview = {
        '#': 2,
        name: 'John123',
        email: 'valid@example.com',
        cohort: 'Cohort A',
        save: true,
      };
      const invalidEmailStudent: StudentPreview = {
        '#': 3,
        name: 'Jane Doe',
        email: 'not-an-email',
        cohort: 'Cohort A',
        save: true,
      };

      component.getInvalidStudents([
        validStudent,
        invalidNameStudent,
        invalidEmailStudent,
      ]);

      let invalid: string[] = [];
      component.invalidStudents$.subscribe(value => (invalid = value));
      expect(invalid).toEqual(['valid@example.com', 'not-an-email']);
    });
  });

  describe('handleCheckbox', () => {
    const student: StudentPreview = {
      '#': 1,
      name: 'John Doe',
      email: 'john@example.com',
      cohort: 'Cohort A',
      save: true,
    };

    it('should exclude the student and mark save false when unchecked', () => {
      component.studentExcludedEmailsSubject.next([]);

      component.handleCheckbox(
        { checked: false } as MatSlideToggleChange,
        student
      );

      let excluded: string[] = [];
      component.studentExcludedEmails$.subscribe(value => (excluded = value));
      expect(excluded).toEqual(['john@example.com']);
      expect(student.save).toBeFalse();

      let allChecked = true;
      component.allStudentsChecked$.subscribe(value => (allChecked = value));
      expect(allChecked).toBeFalse();
    });

    it('should re-include the student when checked again', () => {
      component.studentExcludedEmailsSubject.next(['john@example.com']);

      component.handleCheckbox(
        { checked: true } as MatSlideToggleChange,
        student
      );

      let excluded: string[] = [];
      component.studentExcludedEmails$.subscribe(value => (excluded = value));
      expect(excluded).toEqual([]);

      let allChecked = false;
      component.allStudentsChecked$.subscribe(value => (allChecked = value));
      expect(allChecked).toBeTrue();
    });
  });

  describe('handleAllCheckboxs', () => {
    it('should exclude every filtered student when unchecked', () => {
      const students: StudentPreview[] = [
        {
          '#': 1,
          name: 'John Doe',
          email: 'john@example.com',
          cohort: 'Cohort A',
          save: true,
        },
        {
          '#': 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          cohort: 'Cohort A',
          save: true,
        },
      ];
      component.dataStudents = new MatTableDataSource(students);

      component.handleAllCheckboxs({ checked: false } as MatSlideToggleChange);

      let excluded: string[] = [];
      component.studentExcludedEmails$.subscribe(value => (excluded = value));
      expect(excluded).toEqual(['john@example.com', 'jane@example.com']);
      expect(students.every(s => s.save === false)).toBeTrue();

      let allChecked = true;
      component.allStudentsChecked$.subscribe(value => (allChecked = value));
      expect(allChecked).toBeFalse();
    });

    it('should include every filtered student when checked', () => {
      const students: StudentPreview[] = [
        {
          '#': 1,
          name: 'John Doe',
          email: 'john@example.com',
          cohort: 'Cohort A',
          save: false,
        },
      ];
      component.dataStudents = new MatTableDataSource(students);

      component.handleAllCheckboxs({ checked: true } as MatSlideToggleChange);

      let excluded: string[] = [];
      component.studentExcludedEmails$.subscribe(value => (excluded = value));
      expect(excluded).toEqual([]);
      expect(students[0].save).toBeTrue();

      let allChecked = false;
      component.allStudentsChecked$.subscribe(value => (allChecked = value));
      expect(allChecked).toBeTrue();
    });
  });

  describe('savePolls', () => {
    function setupSinglePoll(email: string) {
      const poll = createPollInstance({
        isAlreadyImported: false,
        components: [
          createComponent({
            variables: [
              createVariable({
                answer: createAnswer({ student: createStudent({ email }) }),
              }),
            ],
          }),
        ],
      });
      fixture.componentRef.setInput('importedPollData', [poll]);
      fixture.detectChanges();
    }

    it('should emit pending then true, and call the service with the non-excluded polls', () => {
      setupSinglePoll('john@example.com');
      const savedPoll = createPollInstance({ id: 99 });
      mockCosmicLatteService.savePollsCosmicLattePreview.and.returnValue(
        of([savedPoll])
      );
      const emitSpy = spyOn(component.saveCompleted, 'emit');

      component.savePolls();

      expect(
        mockCosmicLatteService.savePollsCosmicLattePreview
      ).toHaveBeenCalledWith(jasmine.any(Array), 1);
      expect(emitSpy).toHaveBeenCalledWith({ state: 'pending', data: null });
      expect(emitSpy).toHaveBeenCalledWith({
        state: 'true',
        data: [savedPoll],
      });
      expect(component.totalStudents).toBe(0);
      expect(component.importedPollData).toEqual([]);
    });

    it('should exclude unchecked students from the polls sent to the service', () => {
      setupSinglePoll('excluded@example.com');
      component.studentExcludedEmailsSubject.next(['excluded@example.com']);
      mockCosmicLatteService.savePollsCosmicLattePreview.and.returnValue(
        of([])
      );

      component.savePolls();

      expect(
        mockCosmicLatteService.savePollsCosmicLattePreview
      ).toHaveBeenCalledWith([], 1);
    });

    it('should emit false and restore the preview on error', () => {
      setupSinglePoll('john@example.com');
      const error = { message: 'Save failed' };
      mockCosmicLatteService.savePollsCosmicLattePreview.and.returnValue(
        throwError(() => error)
      );
      const emitSpy = spyOn(component.saveCompleted, 'emit');

      component.savePolls();

      expect(emitSpy).toHaveBeenCalledWith({ state: 'false', data: error });
      let previewHidden = true;
      component.previewIsHidden$.subscribe(value => (previewHidden = value));
      expect(previewHidden).toBeFalse();
    });
  });

  describe('cancel', () => {
    it('should reset the poll data and emit cancelImport', () => {
      const poll = createPollInstance();
      fixture.componentRef.setInput('importedPollData', [poll]);
      fixture.detectChanges();

      const emitSpy = spyOn(component.cancelImport, 'emit');

      component.cancel();

      expect(component.totalStudents).toBe(0);
      expect(component.studentPreviews).toEqual([]);
      expect(component.importedPollData).toEqual([]);
      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('checkScreenSize', () => {
    it('should mark isMobile true for narrow screens', () => {
      spyOnProperty(window, 'innerWidth', 'get').and.returnValue(500);
      component.checkScreenSize();
      expect(component.isMobile).toBeTrue();
    });

    it('should mark isMobile false for wide screens', () => {
      spyOnProperty(window, 'innerWidth', 'get').and.returnValue(1024);
      component.checkScreenSize();
      expect(component.isMobile).toBeFalse();
    });
  });
});
