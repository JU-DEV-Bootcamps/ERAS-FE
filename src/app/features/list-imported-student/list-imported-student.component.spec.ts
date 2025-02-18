import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListImportedStudentComponent } from './list-imported-student.component';
import { ImportStudentService } from '../../core/services/import-students.service';

import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

describe('ListImportedStudentComponent', () => {
  let component: ListImportedStudentComponent;
  let fixture: ComponentFixture<ListImportedStudentComponent>;
  let mockService: jasmine.SpyObj<ImportStudentService>;

  beforeEach(async () => {
    mockService = jasmine.createSpyObj('ImportStudentService', ['getData']);
    mockService.getData.and.returnValue(of({ items: [], count: 0 }));

    await TestBed.configureTestingModule({
      imports: [ListImportedStudentComponent],
      providers: [
        { provide: ImportStudentService, useValue: mockService },
        provideNoopAnimations(),
        provideHttpClientTesting(),
      ],
    }).compileComponents();

    component = TestBed.inject(ListImportedStudentComponent);

    fixture = TestBed.createComponent(ListImportedStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
