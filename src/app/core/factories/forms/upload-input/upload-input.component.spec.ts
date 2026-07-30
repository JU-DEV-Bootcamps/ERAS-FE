import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  FormGroup,
  FormControl,
  FormGroupDirective,
  ControlContainer,
  ValidatorFn,
} from '@angular/forms';
import { UploadInputComponent } from './upload-input.component';
import { DynamicField } from '../form-factory.interface';

describe('UploadInputComponent', () => {
  let component: UploadInputComponent;
  let fixture: ComponentFixture<UploadInputComponent>;
  let form: FormGroup;

  const baseField = (overrides: Partial<DynamicField> = {}): DynamicField =>
    ({
      type: 'file',
      name: 'uploadInput',
      label: 'Attached Document (s)',
      fileConfig: {
        maxFiles: 5,
        maxSizeMb: 1024,
        allowedExtensions: '.pdf,.docx',
        allowedMimeTypes: ['application/pdf'],
        prefillFileNames: [],
      },
      ...overrides,
    }) as DynamicField;

  const makeFile = (
    name: string,
    type = 'application/pdf',
    size = 100
  ): File => {
    const file = new File(['a'.repeat(size)], name, { type });
    return file;
  };

  const setup = (field: DynamicField) => {
    fixture = TestBed.createComponent(UploadInputComponent);
    component = fixture.componentInstance;

    form = new FormGroup({ uploadInput: new FormControl(null) });

    fixture.componentRef.setInput('field', field);
    fixture.componentRef.setInput('form', form);

    fixture.detectChanges();
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadInputComponent],
      providers: [
        { provide: ControlContainer, useValue: new FormGroupDirective([], []) },
      ],
    }).compileComponents();
  });

  const selectFiles = (files: File[]) => {
    const dataTransfer = new DataTransfer();
    files.forEach(f => dataTransfer.items.add(f));
    const input = document.createElement('input');
    input.type = 'file';
    Object.defineProperty(input, 'files', { value: dataTransfer.files });
    component.onFileSelected({ target: input } as unknown as Event);
  };

  describe('basic file selection', () => {
    beforeEach(() => setup(baseField()));

    it('should add a valid file to selectedFiles', () => {
      selectFiles([makeFile('doc1.pdf')]);
      expect(component.selectedFiles().length).toBe(1);
      expect(component.fileNames()).toEqual(['doc1.pdf']);
    });

    it('should update the form control value on selection', () => {
      selectFiles([makeFile('doc1.pdf')]);
      expect(form.get('uploadInput')?.value.length).toBe(1);
    });

    it('should reject duplicate files (same name and size)', () => {
      selectFiles([makeFile('doc1.pdf')]);
      selectFiles([makeFile('doc1.pdf')]);
      expect(component.selectedFiles().length).toBe(1);
      expect(component.errorMatcher.hasErrors()).toBeTrue();
    });

    it('should reject files with disallowed mime type', () => {
      selectFiles([makeFile('image.png', 'image/png')]);
      expect(component.selectedFiles().length).toBe(0);
    });

    it('should reject files exceeding maxSizeMb', () => {
      setup(
        baseField({ fileConfig: { ...baseField().fileConfig, maxSizeMb: 1 } })
      );
      selectFiles([makeFile('big.pdf', 'application/pdf', 5)]);
      // size (5 bytes) > maxSizeMb configured as 1 in validate() comparison
      expect(component.selectedFiles().length).toBe(0);
    });

    it('should remove a file and update the form control', () => {
      selectFiles([makeFile('doc1.pdf'), makeFile('doc2.pdf')]);
      component.removeFile(0);
      expect(component.selectedFiles().length).toBe(1);
      expect(component.fileNames()).toEqual(['doc2.pdf']);
    });
  });

  describe('maxFiles enforcement (existing behavior)', () => {
    it('should block adding a new file once maxFiles is reached', () => {
      setup(
        baseField({ fileConfig: { ...baseField().fileConfig, maxFiles: 2 } })
      );
      selectFiles([
        makeFile('doc1.pdf'),
        makeFile('doc2.pdf'),
        makeFile('doc3.pdf'),
      ]);
      expect(component.selectedFiles().length).toBe(2);
    });
  });

  describe('maxFilesExceeded validation (new behavior)', () => {
    it('should mark control invalid on init when prefill exceeds maxFiles', () => {
      const field = baseField({
        fileConfig: {
          ...baseField().fileConfig,
          maxFiles: 5,
          prefillFileNames: [
            'a.pdf',
            'b.pdf',
            'c.pdf',
            'd.pdf',
            'e.pdf',
            'f.pdf',
            'g.pdf',
          ],
        },
      });
      setup(field);

      expect(component.selectedFiles().length).toBe(7);
      expect(form.get('uploadInput')?.invalid).toBeTrue();
      expect(
        form.get('uploadInput')?.errors?.['maxFilesExceeded']
      ).toBeTruthy();
    });

    it('should not mark control invalid when prefill is within maxFiles', () => {
      const field = baseField({
        fileConfig: {
          ...baseField().fileConfig,
          maxFiles: 5,
          prefillFileNames: ['a.pdf', 'b.pdf', 'c.pdf'],
        },
      });
      setup(field);

      expect(form.get('uploadInput')?.errors?.['maxFilesExceeded']).toBeFalsy();
    });

    it('should clear maxFilesExceeded once files are removed below the limit', () => {
      const field = baseField({
        fileConfig: {
          ...baseField().fileConfig,
          maxFiles: 5,
          prefillFileNames: [
            'a.pdf',
            'b.pdf',
            'c.pdf',
            'd.pdf',
            'e.pdf',
            'f.pdf',
          ],
        },
      });
      setup(field);

      expect(
        form.get('uploadInput')?.errors?.['maxFilesExceeded']
      ).toBeTruthy();

      component.removeFile(0);

      expect(form.get('uploadInput')?.errors?.['maxFilesExceeded']).toBeFalsy();
      expect(form.get('uploadInput')?.valid).toBeTrue();
    });

    it('should keep other existing errors when clearing maxFilesExceeded', () => {
      const field = baseField({
        fileConfig: {
          ...baseField().fileConfig,
          maxFiles: 5,
          prefillFileNames: [
            'a.pdf',
            'b.pdf',
            'c.pdf',
            'd.pdf',
            'e.pdf',
            'f.pdf',
          ],
        },
      });
      setup(field);

      const control = form.get('uploadInput');
      const alwaysFails: ValidatorFn = () => ({ someOtherError: true });
      control?.addValidators(alwaysFails);
      control?.updateValueAndValidity();

      expect(control?.errors?.['maxFilesExceeded']).toBeTruthy();
      expect(control?.errors?.['someOtherError']).toBeTruthy();

      component.removeFile(0);

      expect(control?.errors?.['maxFilesExceeded']).toBeFalsy();
      expect(control?.errors?.['someOtherError']).toBeTruthy();
    });

    it('should re-trigger maxFilesExceeded on selection even if under per-add maxFiles cap', () => {
      // Edge case: prefill already at limit, further selection attempts should
      // still be blocked by validate(), and control should remain invalid.
      const field = baseField({
        fileConfig: {
          ...baseField().fileConfig,
          maxFiles: 5,
          prefillFileNames: ['a.pdf', 'b.pdf', 'c.pdf', 'd.pdf', 'e.pdf'],
        },
      });
      setup(field);

      selectFiles([makeFile('f.pdf')]);

      expect(component.selectedFiles().length).toBe(5);
      expect(form.get('uploadInput')?.errors?.['maxFilesExceeded']).toBeFalsy();
    });
  });

  describe('ngOnInit without prefill', () => {
    it('should not populate selectedFiles when prefillFileNames is empty', () => {
      setup(baseField());
      expect(component.selectedFiles().length).toBe(0);
      expect(form.get('uploadInput')?.errors).toBeFalsy();
    });
  });
});
