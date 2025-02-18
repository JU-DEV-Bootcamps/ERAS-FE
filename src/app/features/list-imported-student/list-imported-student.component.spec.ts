import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListImportedStudentComponent } from './list-imported-student.component';

describe('ListImportedStudentComponent', () => {
  let component: ListImportedStudentComponent;
  let fixture: ComponentFixture<ListImportedStudentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListImportedStudentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListImportedStudentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
