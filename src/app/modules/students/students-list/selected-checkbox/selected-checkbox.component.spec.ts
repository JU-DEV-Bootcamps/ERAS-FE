import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { SelectedCheckboxComponent } from './selected-checkbox.component';
import { SelectableModel } from '@core/models/common/selectable.model';

const buildCheckboxChange = (checked: boolean): MatCheckboxChange =>
  ({ checked }) as MatCheckboxChange;

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

  describe('onChange', () => {
    it('should update element.isSelected and emit checkChange when enabled and element is set', () => {
      const element: SelectableModel = { id: 1, isSelected: false };
      component.element = element;
      component.disabled = false;
      const emitSpy = spyOn(component.checkChange, 'emit');

      component.onChange(buildCheckboxChange(true));

      expect(element.isSelected).toBeTrue();
      expect(emitSpy).toHaveBeenCalledWith(true);
    });

    it('should set isSelected to false and emit when unchecked', () => {
      const element: SelectableModel = { id: 2, isSelected: true };
      component.element = element;
      component.disabled = false;
      const emitSpy = spyOn(component.checkChange, 'emit');

      component.onChange(buildCheckboxChange(false));

      expect(element.isSelected).toBeFalse();
      expect(emitSpy).toHaveBeenCalledWith(false);
    });

    it('should do nothing when disabled is true', () => {
      const element: SelectableModel = { id: 3, isSelected: false };
      component.element = element;
      component.disabled = true;
      const emitSpy = spyOn(component.checkChange, 'emit');

      component.onChange(buildCheckboxChange(true));

      expect(element.isSelected).toBeFalse();
      expect(emitSpy).not.toHaveBeenCalled();
    });

    it('should do nothing when element is undefined', () => {
      component.element = undefined;
      component.disabled = false;
      const emitSpy = spyOn(component.checkChange, 'emit');

      expect(() => component.onChange(buildCheckboxChange(true))).not.toThrow();
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });
});
