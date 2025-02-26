import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAnswersPreviewComponent } from './import-answers-preview.component';

describe('ImportAnswersPreviewComponent', () => {
  let component: ImportAnswersPreviewComponent;
  let fixture: ComponentFixture<ImportAnswersPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportAnswersPreviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportAnswersPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
