import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SelectVirtualScrollComponent } from './select-virtual-scroll.component';

describe('SelectVirtualScrollComponent', () => {
  let component: SelectVirtualScrollComponent;
  let fixture: ComponentFixture<SelectVirtualScrollComponent>;

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
});
