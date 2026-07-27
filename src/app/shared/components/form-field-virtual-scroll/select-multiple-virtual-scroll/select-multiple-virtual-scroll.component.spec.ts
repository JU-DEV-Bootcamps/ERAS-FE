import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SelectMultipleVirtualScrollComponent } from './select-multiple-virtual-scroll.component';
import {
  MultipleSelectCommonItem,
  MultipleSelectItem,
  SelectGroup,
} from '../interfaces/select';
import { MatSelectChange } from '@angular/material/select';
import { MatOption, MatOptionSelectionChange } from '@angular/material/core';
import { MatChipInputEvent } from '@angular/material/chips';

describe('SelectMultipleVirtualScrollComponent', () => {
  let component: SelectMultipleVirtualScrollComponent;
  let fixture: ComponentFixture<SelectMultipleVirtualScrollComponent>;

  const mockItems: MultipleSelectItem[] = [
    { label: 'Option 1', value: 1 },
    { label: 'Option 2', value: 2 },
  ];

  const mockGroups: SelectGroup[] = [
    {
      label: 'Group A',
      items: [
        { label: 'Item A1', value: 'a1' },
        { label: 'Item A2', value: 'a2' },
      ],
    },
  ];

  function createSearchEvent(value: string): Event {
    return {
      target: { value },
    } as unknown as Event;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SelectMultipleVirtualScrollComponent,
        ReactiveFormsModule,
        BrowserAnimationsModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectMultipleVirtualScrollComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('control', new FormControl<number[]>([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should build scrollItems based on simple items', () => {
    fixture.componentRef.setInput('control', new FormControl<number[]>([]));
    fixture.componentRef.setInput('items', mockItems);

    fixture.detectChanges();

    expect(component.scrollItems()).toEqual(mockItems);
  });

  it('should build scrollItems based on groups when empty', () => {
    fixture.componentRef.setInput('control', new FormControl<string[]>([]));
    fixture.componentRef.setInput('items', []);
    fixture.componentRef.setInput('groups', mockGroups);

    fixture.detectChanges();

    const expected: MultipleSelectItem[] = [
      { label: 'Group A', type: 'group' },
      { label: 'Item A1', value: 'a1' },
      { label: 'Item A2', value: 'a2' },
    ];
    expect(component.scrollItems()).toEqual(expected);
  });

  it('should calculate scrollItemsValues', () => {
    fixture.componentRef.setInput('control', new FormControl<string[]>([]));
    fixture.componentRef.setInput('groups', mockGroups);

    fixture.detectChanges();

    expect(component.scrollItemsValues()).toEqual(['a1', 'a2']);
  });

  it('should emit event openedChange(false) when items initialize', fakeAsync(() => {
    spyOn(component.openedChange, 'emit');
    fixture.componentRef.setInput('control', new FormControl<number[]>([]));
    fixture.componentRef.setInput('items', mockItems);

    fixture.detectChanges();

    tick();
    expect(component.openedChange.emit).toHaveBeenCalledWith(false);
  }));

  it('should return ["All"] when all elements are selected', () => {
    const control = new FormControl([1, 2]);
    const mockItemsValues = mockItems.map(
      item => (item as MultipleSelectCommonItem).value as number
    );
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('items', mockItems);
    component.selectedItemsValues.set(mockItemsValues);

    fixture.detectChanges();

    const selection = component.getItemSelection();
    expect(selection).toEqual(['All']);
  });

  it('should contain all items if Select all has been checked', () => {
    const control = new FormControl<number[]>([]);
    const selection = { value: ['allValues'] } as MatSelectChange;
    const mockItemsValues = mockItems.map(
      item => (item as MultipleSelectCommonItem).value as number
    );

    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('items', mockItems);

    fixture.detectChanges();

    component.updateSelection(selection);
    fixture.detectChanges();

    expect(component.selectedItemsValues()).toEqual(mockItemsValues);
  });

  it('should add an item if selected', () => {
    const control = new FormControl<number[]>([]);
    const selection = { value: [3] } as MatSelectChange;

    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('items', mockItems);
    fixture.detectChanges();

    component.updateSelection(selection);
    fixture.detectChanges();

    expect(component.selectedItemsValues()).toEqual([3]);
  });

  describe('trackScrollItem', () => {
    it('returns the id when the item value is an object with id', () => {
      fixture.componentRef.setInput('control', new FormControl([]));
      fixture.detectChanges();

      const item: MultipleSelectItem = {
        label: 'Item',
        value: { id: 123 },
      };
      expect(component.trackScrollItem(0, item)).toBe(123);
    });
  });

  describe('filteredScrollItems / onSearch', () => {
    it('filters plain items by label (case-insensitive)', () => {
      fixture.componentRef.setInput('control', new FormControl([]));
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      component.onSearch(createSearchEvent('option 1'));

      expect(component.filteredScrollItems()).toEqual([mockItems[0]]);
    });

    it('keeps a group header when at least one of its items matches', () => {
      fixture.componentRef.setInput('control', new FormControl([]));
      fixture.componentRef.setInput('items', []);
      fixture.componentRef.setInput('groups', mockGroups);
      fixture.detectChanges();

      component.onSearch(createSearchEvent('a1'));

      const result = component.filteredScrollItems();
      expect(result.some(i => component.isGroupItem(i))).toBeTrue();
      expect(result.length).toBe(2);
    });
  });

  describe('handleOpenedChange', () => {
    it('clears the search text and emits false when closing', () => {
      spyOn(component.openedChange, 'emit');
      fixture.componentRef.setInput('control', new FormControl([]));
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      component.onSearch(createSearchEvent('Option'));
      component.handleOpenedChange(false);

      expect(component.filteredScrollItems()).toEqual(mockItems);
      expect(component.openedChange.emit).toHaveBeenCalledWith(false);
    });
  });

  describe('selectAllClicked', () => {
    it('clears the selection when the user deselects "Select all"', () => {
      fixture.componentRef.setInput('control', new FormControl([]));
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();
      component.selectedItemsValues.set([1, 2]);

      const mockEvent = {
        isUserInput: true,
        source: { selected: false } as MatOption,
      } as MatOptionSelectionChange;

      component.selectAllClicked(mockEvent);

      expect(component.selectedItemsValues()).toEqual([]);
    });

    it('does nothing on a non-user-input event', () => {
      fixture.componentRef.setInput('control', new FormControl([]));
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();
      component.selectedItemsValues.set([1, 2]);

      const mockEvent = {
        isUserInput: false,
        source: { selected: false } as MatOption,
      } as MatOptionSelectionChange;

      component.selectAllClicked(mockEvent);

      expect(component.selectedItemsValues()).toEqual([1, 2]);
    });
  });

  describe('add / remove (chip mode)', () => {
    it('adds an item matching the typed label', () => {
      fixture.componentRef.setInput('control', new FormControl<number[]>([]));
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();

      const chipInputSpy = jasmine.createSpyObj('MatChipInput', ['clear']);
      const event = {
        value: 'Option 1',
        chipInput: chipInputSpy,
      } as MatChipInputEvent;

      component.add(event);

      expect(component.selectedItemsValues()).toEqual([1]);
      expect(chipInputSpy.clear).toHaveBeenCalled();
    });

    it('removes an item by its label', () => {
      fixture.componentRef.setInput('control', new FormControl<number[]>([]));
      fixture.componentRef.setInput('items', mockItems);
      fixture.detectChanges();
      component.selectedItemsValues.set([1, 2]);

      component.remove('Option 1');

      expect(component.selectedItemsValues()).toEqual([2]);
    });
  });

  describe('autoSelect effect', () => {
    it('auto-patches the control with all values by default', fakeAsync(() => {
      const control = new FormControl<number[]>([]);
      fixture.componentRef.setInput('control', control);
      fixture.componentRef.setInput('items', mockItems);

      fixture.detectChanges();
      tick();

      expect(control.value).toEqual([1, 2]);
      expect(component.selectedItemsValues()).toEqual([1, 2]);
    }));

    it('does not auto-select when autoSelect is false', fakeAsync(() => {
      const control = new FormControl<number[]>([]);
      fixture.componentRef.setInput('control', control);
      fixture.componentRef.setInput('items', mockItems);
      fixture.componentRef.setInput('autoSelect', false);

      fixture.detectChanges();
      tick();

      expect(control.value).toEqual([]);
    }));
  });
});
