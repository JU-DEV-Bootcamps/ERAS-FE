import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSelectHarness } from '@angular/material/select/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { SelectAllDirective } from './select-all.directive';
import { CommonModule, NgFor } from '@angular/common';

type TestOption = { id: number; name: string } | string;

@Component({
  template: `
    <mat-form-field>
      <mat-select [formControl]="control" multiple>
        <mat-option [value]="'allValues'" appSelectAll [allValues]="allValues"
          >Select All</mat-option
        >
        <mat-option
          *ngFor="let item of allValues"
          [value]="isObject(item) ? item.id : item"
        >
          {{ isObject(item) ? item.name : item }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    ReactiveFormsModule,
    SelectAllDirective,
    NgFor,
  ],
})
class TestHostComponent {
  control = new FormControl<TestOption[] | number[] | string[]>([]);
  allValues: TestOption[] = [];

  isObject(item: TestOption): item is { id: number; name: string } {
    return (
      typeof item === 'object' &&
      item !== null &&
      'id' in item &&
      'name' in item
    );
  }
}

describe('SelectAllDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let loader: HarnessLoader;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
  });

  it('should select all ids for array of objects with id', async () => {
    component.allValues = [
      { id: 1, name: 'One' },
      { id: 2, name: 'Two' },
      { id: 3, name: 'Three' },
    ];
    fixture.detectChanges();

    const select = await loader.getHarness(MatSelectHarness);
    await select.open();
    const options = await select.getOptions();
    await options[0].click(); // "Select All" is always the first option

    expect(component.control.value).toEqual([1, 2, 3]);
  });

  it('should select all values for array of strings', async () => {
    component.allValues = ['A', 'B', 'C'];
    fixture.detectChanges();

    const select = await loader.getHarness(MatSelectHarness);
    await select.open();
    const options = await select.getOptions();
    await options[0].click();

    expect(component.control.value).toEqual(['A', 'B', 'C']);
  });

  it('should clear selection when select all is deselected', async () => {
    component.allValues = ['A', 'B', 'C'];
    component.control.setValue(['A', 'B', 'C']);
    fixture.detectChanges();

    const select = await loader.getHarness(MatSelectHarness);
    await select.open();
    const options = await select.getOptions();
    await options[0].click(); // was selected -> this deselects it

    expect(component.control.value).toEqual([]);
  });

  it('should not include "Select All" value in form control', async () => {
    component.allValues = ['A', 'B', 'C'];
    fixture.detectChanges();

    const select = await loader.getHarness(MatSelectHarness);
    await select.open();
    const options = await select.getOptions();
    await options[0].click();

    expect(component.control.value).toEqual(['A', 'B', 'C']);
    expect(component.control.value).not.toContain('Select All');
  });
});
