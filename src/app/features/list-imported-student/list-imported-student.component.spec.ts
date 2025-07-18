import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListImportedStudentComponent } from './list-imported-student.component';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { StudentService } from '../../core/services/api/student.service';
import { ActivatedRoute } from '@angular/router';

describe('ListImportedStudentComponent', () => {
  const mockActivatedRoute = {
    snapshot: {
      paramMap: {
        get: () => null,
      },
    },
    params: of({}),
    queryParams: of({}),
  };

  let component: ListImportedStudentComponent;
  let fixture: ComponentFixture<ListImportedStudentComponent>;
  let mockService = jasmine.createSpyObj('ImportStudentService', ['getData']);

  beforeEach(async () => {
    mockService.getData.and.returnValue(of({ items: [], count: 0 }));

    await TestBed.configureTestingModule({
      imports: [ListImportedStudentComponent],
      providers: [
        { provide: StudentService, useValue: mockService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        provideNoopAnimations(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListImportedStudentComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(StudentService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
