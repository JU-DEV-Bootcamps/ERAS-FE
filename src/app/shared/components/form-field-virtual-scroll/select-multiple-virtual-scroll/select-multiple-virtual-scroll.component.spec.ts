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
import { MatSelect } from '@angular/material/select';

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

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        SelectMultipleVirtualScrollComponent,
        ReactiveFormsModule,
        BrowserAnimationsModule, // Necesario para componentes de Angular Material
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SelectMultipleVirtualScrollComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('control', new FormControl([]));
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should build scrollItems based on simple items', () => {
    fixture.componentRef.setInput('control', new FormControl([]));
    fixture.componentRef.setInput('items', mockItems);

    fixture.detectChanges();

    expect(component.scrollItems()).toEqual(mockItems);
  });

  it('should build scrollItems based on groups when empty', () => {
    fixture.componentRef.setInput('control', new FormControl([]));
    fixture.componentRef.setInput('items', []);
    fixture.componentRef.setInput('groups', mockGroups);

    fixture.detectChanges();

    const expected = [
      { label: 'Group A', type: 'group' },
      { label: 'Item A1', value: 'a1' },
      { label: 'Item A2', value: 'a2' },
    ];
    expect(component.scrollItems()).toEqual(expected as MultipleSelectItem[]);
  });

  it('should calculate scrollItemsValues', () => {
    fixture.componentRef.setInput('control', new FormControl([]));
    fixture.componentRef.setInput('groups', mockGroups);

    fixture.detectChanges();

    expect(component.scrollItemsValues()).toEqual(['a1', 'a2']);
  });

  it('should emit event openedChange(false) when items initialize', fakeAsync(() => {
    spyOn(component.openedChange, 'emit');
    fixture.componentRef.setInput('control', new FormControl([]));
    fixture.componentRef.setInput('items', mockItems);

    fixture.detectChanges();

    tick();
    expect(component.openedChange.emit).toHaveBeenCalledWith(false);
  }));

  it('should return ["Select all"] when all elements are selected', () => {
    const control = new FormControl([1, 2]);
    const mockItemsValues = mockItems.map(
      item => (item as MultipleSelectCommonItem).value
    );
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('items', mockItems);
    fixture.componentInstance.selectedItemsValues.set(mockItemsValues);

    fixture.detectChanges();

    const selection = component.getItemSelection();
    expect(selection).toEqual(['Select all']);
  });

  it('should return empty array when no element has been selected', () => {
    const control = new FormControl([]);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('items', mockItems);
    fixture.componentInstance.selectedItemsValues.set([]);

    fixture.detectChanges();

    expect(component.getItemSelection()).toEqual([]);
  });

  it('should return true when type is group', () => {
    const item: MultipleSelectItem = { label: 'Test', type: 'group' };
    expect(component.isGroupItem(item)).toBeTrue();
  });

  it('should return false when type is not group', () => {
    const item: MultipleSelectItem = { label: 'Test', value: 1 };
    expect(component.isGroupItem(item)).toBeFalse();
  });

  it('should contain all items if Select all has been checked', () => {
    const control = new FormControl();
    const selection = { source: {} as MatSelect, value: ['allValues'] };
    const mockItemsValues = mockItems.map(
      item => (item as MultipleSelectCommonItem).value
    );

    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('items', mockItems);
    fixture.componentInstance.updateSelection(selection);

    fixture.detectChanges();

    expect(component.selectedItemsValues()).toEqual(mockItemsValues);
  });

  it('should add an item if selected', () => {
    const control = new FormControl();
    const selection = { source: {} as MatSelect, value: [3] };

    fixture.componentRef.setInput('control', control);
    fixture.componentInstance.updateSelection(selection);

    fixture.detectChanges();

    expect(component.selectedItemsValues()).toEqual([3]);
  });

  it('should remove item if deselected', () => {
    const control = new FormControl();
    const selection = { source: {} as MatSelect, value: [1] };

    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('items', mockItems);
    fixture.componentInstance.selectedItemsValues.set([1, 2]);
    fixture.componentInstance.onSearch({
      target: { value: 'Option' },
    } as unknown as Event);
    fixture.componentInstance.updateSelection(selection);

    fixture.detectChanges();

    expect(component.selectedItemsValues()).toEqual([1]);
  });

  it('should load control values for edit scenarios', () => {
    const control = new FormControl([1, 2]);
    fixture.componentRef.setInput('control', control);

    fixture.detectChanges();

    expect(component.selectedItemsValues()).toEqual([1, 2]);
  });
});
