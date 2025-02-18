import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListImportedStudentComponent } from './list-imported-student.component';
<<<<<<< HEAD
import { ImportStudentService } from '../../core/services/import-students.service';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
=======
>>>>>>> 9c7a2ab (feat: add table with paginator for imported students)

describe('ListImportedStudentComponent', () => {
  let component: ListImportedStudentComponent;
  let fixture: ComponentFixture<ListImportedStudentComponent>;
<<<<<<< HEAD
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
=======

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListImportedStudentComponent],
>>>>>>> 9c7a2ab (feat: add table with paginator for imported students)
    }).compileComponents();

    fixture = TestBed.createComponent(ListImportedStudentComponent);
    component = fixture.componentInstance;
<<<<<<< HEAD
    mockService = TestBed.inject(ImportStudentService);
=======
>>>>>>> 9c7a2ab (feat: add table with paginator for imported students)
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
