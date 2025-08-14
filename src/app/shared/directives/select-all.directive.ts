import {
  AfterViewInit,
  Directive,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import { MatOption, MatSelect } from '@angular/material/select';
import { Subscription } from 'rxjs';

type SelectAllValue = { id: number } | number | string;

@Directive({
  selector: 'mat-option[appSelectAll]',
  standalone: true,
})
export class SelectAllDirective<T extends SelectAllValue>
  implements AfterViewInit, OnDestroy
{
  allValues = input.required<T[]>();

  private _matSelect = inject(MatSelect);
  private _matOption = inject(MatOption);

  private _subscriptions: Subscription[] = [];

  private getAllIds(): number[] | string[] {
    const all = this.allValues();
    if (typeof all[0] === 'object' && all[0] !== null && 'id' in all[0]) {
      return (all as { id: number }[]).map(item => item.id);
    }
    return typeof all[0] == 'string' ? (all as string[]) : (all as number[]);
  }

  private isAllSelected(selected: T[]): boolean {
    const allIds = this.getAllIds();
    const selectedIds = Array.isArray(selected)
      ? selected.map((item: T) =>
          typeof item === 'object' && item !== null && 'id' in item
            ? item.id
            : item
        )
      : [];
    console.log(allIds.length === selectedIds.length);
    return allIds.length === selectedIds.length;
  }

  ngAfterViewInit(): void {
    const parentSelect = this._matSelect;
    const parentFormControl = parentSelect.ngControl.control;

    // When select all option is clicked
    this._subscriptions.push(
      this._matOption.onSelectionChange.subscribe(event => {
        if (event.isUserInput) {
          if (event.source.selected) {
            parentFormControl?.setValue(this.getAllIds());
            this._matOption.select(false);
          } else {
            parentFormControl?.setValue([]);
            this._matOption.deselect(false);
          }
        }
      })
    );
    // For changing select all based on other option selection
    this._subscriptions.push(
      parentSelect.optionSelectionChanges.subscribe(v => {
        if (v.isUserInput && v.source.value !== this._matOption.value) {
          if (!v.source.selected) {
            this._matOption.deselect(false);
          } else {
            if (this.isAllSelected(parentFormControl?.value || [])) {
              this._matOption.select(false);
            }
          }
        }
      })
    );
    // If user has kept all values selected in select's form-control from the beginning
    setTimeout(() => {
      if (this.isAllSelected(parentFormControl?.value || [])) {
        this._matOption.select(false);
      }
    });
  }

  ngOnDestroy(): void {
    this._subscriptions.forEach(s => s.unsubscribe());
  }
}
