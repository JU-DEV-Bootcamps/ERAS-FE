import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedCheckboxComponent } from './selected-checkbox.component';
import { SelectableModel } from '@core/models/common/selectable.model';

describe('SelectedCheckboxComponent', () => {
  let component: SelectedCheckboxComponent<SelectableModel>;
  let fixture: ComponentFixture<SelectedCheckboxComponent<SelectableModel>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedCheckboxComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectedCheckboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
