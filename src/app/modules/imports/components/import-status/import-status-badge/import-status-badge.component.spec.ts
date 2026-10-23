import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { ImportStatusBadgeComponent } from './import-status-badge.component';
import { ImportJobStatus } from '@core/models/import-job.model';

describe('ImportStatusBadgeComponent', () => {
  let fixture: ComponentFixture<ImportStatusBadgeComponent>;
  let component: ImportStatusBadgeComponent;

  function create(status: ImportJobStatus) {
    fixture = TestBed.createComponent(ImportStatusBadgeComponent);
    component = fixture.componentInstance;
    component.status = status;
    fixture.detectChanges();
  }

  function getBadgeElement(): HTMLSpanElement {
    return fixture.debugElement.query(By.css('.status-badge'))
      .nativeElement as HTMLSpanElement;
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportStatusBadgeComponent],
    }).compileComponents();
  });

  it('should create', () => {
    create('Queued');
    expect(component).toBeTruthy();
  });

  const expectedLabels: Record<ImportJobStatus, string> = {
    Queued: 'Queued',
    Running: 'Running',
    Completed: 'Completed',
    Failed: 'Failed',
    PartiallyCompleted: 'Partially completed',
    Extracting: 'Extracting',
    Extracted: 'Extracted',
    Ready: 'Ready',
    Importing: 'Importing',
    Skipped: 'Skipped',
  };

  const expectedClasses: Record<ImportJobStatus, string> = {
    Queued: 'status-queued',
    Running: 'status-running',
    Completed: 'status-completed',
    Failed: 'status-failed',
    PartiallyCompleted: 'status-partial',
    Extracting: 'status-running',
    Extracted: 'status-queued',
    Ready: 'status-completed',
    Importing: 'status-running',
    Skipped: 'status-skipped',
  };

  (Object.keys(expectedLabels) as ImportJobStatus[]).forEach(status => {
    it(`should render label "${expectedLabels[status]}" for status "${status}"`, () => {
      create(status);
      expect(getBadgeElement().textContent?.trim()).toBe(
        expectedLabels[status]
      );
    });

    it(`should apply css class "${expectedClasses[status]}" for status "${status}"`, () => {
      create(status);
      expect(
        getBadgeElement().classList.contains(expectedClasses[status])
      ).toBeTrue();
    });
  });

  it('should fall back to the raw status as label when unmapped', () => {
    create('SomethingUnexpected' as ImportJobStatus);
    expect(getBadgeElement().textContent?.trim()).toBe('SomethingUnexpected');
  });

  it('should fall back to status-queued as css class when unmapped', () => {
    create('SomethingUnexpected' as ImportJobStatus);
    expect(getBadgeElement().classList.contains('status-queued')).toBeTrue();
  });
});
