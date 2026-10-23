import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SelectVirtualScrollComponent } from './select-virtual-scroll.component';
import { SingleSelectItem } from '../interfaces/select';
import { VIRTUAL_SCROLL_THRESHOLD } from '@core/constants/select';

describe('SelectVirtualScrollComponent', () => {
  let component: SelectVirtualScrollComponent;
  let fixture: ComponentFixture<SelectVirtualScrollComponent>;

  const mockItems: SingleSelectItem[] = [
    { label: 'Apple', value: 1 },
    { label: 'Banana', value: 2 },
    { label: 'Grape', value: 3 },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SelectVirtualScrollComponent,
        ReactiveFormsModule,
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectVirtualScrollComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('control', new FormControl());
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should update label', () => {
    fixture.componentRef.setInput('control', new FormControl());
    fixture.componentRef.setInput('label', 'LabelValue');

    fixture.detectChanges();

    expect(component.label()).toBe('LabelValue');
  });

  it('should receive id', () => {
    fixture.componentRef.setInput('control', new FormControl());
    fixture.componentRef.setInput('id', 'IdValue');

    fixture.detectChanges();

    expect(component.id()).toBe('IdValue');
  });

  describe('onInput / filteredItems', () => {
    it('should return all items when the search text is empty', () => {
      fixture.componentRef.setInput('control', new FormControl());
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      expect(component.filteredItems()).toEqual(mockItems);
    });

    it('should filter items case-insensitively based on the input value', () => {
      fixture.componentRef.setInput('control', new FormControl());
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const event = {
        target: { value: 'ban' } as HTMLInputElement,
      } as unknown as Event;
      component.onInput(event);

      expect(component.filteredItems()).toEqual([mockItems[1]]);
    });

    it('should trim and ignore case when filtering', () => {
      fixture.componentRef.setInput('control', new FormControl());
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const event = {
        target: { value: '  GRAPE  ' } as HTMLInputElement,
      } as unknown as Event;
      component.onInput(event);

      expect(component.filteredItems()).toEqual([mockItems[2]]);
    });

    it('should return an empty array when no item matches the search text', () => {
      fixture.componentRef.setInput('control', new FormControl());
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const event = {
        target: { value: 'zzz' } as HTMLInputElement,
      } as unknown as Event;
      component.onInput(event);

      expect(component.filteredItems()).toEqual([]);
    });

    it('should return all items again when the search text is cleared', () => {
      fixture.componentRef.setInput('control', new FormControl());
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      component.onInput({
        target: { value: 'ban' } as HTMLInputElement,
      } as unknown as Event);
      component.onInput({
        target: { value: '' } as HTMLInputElement,
      } as unknown as Event);

      expect(component.filteredItems()).toEqual(mockItems);
    });
  });

  describe('displayFn', () => {
    it('should return the label matching the given value', () => {
      fixture.componentRef.setInput('control', new FormControl());
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      expect(component.displayFn(2)).toBe('Banana');
    });

    it('should return an empty string when no item matches the value', () => {
      fixture.componentRef.setInput('control', new FormControl());
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      expect(component.displayFn(999)).toBe('');
    });
  });

  describe('trackByFn', () => {
    it('should return the item value as the track key', () => {
      fixture.componentRef.setInput('control', new FormControl());
      fixture.detectChanges();

      expect(component.trackByFn(0, mockItems[1])).toBe(2);
    });
  });

  describe('useVirtualScroll', () => {
    it('should be false when items length is below the threshold', () => {
      fixture.componentRef.setInput('control', new FormControl());
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      expect(component.useVirtualScroll()).toBeFalse();
    });

    it('should be true when items length exceeds the threshold', () => {
      const manyItems: SingleSelectItem[] = Array.from(
        { length: VIRTUAL_SCROLL_THRESHOLD + 1 },
        (_, i) => ({ label: `Item ${i}`, value: i })
      );
      fixture.componentRef.setInput('control', new FormControl());
      fixture.componentRef.setInput('items', manyItems);
      fixture.detectChanges();

      expect(component.useVirtualScroll()).toBeTrue();
    });
  });
});
