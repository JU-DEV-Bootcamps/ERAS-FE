import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSelectChange } from '@angular/material/select';
import { SelectVirtualScrollComponent } from './select-virtual-scroll.component';
import { CommonItem } from '../interfaces/select';

describe('SelectVirtualScrollComponent', () => {
  let component: SelectVirtualScrollComponent;
  let fixture: ComponentFixture<SelectVirtualScrollComponent>;

  const mockItems: CommonItem[] = [
    { label: 'Opcion A', value: 'A' },
    { label: 'Opcion B', value: 'B' },
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

  it('should select first value', () => {
    const control = new FormControl();
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('items', mockItems);

    fixture.detectChanges();

    expect(control.value).toBe('A');
  });

  it('should emit selectionChange event with first value', () => {
    const control = new FormControl();
    spyOn(component.selectionChange, 'emit');

    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('items', mockItems);

    fixture.detectChanges();

    const expectedChange = { value: 'A' } as MatSelectChange;
    expect(component.selectionChange.emit).toHaveBeenCalledWith(expectedChange);
  });

  it('should select first element on colection', () => {
    const control = new FormControl('first');
    fixture.componentRef.setInput('control', control);
    fixture.componentRef.setInput('items', []);

    fixture.detectChanges();

    expect(control.value).toBe('first');
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
});
