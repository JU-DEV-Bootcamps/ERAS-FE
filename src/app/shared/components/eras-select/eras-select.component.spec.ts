import { ComponentFixture, TestBed } from '@angular/core/testing';

import {
  ErasSelectComponent,
  SelectedOptionModel,
} from './eras-select.component';

describe('ErasSelectComponent', () => {
  let component: ErasSelectComponent<number>;
  let fixture: ComponentFixture<ErasSelectComponent<number>>;

  const mockOptions: SelectedOptionModel<number>[] = [
    { label: 'Text One', value: 1 },
    { label: 'Text Two', value: 2 },
  ];

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
    fixture.componentRef.setInput('options', mockOptions);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('toggle', () => {
    it('should flip isOpen from false to true', () => {
      expect(component.isOpen()).toBeFalse();
      component.toggle();
      expect(component.isOpen()).toBeTrue();
    });

    it('should flip isOpen from true to false', () => {
      component.toggle();
      component.toggle();
      expect(component.isOpen()).toBeFalse();
    });
  });

  describe('select', () => {
    it('should set the selected option, emit valueChange and close the dropdown', () => {
      const emitSpy = spyOn(component.valueChange, 'emit');
      component.toggle();

      component.select(mockOptions[1]);

      expect(component.selected()).toEqual(mockOptions[1]);
      expect(emitSpy).toHaveBeenCalledWith(2);
      expect(component.isOpen()).toBeFalse();
    });
  });

  describe('onOutsideClick', () => {
    it('should close the dropdown when the click target is outside .eras-select', () => {
      component.toggle();
      expect(component.isOpen()).toBeTrue();

      const outsideEl = document.createElement('div');
      document.body.appendChild(outsideEl);
      const event = { target: outsideEl } as unknown as MouseEvent;

      component.onOutsideClick(event);

      expect(component.isOpen()).toBeFalse();
      document.body.removeChild(outsideEl);
    });

    it('should keep the dropdown open when the click target is inside .eras-select', () => {
      component.toggle();
      expect(component.isOpen()).toBeTrue();

      const container = document.createElement('div');
      container.classList.add('eras-select');
      const innerEl = document.createElement('span');
      container.appendChild(innerEl);
      document.body.appendChild(container);

      const event = { target: innerEl } as unknown as MouseEvent;

      component.onOutsideClick(event);

      expect(component.isOpen()).toBeTrue();
      document.body.removeChild(container);
    });
  });

  describe('value/options sync effect', () => {
    it('should set selected to null when value is null', () => {
      fixture.componentRef.setInput('value', null);
      fixture.detectChanges();

      expect(component.selected()).toBeNull();
    });

    it('should set selected to the matching option using the default compareBy', () => {
      fixture.componentRef.setInput('value', 2);
      fixture.detectChanges();

      expect(component.selected()).toEqual(mockOptions[1]);
    });

    it('should set selected to null when value does not match any option', () => {
      fixture.componentRef.setInput('value', 999);
      fixture.detectChanges();

      expect(component.selected()).toBeNull();
    });

    it('should use a custom compareBy function to find the matching option', () => {
      const customOptions: SelectedOptionModel<number>[] = [
        { label: 'Ten', value: 10 },
        { label: 'Twenty', value: 20 },
      ];
      fixture.componentRef.setInput('options', customOptions);
      fixture.componentRef.setInput(
        'compareBy',
        (a: number, b: number) => Math.abs(a - b) <= 1
      );
      fixture.componentRef.setInput('value', 11);
      fixture.detectChanges();

      expect(component.selected()).toEqual(customOptions[0]);
    });
  });
});
