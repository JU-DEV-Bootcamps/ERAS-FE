import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportPreviewStudentsComponent } from './import-preview-students.component';
import { PreviewRow } from '@shared/components/list/types/preview';
import { ActivatedRoute } from '@angular/router';

describe('ImportPreviewStudentsComponent', () => {
  let fixture: ComponentFixture<ImportPreviewStudentsComponent>;
  let component: ImportPreviewStudentsComponent;

  function create(rows: PreviewRow[] = []) {
    fixture = TestBed.createComponent(ImportPreviewStudentsComponent);
    component = fixture.componentInstance;
    component.rows = rows;
    fixture.detectChanges();
  }

  function row(errors: string[] = []): PreviewRow {
    return {
      data: {
        studentId: 1,
        name: 'Test',
        email: 'test@mail.com',
        uuid: '1',
      },
      errors,
    };
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportPreviewStudentsComponent],
      providers: [{ provide: ActivatedRoute, useValue: {} }],
    }).compileComponents();
  });

  it('should create', () => {
    create();
    expect(component).toBeTruthy();
  });

  it('should map rows on init', () => {
    create([row(), row(['error'])]);

    expect(component.previewDataRows.length).toBe(2);
    expect(component.previewDataRows[0].isSelected).toBeTrue();
    expect(component.previewDataRows[1].isSelected).toBeFalse();
  });

  it('should count error rows', () => {
    create([row(), row(['err'])]);

    expect(component.errorRowCount).toBe(1);
  });

  it('should count selected valid rows', () => {
    create([row(), row(['err'])]);

    expect(component.selectedValidCount).toBe(1);
  });

  it('should toggle all selections', () => {
    create([row(), row()]);

    component.toggleAll(false);
    expect(component.previewDataRows.every(r => !r.isSelected)).toBeTrue();

    component.toggleAll(true);
    expect(component.previewDataRows.every(r => r.isSelected)).toBeTrue();
  });

  it('should emit confirmed with valid rows only', () => {
    create([row(), row(['err'])]);

    spyOn(component.confirmed, 'emit');

    component.onConfirm();

    expect(component.confirmed.emit).toHaveBeenCalled();
    const arg = (component.confirmed.emit as jasmine.Spy).calls.mostRecent()
      .args[0];

    expect(arg.rows.length).toBe(1);
  });

  it('should NOT emit confirmed if no valid rows', () => {
    create([row(['err'])]);

    spyOn(component.confirmed, 'emit');

    component.onConfirm();

    expect(component.confirmed.emit).not.toHaveBeenCalled();
  });

  it('should emit cancelled', () => {
    create();

    spyOn(component.cancelled, 'emit');

    component.onCancel();

    expect(component.cancelled.emit).toHaveBeenCalled();
  });
});
