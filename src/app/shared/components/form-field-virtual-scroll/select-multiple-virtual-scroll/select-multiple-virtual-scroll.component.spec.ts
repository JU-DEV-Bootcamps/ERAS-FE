import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SelectMultipleVirtualScrollComponent } from './select-multiple-virtual-scroll.component';
import { Item, SelectGroup } from '../interfaces/select';

describe('SelectMultipleVirtualScrollComponent', () => {
  let component: SelectMultipleVirtualScrollComponent;
  let fixture: ComponentFixture<SelectMultipleVirtualScrollComponent>;

  const mockItems: Item[] = [
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
    expect(component.scrollItems()).toEqual(expected as Item[]);
  });

  it('should calculate scrollItemsValues', () => {
    fixture.componentRef.setInput('control', new FormControl([]));
    fixture.componentRef.setInput('groups', mockGroups);

    fixture.detectChanges();

    expect(component.scrollItemsValues()).toEqual(['a1', 'a2']);
  });

  it('should emit event openedChange(false) when items initialize', () => {
    spyOn(component.openedChange, 'emit');
    fixture.componentRef.setInput('control', new FormControl([]));
    fixture.componentRef.setInput('items', mockItems);

    fixture.detectChanges();

    expect(component.openedChange.emit).toHaveBeenCalledWith(false);
  });

  it('should return ["Select all"] when all elements are selected', () => {
    const control = new FormControl([1, 2]);
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('items', mockItems);

    fixture.detectChanges();

    const selection = component.getItemSelection();
    expect(selection).toEqual(['Select all']);
  });

  it('should return [""] when control has no value', () => {
    const control = new FormControl(null);
    fixture.componentRef.setInput('control', control);

    fixture.detectChanges();

    expect(component.getItemSelection()).toEqual(['']);
  });

  it('should return true when type is group', () => {
    const item: Item = { label: 'Test', type: 'group' };
    expect(component.isGroupItem(item)).toBeTrue();
  });

  it('should return false when type is not group', () => {
    const item: Item = { label: 'Test', value: 1 };
    expect(component.isGroupItem(item)).toBeFalse();
  });
});
