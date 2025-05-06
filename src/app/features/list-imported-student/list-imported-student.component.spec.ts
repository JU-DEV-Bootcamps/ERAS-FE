import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListImportedStudentComponent } from './list-imported-student.component';
import { ImportStudentService } from '../../core/services/api/import-students.service';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('ListImportedStudentComponent', () => {
  let component: ListImportedStudentComponent;
  let fixture: ComponentFixture<ListImportedStudentComponent>;
  let mockService = jasmine.createSpyObj('ImportStudentService', ['getData']);

  beforeEach(async () => {
    mockService.getData.and.returnValue(of({ items: [], count: 0 }));

    await TestBed.configureTestingModule({
      imports: [ListImportedStudentComponent],
      providers: [
        { provide: ImportStudentService, useValue: mockService },
        provideNoopAnimations(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ListImportedStudentComponent);
    component = fixture.componentInstance;
    mockService = TestBed.inject(ImportStudentService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
