import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  ErasSelectComponent,
  SelectedOptionModel,
} from './eras-select.component';

describe('ErasSelectComponent', () => {
  let component: ErasSelectComponent<number>;
  let fixture: ComponentFixture<ErasSelectComponent<number>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ErasSelectComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ErasSelectComponent<number>);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('label', 'Evaluation Process');
    fixture.componentRef.setInput(
      'placeholder',
      'Select an evaluation process'
    );
    fixture.componentRef.setInput('options', [
      { label: 'Text One', value: 1 },
      { label: 'Text Two', value: 2 },
    ] as SelectedOptionModel<number>[]);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
