import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { ImportModalComponent } from './import-modal.component';
import { ImportModalConfig } from '@core/models/import-modal-config.model';

const DEFAULT_CONFIG: ImportModalConfig = {
  title: 'Import Students',
  acceptedMimeType: 'text/csv',
  acceptedExtensionLabel: '(.csv)',
  maxFileSizeBytes: 5 * 1024 * 1024,
  description:
    'Import a CSV file with the following columns: Name, Email, SIS Id.',
  templateUrl: '/assets/templates/students-template.csv',
  templateLabel: 'example template',
};

function makeFile(
  name = 'students.csv',
  type = 'text/csv',
  sizeBytes = 1024
): File {
  const content = new Uint8Array(sizeBytes);
  return new File([content], name, { type });
}

function dropFile(
  fixture: ComponentFixture<ImportModalComponent>,
  file: File
): void {
  const dropZone = fixture.debugElement.query(
    By.css('.import-modal__drop-zone')
  ).nativeElement as HTMLElement;

  const dt = {
    files: { 0: file, length: 1, item: () => file },
  } as unknown as DataTransfer;

  dropZone.dispatchEvent(
    Object.assign(new Event('drop', { bubbles: true }), { dataTransfer: dt })
  );
  fixture.detectChanges();
}

describe('ImportModalComponent', () => {
  let component: ImportModalComponent;
  let fixture: ComponentFixture<ImportModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ImportModalComponent,
        NoopAnimationsModule,
        MatProgressSpinnerModule,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ImportModalComponent);
    component = fixture.componentInstance;
    component.config = { ...DEFAULT_CONFIG };
    fixture.detectChanges();
  });

  describe('rendering', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display the configured title', () => {
      const title = fixture.debugElement.query(By.css('.import-modal__title'))
        .nativeElement as HTMLElement;
      expect(title.textContent?.trim()).toBe(DEFAULT_CONFIG.title);
    });

    it('should display the description when provided', () => {
      const desc = fixture.debugElement.query(
        By.css('.import-modal__description p')
      );
      expect(desc).toBeTruthy();
      expect(desc.nativeElement.textContent).toContain(
        DEFAULT_CONFIG.description
      );
    });

    it('should not render description when omitted', () => {
      component.config = { ...DEFAULT_CONFIG, description: undefined };
      fixture.detectChanges();
      const desc = fixture.debugElement.query(
        By.css('.import-modal__description')
      );
      expect(desc).toBeNull();
    });

    it('should display template link when templateUrl is provided', () => {
      const link = fixture.debugElement.query(By.css('.import-modal__link'));
      expect(link).toBeTruthy();
      expect(link.nativeElement.getAttribute('href')).toBe(
        DEFAULT_CONFIG.templateUrl
      );
    });

    it('should hide template link when templateUrl is omitted', () => {
      component.config = { ...DEFAULT_CONFIG, templateUrl: undefined };
      fixture.detectChanges();
      const link = fixture.debugElement.query(By.css('.import-modal__link'));
      expect(link).toBeNull();
    });

    it('should disable the Import button when no file is selected', () => {
      const importBtn = fixture.debugElement.query(
        By.css('.import-modal__btn--import')
      ).nativeElement as HTMLButtonElement;
      expect(importBtn.disabled).toBeTrue();
    });

    it('should disable the Import button while loading', () => {
      component.selectedFile = makeFile();
      component.isLoading = true;
      fixture.detectChanges();
      const importBtn = fixture.debugElement.query(
        By.css('.import-modal__btn--import')
      ).nativeElement as HTMLButtonElement;
      expect(importBtn.disabled).toBeTrue();
    });
  });

  describe('file validation', () => {
    it('should accept a valid CSV file', () => {
      const file = makeFile('data.csv', 'text/csv', 1024);
      component['processFile'](file);
      fixture.detectChanges();

      expect(component.selectedFile).toBe(file);
      expect(component.fileError).toBeNull();
    });

    it('should reject a file with an unsupported MIME type', () => {
      const file = makeFile('data.xlsx', 'application/vnd.ms-excel', 1024);
      component['processFile'](file);
      fixture.detectChanges();

      expect(component.selectedFile).toBeNull();
      expect(component.fileError).toContain('Invalid file type');
    });

    it('should reject a file that exceeds the maximum size', () => {
      const tooBig = makeFile('big.csv', 'text/csv', 6 * 1024 * 1024);
      component['processFile'](tooBig);
      fixture.detectChanges();

      expect(component.selectedFile).toBeNull();
      expect(component.fileError).toContain('maximum size');
    });

    it('should display error message in the DOM on rejection', () => {
      const badFile = makeFile('bad.txt', 'text/plain', 512);
      component['processFile'](badFile);
      fixture.detectChanges();

      const errorEl = fixture.debugElement.query(
        By.css('.import-modal__error')
      );
      expect(errorEl).toBeTruthy();
      expect(errorEl.nativeElement.textContent).toContain('Invalid file type');
    });

    it('should clear errors when a valid file replaces an invalid one', () => {
      component['processFile'](makeFile('bad.txt', 'text/plain'));
      fixture.detectChanges();
      expect(component.fileError).toBeTruthy();

      component['processFile'](makeFile('good.csv', 'text/csv'));
      fixture.detectChanges();
      expect(component.fileError).toBeNull();
      expect(component.selectedFile).toBeTruthy();
    });
  });

  describe('drag and drop', () => {
    it('should set isDragOver to true on dragover', () => {
      const dropZone = fixture.debugElement.query(
        By.css('.import-modal__drop-zone')
      ).nativeElement as HTMLElement;

      dropZone.dispatchEvent(new DragEvent('dragover', { bubbles: true }));
      fixture.detectChanges();
      expect(component.isDragOver).toBeTrue();
    });

    it('should set isDragOver to false on dragleave', () => {
      component.isDragOver = true;
      const dropZone = fixture.debugElement.query(
        By.css('.import-modal__drop-zone')
      ).nativeElement as HTMLElement;

      dropZone.dispatchEvent(new DragEvent('dragleave', { bubbles: true }));
      fixture.detectChanges();
      expect(component.isDragOver).toBeFalse();
    });

    it('should accept a valid dropped file', () => {
      dropFile(fixture, makeFile('drop.csv', 'text/csv'));
      expect(component.selectedFile).toBeTruthy();
      expect(component.fileError).toBeNull();
    });

    it('should reject an invalid dropped file', () => {
      dropFile(fixture, makeFile('drop.png', 'image/png'));
      expect(component.selectedFile).toBeNull();
      expect(component.fileError).toBeTruthy();
    });
  });

  describe('removeFile()', () => {
    it('should clear selectedFile and fileError', () => {
      component.selectedFile = makeFile();
      component.fileError = 'some error';

      component.removeFile();
      fixture.detectChanges();

      expect(component.selectedFile).toBeNull();
      expect(component.fileError).toBeNull();
    });
  });

  describe('fileSizeLabel', () => {
    it('should return empty string when no file is selected', () => {
      expect(component.fileSizeLabel).toBe('');
    });

    it('should format bytes below 1 MB as KB', () => {
      component.selectedFile = makeFile('f.csv', 'text/csv', 512 * 1024); // 512 KB
      expect(component.fileSizeLabel).toContain('KB');
    });

    it('should format bytes above 1 MB as MB', () => {
      component.selectedFile = makeFile('f.csv', 'text/csv', 2 * 1024 * 1024); // 2 MB
      expect(component.fileSizeLabel).toContain('MB');
    });
  });
});
