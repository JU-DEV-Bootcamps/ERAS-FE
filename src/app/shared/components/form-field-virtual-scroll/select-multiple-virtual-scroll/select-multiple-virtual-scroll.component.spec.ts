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

  function createOptionSelectionEvent(
    isUserInput: boolean,
    selected: boolean
  ): MatOptionSelectionChange {
    return {
      isUserInput,
      source: { selected } as MatOption,
    } as MatOptionSelectionChange;
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

  describe('onSelectAllToggle', () => {
    it('selects all scroll item values when the user checks "Select all"', () => {
      const control = new FormControl<number[]>([]);
      const mockItemsValues = mockItems.map(
        item => (item as MultipleSelectCommonItem).value as number
      );

      fixture.componentRef.setInput('control', control);
      fixture.componentRef.setInput('items', mockItems);
      fixture.componentRef.setInput('autoSelect', false);
      fixture.detectChanges();

      component.onSelectAllToggle(createOptionSelectionEvent(true, true));

      expect(component.selectedItemsValues()).toEqual(mockItemsValues);
    });

    it('clears the selection when the user deselects "Select all"', () => {
      fixture.componentRef.setInput('control', new FormControl([]));
      fixture.componentRef.setInput('items', mockItems);
      fixture.componentRef.setInput('autoSelect', false);
      fixture.detectChanges();
      component.selectedItemsValues.set([1, 2]);

      component.onSelectAllToggle(createOptionSelectionEvent(true, false));

      expect(component.selectedItemsValues()).toEqual([]);
    });

    it('does nothing on a non-user-input event', () => {
      fixture.componentRef.setInput('control', new FormControl([]));
      fixture.componentRef.setInput('items', mockItems);
      fixture.componentRef.setInput('autoSelect', false);
      fixture.detectChanges();
      component.selectedItemsValues.set([1, 2]);

      component.onSelectAllToggle(createOptionSelectionEvent(false, false));

      expect(component.selectedItemsValues()).toEqual([1, 2]);
    });
  });

  describe('onOptionToggle', () => {
    it('adds an item when the user selects it', () => {
      const control = new FormControl<number[]>([]);

      fixture.componentRef.setInput('control', control);
      fixture.componentRef.setInput('items', mockItems);
      fixture.componentRef.setInput('autoSelect', false);
      fixture.detectChanges();

      component.onOptionToggle(createOptionSelectionEvent(true, true), 1);

      expect(component.selectedItemsValues()).toEqual([1]);
    });

    it('does not duplicate an item already selected', () => {
      const control = new FormControl<number[]>([1]);

      fixture.componentRef.setInput('control', control);
      fixture.componentRef.setInput('items', mockItems);
      fixture.componentRef.setInput('autoSelect', false);
      fixture.detectChanges();
      component.selectedItemsValues.set([1]);

      component.onOptionToggle(createOptionSelectionEvent(true, true), 1);

      expect(component.selectedItemsValues()).toEqual([1]);
    });

    it('removes an item when the user deselects it', () => {
      const control = new FormControl<number[]>([]);

      fixture.componentRef.setInput('control', control);
      fixture.componentRef.setInput('items', mockItems);
      fixture.componentRef.setInput('autoSelect', false);
      fixture.detectChanges();
      component.selectedItemsValues.set([1, 2]);

      component.onOptionToggle(createOptionSelectionEvent(true, false), 1);

      expect(component.selectedItemsValues()).toEqual([2]);
    });

    it('does nothing on a non-user-input event', () => {
      const control = new FormControl<number[]>([]);

      fixture.componentRef.setInput('control', control);
      fixture.componentRef.setInput('items', mockItems);
      fixture.componentRef.setInput('autoSelect', false);
      fixture.detectChanges();
      component.selectedItemsValues.set([1]);

      component.onOptionToggle(createOptionSelectionEvent(false, true), 2);

      expect(component.selectedItemsValues()).toEqual([1]);
    });
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

    it('does not pin an already-selected item that does not match the current search text', () => {
      fixture.componentRef.setInput('control', new FormControl<number[]>([]));
      fixture.componentRef.setInput('items', mockItems);
      fixture.componentRef.setInput('autoSelect', false);
      fixture.detectChanges();

      component.selectedItemsValues.set([2]);

      component.onSearch(createSearchEvent('Option 1'));

      expect(component.filteredScrollItems()).toEqual([mockItems[0]]);
    });

    it('does not pin an unselected item that does not match the search text', () => {
      fixture.componentRef.setInput('control', new FormControl<number[]>([]));
      fixture.componentRef.setInput('items', mockItems);
      fixture.componentRef.setInput('autoSelect', false);
      fixture.detectChanges();

      component.selectedItemsValues.set([]);

      component.onSearch(createSearchEvent('Option 1'));

      expect(component.filteredScrollItems()).toEqual([mockItems[0]]);
    });

    it('keeps a selection made across two different searches (end-to-end regression)', () => {
      fixture.componentRef.setInput('control', new FormControl<number[]>([]));
      fixture.componentRef.setInput('items', mockItems);
      fixture.componentRef.setInput('autoSelect', false);
      fixture.detectChanges();

      component.onSearch(createSearchEvent('Option 1'));
      component.onOptionToggle(createOptionSelectionEvent(true, true), 1);

      component.onSearch(createSearchEvent('Option 2'));
      component.onOptionToggle(createOptionSelectionEvent(true, true), 2);

      expect(component.selectedItemsValues()).toEqual([1, 2]);
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

    it('recalculates the virtual scroll viewport size when opening', fakeAsync(() => {
      const manyItems: MultipleSelectItem[] = Array.from(
        { length: 250 },
        (_, i) => ({ label: `Option ${i}`, value: i })
      );
      spyOn(component.openedChange, 'emit');
      fixture.componentRef.setInput('control', new FormControl<number[]>([]));
      fixture.componentRef.setInput('items', manyItems);
      fixture.componentRef.setInput('autoSelect', false);
      fixture.detectChanges();
      tick();

      expect(component.useVirtualScroll()).toBeTrue();

      const viewport = component.virtualScrollViewport();
      expect(viewport).toBeTruthy();
      const checkViewportSizeSpy = spyOn(viewport!, 'checkViewportSize');

      component.handleOpenedChange(true);
      tick();

      expect(checkViewportSizeSpy).toHaveBeenCalled();
      expect(component.openedChange.emit).toHaveBeenCalledWith(true);
    }));

    it('does not touch the viewport when closing', fakeAsync(() => {
      const manyItems: MultipleSelectItem[] = Array.from(
        { length: 250 },
        (_, i) => ({ label: `Option ${i}`, value: i })
      );
      fixture.componentRef.setInput('control', new FormControl<number[]>([]));
      fixture.componentRef.setInput('items', manyItems);
      fixture.componentRef.setInput('autoSelect', false);
      fixture.detectChanges();
      tick();

      const viewport = component.virtualScrollViewport();
      const checkViewportSizeSpy = spyOn(viewport!, 'checkViewportSize');

      component.handleOpenedChange(false);
      tick();

      expect(checkViewportSizeSpy).not.toHaveBeenCalled();
    }));
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

    it('does not overwrite a preloaded selection (edit mode)', fakeAsync(() => {
      const control = new FormControl<number[]>([2]);
      fixture.componentRef.setInput('control', control);
      fixture.componentRef.setInput('items', mockItems);

      fixture.detectChanges();
      tick();

      expect(control.value).toEqual([2]);
      expect(component.selectedItemsValues()).toEqual([2]);
    }));
  });
});
