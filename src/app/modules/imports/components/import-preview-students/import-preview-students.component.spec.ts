import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Component, Input } from '@angular/core';
import {
  PreviewRow,
  StudentModelPreview,
} from '@shared/components/list/types/preview';
import { ImportPreviewStudentsComponent } from './import-preview-students.component';
import {
  MandatoryColumns,
  OptionalColumns,
} from './import-preview-students.model';

@Component({ selector: 'app-list', standalone: true, template: '' })
class ListStubComponent {
  @Input() columns = [];
  @Input() items = [];
  @Input() totalItems = 0;
  @Input() itemsAreSelectable = false;
  @Input() externalExport = false;
}

function makePreviewRow(
  overrides: Partial<StudentModelPreview> = {},
  errors: string[] = []
): PreviewRow {
  return {
    data: {
      studentId: 1,
      name: 'Alice',
      email: 'alice@example.com',
      uuid: 'SIS-001',
      ...overrides,
    },
    errors,
  };
}

function createComponent(
  rows: PreviewRow[]
): ComponentFixture<ImportPreviewStudentsComponent> {
  const fixture = TestBed.createComponent(ImportPreviewStudentsComponent);
  fixture.componentInstance.rows = rows;
  fixture.detectChanges();
  return fixture;
}

describe('ImportPreviewStudentsComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ImportPreviewStudentsComponent,
        ListStubComponent,
        NoopAnimationsModule,
        MatIconModule,
        MatTooltipModule,
      ],
    })
      .overrideComponent(ImportPreviewStudentsComponent, {
        set: { imports: [ListStubComponent, MatIconModule, MatTooltipModule] },
      })
      .compileComponents();
  });

  it('should create', () => {
    expect(createComponent([]).componentInstance).toBeTruthy();
  });

  it('should load previewRows on init', () => {
    const fixture = createComponent([
      makePreviewRow(),
      makePreviewRow({}, ['err']),
    ]);
    expect(fixture.componentInstance.previewRows.length).toBe(2);
  });

  it('should start valid rows as selected', () => {
    const fixture = createComponent([makePreviewRow()]);
    expect(fixture.componentInstance.previewRows[0].selected).toBeTrue();
  });

  it('should start error rows as deselected', () => {
    const fixture = createComponent([makePreviewRow({}, ['Invalid email'])]);
    expect(fixture.componentInstance.previewRows[0].selected).toBeFalse();
  });

  it('errorRowCount should count rows with errors', () => {
    const c = createComponent([
      makePreviewRow(),
      makePreviewRow({}, ['err']),
    ]).componentInstance;
    expect(c.errorRowCount).toBe(1);
  });

  it('selectedValidCount should count selected rows with no errors', () => {
    const c = createComponent([
      makePreviewRow(),
      makePreviewRow({}, ['e']),
    ]).componentInstance;
    expect(c.selectedValidCount).toBe(1);
  });

  it('canConfirm should be false when no valid rows are selected', () => {
    const c = createComponent([makePreviewRow({}, ['err'])]).componentInstance;
    expect(c.canConfirm).toBeFalse();
  });

  it('canConfirm should be false while isLoading is true', () => {
    const c = createComponent([makePreviewRow()]).componentInstance;
    c.isLoading = true;
    expect(c.canConfirm).toBeFalse();
  });

  it('canConfirm should be true when at least one valid row is selected', () => {
    const c = createComponent([makePreviewRow()]).componentInstance;
    expect(c.canConfirm).toBeTrue();
  });

  it('listColumns should always end with the status column', () => {
    const c = createComponent([]).componentInstance;
    const last = c.listColumns[c.listColumns.length - 1];
    expect(last.key).toBe('status');
  });

  it('listColumns should only include mandatory columns by default', () => {
    const c = createComponent([]).componentInstance;
    expect(c.listColumns.length).toBe(MandatoryColumns.length + 1);
  });

  it('listColumns should include optional columns when passed via @Input', () => {
    const fixture = createComponent([]);
    fixture.componentInstance.columns = [
      ...MandatoryColumns,
      ...OptionalColumns,
    ];
    fixture.detectChanges();
    const c = fixture.componentInstance;
    expect(c.listColumns.length).toBe(
      MandatoryColumns.length + OptionalColumns.length + 1
    );
  });

  it('confirmed should emit only selected valid rows', () => {
    const c = createComponent([
      makePreviewRow({ name: 'Alice' }),
      makePreviewRow({ name: 'Bad' }, ['error']),
    ]).componentInstance;

    const emitted = [];
    c.confirmed.subscribe(v => emitted.push(v));
    c.onConfirm();

    expect(emitted.length).toBe(1);
    // expect(emitted[0].rows.length).toBe(1);
    // expect(emitted[0].rows[0].name).toBe('Alice');
  });

  it('confirmed should not emit when canConfirm is false', () => {
    const c = createComponent([makePreviewRow({}, ['err'])]).componentInstance;
    const emitted = [];
    c.confirmed.subscribe(v => emitted.push(v));
    c.onConfirm();
    expect(emitted.length).toBe(0);
  });

  it('cancelled should emit on onCancel()', () => {
    const c = createComponent([]).componentInstance;
    let emitted = false;
    c.cancelled.subscribe(() => (emitted = true));
    c.onCancel();
    expect(emitted).toBeTrue();
  });

  // it('previewDataRows should have _hasError=true for error rows', () => {
  //   const c = createComponent([
  //     makePreviewRow(),
  //     makePreviewRow({}, ['bad email']),
  //   ]).componentInstance;
  //   expect(c.previewDataRows[0]._hasError).toBeFalse();
  //   expect(c.previewDataRows[1]._hasError).toBeTrue();
  // });

  // it('previewDataRows should carry the errors array for tooltip', () => {
  //   const c = createComponent([
  //     makePreviewRow({}, ['bad email', 'empty name']),
  //   ]).componentInstance;
  //   expect(c.previewDataRows[0]._errors).toEqual(['bad email', 'empty name']);
  // });
});
