import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ImportModalComponent } from './import-modal.component';
import { ImportModalConfig } from '@core/models/import-modal-config.model';

describe('ImportModalComponent (simple)', () => {
  let fixture: ComponentFixture<ImportModalComponent>;
  let component: ImportModalComponent;

  const config: ImportModalConfig = {
    title: 'Import',
    acceptedMimeType: 'text/csv',
    acceptedExtensionLabel: '.csv',
    maxFileSizeBytes: 1024 * 1024,
  } as ImportModalConfig;

  function create() {
    fixture = TestBed.createComponent(ImportModalComponent);
    component = fixture.componentInstance;
    component.config = config;
    fixture.detectChanges();
  }

  function file(type = 'text/csv', size = 1000): File {
    return new File([new Uint8Array(size)], 'file.csv', { type });
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImportModalComponent],
    }).compileComponents();
  });

  it('should create', () => {
    create();
    expect(component).toBeTruthy();
  });

  it('should accept valid file', () => {
    create();

    component['processFile'](file());

    expect(component.selectedFile).toBeTruthy();
    expect(component.fileError).toBeNull();
  });

  it('should reject wrong type', () => {
    create();

    component['processFile'](file('image/png'));

    expect(component.selectedFile).toBeNull();
    expect(component.fileError).toContain('Invalid file type');
  });

  it('should reject oversized file', () => {
    create();

    component['processFile'](file('text/csv', 2 * 1024 * 1024));

    expect(component.selectedFile).toBeNull();
    expect(component.fileError).toContain('maximum size');
  });

  it('should toggle drag state', () => {
    create();

    component.onDragOver(new DragEvent('dragover'));
    expect(component.isDragOver).toBeTrue();

    component.onDragLeave(new DragEvent('dragleave'));
    expect(component.isDragOver).toBeFalse();
  });

  it('should process dropped file', () => {
    create();

    const event = {
      preventDefault() {
        /* empty */
      },
      stopPropagation() {
        /* empty */
      },
      dataTransfer: { files: [file()] },
    } as unknown as DragEvent;

    component.onDrop(event);

    expect(component.selectedFile).toBeTruthy();
  });

  it('should return empty size when no file', () => {
    create();
    expect(component.fileSizeLabel).toBe('');
  });

  it('should format KB', () => {
    create();

    component.selectedFile = file('text/csv', 500 * 1024);

    expect(component.fileSizeLabel).toContain('KB');
  });

  it('should format MB', () => {
    create();

    component.selectedFile = file('text/csv', 2 * 1024 * 1024);

    expect(component.fileSizeLabel).toContain('MB');
  });

  it('should emit fileSelected', () => {
    create();

    const f = file();
    component.selectedFile = f;

    spyOn(component.fileSelected, 'emit');

    component.onPreviewImport();

    expect(component.fileSelected.emit).toHaveBeenCalledWith(f);
  });

  it('should NOT emit if no file', () => {
    create();

    spyOn(component.fileSelected, 'emit');

    component.onPreviewImport();

    expect(component.fileSelected.emit).not.toHaveBeenCalled();
  });

  it('should emit cancelled', () => {
    create();

    spyOn(component.cancelled, 'emit');

    component.onCancel();

    expect(component.cancelled.emit).toHaveBeenCalled();
  });

  it('should clear file and error', () => {
    create();

    component.selectedFile = file();
    component.fileError = 'error';

    component.removeFile();

    expect(component.selectedFile).toBeNull();
    expect(component.fileError).toBeNull();
  });
});
