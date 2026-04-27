import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportPreviewStudentsComponent } from './import-preview-students.component';

describe('ImportPreviewStudentsComponent', () => {
  let component: ImportPreviewStudentsComponent;
  let fixture: ComponentFixture<ImportPreviewStudentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportPreviewStudentsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportPreviewStudentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
