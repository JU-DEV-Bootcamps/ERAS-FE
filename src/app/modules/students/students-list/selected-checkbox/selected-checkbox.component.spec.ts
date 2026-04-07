import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedCheckboxComponent } from './selected-checkbox.component';

describe('SelectedCheckboxComponent', () => {
  let component: SelectedCheckboxComponent;
  let fixture: ComponentFixture<SelectedCheckboxComponent>;

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
