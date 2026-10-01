import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ExportLoadingOverlayComponent } from './export-loading-overlay.component';
import { ExportStateService } from '@core/services/exports/export-state.service';

function makeServiceStub(
  overrides: Partial<{
    shouldShowOverlay: boolean;
    message: string;
    progress: number;
    exportType: 'csv' | 'pdf' | null;
  }> = {}
) {
  const cfg = {
    shouldShowOverlay: false,
    message: '',
    progress: 0,
    exportType: null as 'csv' | 'pdf' | null,
    ...overrides,
  };

  return {
    shouldShowOverlay: signal(cfg.shouldShowOverlay),
    message: signal(cfg.message),
    progress: signal(cfg.progress),
    exportType: signal(cfg.exportType),
  };
}

describe('ExportLoadingOverlayComponent', () => {
  let component: ExportLoadingOverlayComponent;
  let fixture: ComponentFixture<ExportLoadingOverlayComponent>;
  let serviceStub: ReturnType<typeof makeServiceStub>;

  async function setup(overrides: Parameters<typeof makeServiceStub>[0] = {}) {
    serviceStub = makeServiceStub(overrides);

    await TestBed.configureTestingModule({
      imports: [ExportLoadingOverlayComponent, NoopAnimationsModule],
      providers: [{ provide: ExportStateService, useValue: serviceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(ExportLoadingOverlayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('should create', async () => {
    await setup();
    expect(component).toBeTruthy();
  });

  describe('showOverlay computed signal', () => {
    it('is false when service.shouldShowOverlay is false', async () => {
      await setup({ shouldShowOverlay: false });
      expect(component.showOverlay()).toBeFalse();
    });

    it('is true when service.shouldShowOverlay is true', async () => {
      await setup({ shouldShowOverlay: true });
      expect(component.showOverlay()).toBeTrue();
    });
  });

  describe('displayMessage computed signal', () => {
    it('reflects the service message', async () => {
      await setup({ message: 'Exporting to CSV...' });
      expect(component.displayMessage()).toBe('Exporting to CSV...');
    });

    it('is empty string by default', async () => {
      await setup();
      expect(component.displayMessage()).toBe('');
    });
  });

  describe('progress computed signal', () => {
    it('reflects service progress value', async () => {
      await setup({ progress: 42 });
      expect(component.progress()).toBe(42);
    });

    it('is 0 by default', async () => {
      await setup();
      expect(component.progress()).toBe(0);
    });
  });

  describe('exportType computed signal', () => {
    it('is null by default', async () => {
      await setup();
      expect(component.exportType()).toBeNull();
    });

    it('reflects csv type', async () => {
      await setup({ exportType: 'csv' });
      expect(component.exportType()).toBe('csv');
    });

    it('reflects pdf type', async () => {
      await setup({ exportType: 'pdf' });
      expect(component.exportType()).toBe('pdf');
    });
  });

  describe('showProgressBar computed signal', () => {
    it('is true only for pdf export type', async () => {
      await setup({ exportType: 'pdf' });
      expect(component.showProgressBar()).toBeTrue();
    });

    it('is false for csv export type', async () => {
      await setup({ exportType: 'csv' });
      expect(component.showProgressBar()).toBeFalse();
    });

    it('is false when exportType is null', async () => {
      await setup({ exportType: null });
      expect(component.showProgressBar()).toBeFalse();
    });
  });

  describe('overlayLabel computed signal', () => {
    it('includes the current display message', async () => {
      await setup({ message: 'Generating PDF...' });
      expect(component.overlayLabel()).toContain('Generating PDF...');
    });

    it('starts with "Export in progress:"', async () => {
      await setup({ message: 'test' });
      expect(component.overlayLabel()).toBe('Export in progress: test');
    });

    it('works with empty message', async () => {
      await setup();
      expect(component.overlayLabel()).toBe('Export in progress: ');
    });
  });

  describe('template rendering', () => {
    it('renders nothing when showOverlay is false', async () => {
      await setup({ shouldShowOverlay: false });
      const overlay = fixture.nativeElement.querySelector('.export-overlay');
      expect(overlay).toBeNull();
    });

    it('renders the overlay div when showOverlay is true', async () => {
      await setup({ shouldShowOverlay: true });
      const overlay = fixture.nativeElement.querySelector('.export-overlay');
      expect(overlay).not.toBeNull();
    });

    it('renders the progress bar for pdf', async () => {
      await setup({ shouldShowOverlay: true, exportType: 'pdf' });
      const progressBar =
        fixture.nativeElement.querySelector('mat-progress-bar');
      expect(progressBar).not.toBeNull();
    });

    it('does not render the progress bar for csv', async () => {
      await setup({ shouldShowOverlay: true, exportType: 'csv' });
      const progressBar =
        fixture.nativeElement.querySelector('mat-progress-bar');
      expect(progressBar).toBeNull();
    });

    it('does not render the progress bar when exportType is null', async () => {
      await setup({ shouldShowOverlay: true, exportType: null });
      const progressBar =
        fixture.nativeElement.querySelector('mat-progress-bar');
      expect(progressBar).toBeNull();
    });

    it('displays the message text inside the overlay', async () => {
      await setup({ shouldShowOverlay: true, message: 'Exporting to CSV...' });
      const label = fixture.nativeElement.querySelector(
        '.export-overlay-label'
      );
      expect(label?.textContent?.trim()).toBe('Exporting to CSV...');
    });

    it('sets aria-label on the status div', async () => {
      await setup({ shouldShowOverlay: true, message: 'Exporting...' });
      const statusDiv = fixture.nativeElement.querySelector('[role="status"]');
      expect(statusDiv?.getAttribute('aria-label')).toBe(
        'Export in progress: Exporting...'
      );
    });
  });
});
