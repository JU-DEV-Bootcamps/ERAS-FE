import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportAnswersComponent } from './import-answers.component';

describe('ImportAnswersComponent', () => {
  let component: ImportAnswersComponent;
  let fixture: ComponentFixture<ImportAnswersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportAnswersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ImportAnswersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
