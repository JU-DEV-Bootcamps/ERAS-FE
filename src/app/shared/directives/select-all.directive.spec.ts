import { Component } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatSelectHarness } from '@angular/material/select/testing';
import { MatOptionHarness } from '@angular/material/core/testing';
import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { SelectAllDirective } from './select-all.directive';
import { CommonModule } from '@angular/common';
import { OverlayContainer } from '@angular/cdk/overlay';

interface OptionObject {
  id: number;
  name: string;
}

type TestOption = OptionObject | string;

@Component({
  template: `
    <mat-form-field>
      <mat-select [formControl]="control" multiple>
        <mat-option [value]="'allValues'" appSelectAll [allValues]="allValues">
          Select All
        </mat-option>
        @for (item of allValues; track item) {
          <mat-option [value]="isObject(item) ? item.id : item">
            {{ isObject(item) ? item.name : item }}
          </mat-option>
        }
      </mat-select>
    </mat-form-field>
  `,
  standalone: true,
  imports: [
    CommonModule,
    MatSelectModule,
    ReactiveFormsModule,
    SelectAllDirective,
  ],
})
class TestHostComponent {
  control = new FormControl<(string | number)[]>([]);
  allValues: TestOption[] = [];

  isObject(item: TestOption): item is OptionObject {
    return typeof item === 'object' && item !== null && 'id' in item;
  }
}

describe('SelectAllDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let component: TestHostComponent;
  let loader: HarnessLoader;
  let overlayContainer: OverlayContainer;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    overlayContainer = TestBed.inject(OverlayContainer);
  });

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });

  async function getSelectHarness(): Promise<{
    select: MatSelectHarness;
    options: MatOptionHarness[];
  }> {
    const select = await loader.getHarness(MatSelectHarness);
    await select.open();
    const options = await select.getOptions();
    return { select, options };
  }

  it('should select all ids for array of objects with id', async () => {
    component.allValues = [
      { id: 1, name: 'One' },
      { id: 2, name: 'Two' },
    ];
    fixture.detectChanges();

    const { options } = await getSelectHarness();
    await options[0].click();

    expect(component.control.value).toEqual([1, 2]);
  });

  it('should select all values for array of strings', async () => {
    component.allValues = ['A', 'B'];
    fixture.detectChanges();

    const { options } = await getSelectHarness();
    await options[0].click();

    expect(component.control.value).toEqual(['A', 'B']);
  });

  it('should clear selection when select all is deselected', async () => {
    component.allValues = ['A', 'B'];
    component.control.setValue(['A', 'B']);
    fixture.detectChanges();

    const { options } = await getSelectHarness();
    await options[0].click();

    expect(component.control.value).toEqual([]);
  });

  it('deselects "Select All" when allValues becomes empty', fakeAsync(async () => {
    component.allValues = ['A', 'B'];
    component.control.setValue(['A', 'B']);
    fixture.detectChanges();
    tick();

    const { options } = await getSelectHarness();
    expect(await options[0].isSelected()).toBeTrue();

    component.allValues = [];
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(await options[0].isSelected()).toBeFalse();
  }));

  it('re-evaluates selection state when allValues changes via ngOnChanges', fakeAsync(async () => {
    component.allValues = ['A', 'B'];
    component.control.setValue(['A', 'B']);
    fixture.detectChanges();
    tick();

    const { options: optionsInitial } = await getSelectHarness();
    expect(await optionsInitial[0].isSelected()).toBeTrue();

    component.allValues = ['A', 'B', 'C'];
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const { options: optionsFinal } = await getSelectHarness();
    expect(await optionsFinal[0].isSelected()).toBeFalse();
  }));

  it('auto-checks "Select All" when the last remaining item is selected manually', fakeAsync(async () => {
    component.allValues = ['A', 'B'];
    component.control.setValue(['A']);
    fixture.detectChanges();
    tick();

    const { options } = await getSelectHarness();
    expect(await options[0].isSelected()).toBeFalse();

    await options[2].click();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(await options[0].isSelected()).toBeTrue();
    expect(component.control.value).toEqual(['A', 'B']);
  }));

  it('unchecks "Select All" when an item is deselected', fakeAsync(async () => {
    component.allValues = ['A', 'B'];
    component.control.setValue(['A', 'B']);
    fixture.detectChanges();
    tick();

    const { options } = await getSelectHarness();
    expect(await options[0].isSelected()).toBeTrue();

    await options[1].click();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(await options[0].isSelected()).toBeFalse();
  }));

  it('unsubscribes everything on destroy without throwing', () => {
    component.allValues = ['A', 'B'];
    fixture.detectChanges();
    expect(() => fixture.destroy()).not.toThrow();
  });
});
