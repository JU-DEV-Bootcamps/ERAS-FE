import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportStudentsComponent } from './import-students.component';

describe('ImportStudentsComponent', () => {
  let component: ImportStudentsComponent;
  let fixture: ComponentFixture<ImportStudentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportStudentsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
