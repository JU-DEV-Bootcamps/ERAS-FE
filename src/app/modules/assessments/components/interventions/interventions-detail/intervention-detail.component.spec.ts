import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
} from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { InterventionRowViewModel } from '../interventions-list/intervention-list.component';
import { InterventionDetailComponent } from './intervention-detail.component';
import { InterventionService } from '@core/services/api/intervention.service';

describe('InterventionDetailComponent', () => {
  let component: InterventionDetailComponent;
  let fixture: ComponentFixture<InterventionDetailComponent>;
  let mockInterventionService: jasmine.SpyObj<InterventionService>;

  const row: InterventionRowViewModel = {
    id: 1,
    commentPreview: '',
    studentDisplay: [
      { id: 1, name: 'John Doe', email: 'a@mail.com' },
      { id: 2, name: 'Jane Smith', email: 'b@mail.com' },
    ],
  } as unknown as InterventionRowViewModel;

  beforeEach(async () => {
    mockInterventionService = jasmine.createSpyObj('InterventionService', [
      'downloadAttachment',
    ]);

    await TestBed.configureTestingModule({
      imports: [InterventionDetailComponent],
      providers: [
        {
          provide: InterventionService,
          useValue: mockInterventionService,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InterventionDetailComponent);
    component = fixture.componentInstance;
    component.data = row;

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('displayStudents', () => {
    it('should display student names joined by comma when studentDisplay is an array', () => {
      expect(component.displayStudents()).toBe('John Doe, Jane Smith');
    });

    it('should return studentDisplay directly when it is a string (branch false)', () => {
      component.data = {
        ...row,
        studentDisplay: 'No student assigned',
      } as unknown as InterventionRowViewModel;

      expect(component.displayStudents()).toBe('No student assigned');
    });
  });

  describe('labels mapping', () => {
    it('should return mapped activity label', () => {
      const result = component['activityLabel']('Meeting');
      expect(result).toBeDefined();
    });

    it('should return mapped area label', () => {
      const result = component['areaLabel']('Academic');
      expect(result).toBeDefined();
    });
  });

  describe('onClose', () => {
    it('should emit close event', () => {
      spyOn(component.close, 'emit');
      component.onClose();
      expect(component.close.emit).toHaveBeenCalled();
    });
  });

  describe('isDownloading', () => {
    it('should return true if attachment is currently downloading', () => {
      component['downloadingAttachments'].add('test.pdf');
      expect(component.isDownloading('test.pdf')).toBeTrue();
    });

    it('should return false if attachment is not downloading', () => {
      expect(component.isDownloading('other.pdf')).toBeFalse();
    });
  });

  describe('openAttachment branches', () => {
    it('should return early if attachment is already downloading (branch true)', () => {
      component['downloadingAttachments'].add('test.pdf');
      component.openAttachment('test.pdf');

      expect(mockInterventionService.downloadAttachment).not.toHaveBeenCalled();
    });

    it('should open attachment in a new tab and revoke the URL after download', fakeAsync(() => {
      const blob = new Blob(['content'], { type: 'application/pdf' });
      mockInterventionService.downloadAttachment.and.returnValue(of(blob));

      const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue(
        'blob:fake-url'
      );
      const revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');
      const windowOpenSpy = spyOn(window, 'open');

      component.data = { ...row, id: 5 } as unknown as InterventionRowViewModel;
      component.openAttachment('uploads/docs/file.pdf');

      expect(mockInterventionService.downloadAttachment).toHaveBeenCalledWith(
        5,
        'file.pdf'
      );
      expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
      expect(windowOpenSpy).toHaveBeenCalledWith('blob:fake-url', '_blank');

      tick(10000);
      expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:fake-url');
      expect(component.isDownloading('uploads/docs/file.pdf')).toBeFalse();
    }));

    it('should extract filename correctly when path has no slashes (branch fallback)', fakeAsync(() => {
      const blob = new Blob(['content'], { type: 'application/pdf' });
      mockInterventionService.downloadAttachment.and.returnValue(of(blob));
      spyOn(URL, 'createObjectURL').and.returnValue('blob:fake-url');
      spyOn(URL, 'revokeObjectURL');
      spyOn(window, 'open');

      component.data = { ...row, id: 5 } as unknown as InterventionRowViewModel;
      component.openAttachment('file-no-slash.pdf');

      expect(mockInterventionService.downloadAttachment).toHaveBeenCalledWith(
        5,
        'file-no-slash.pdf'
      );
      tick(10000);
    }));

    it('should catch error, log it, and remove attachment from downloading set on failure', () => {
      spyOn(console, 'error');
      const downloadError = new Error('Download failed');
      mockInterventionService.downloadAttachment.and.returnValue(
        throwError(() => downloadError)
      );

      component.data = { ...row, id: 5 } as unknown as InterventionRowViewModel;
      component.openAttachment('error.pdf');

      expect(console.error).toHaveBeenCalledWith(downloadError);
      expect(component.isDownloading('error.pdf')).toBeFalse();
    });
  });

  describe('getFileName and getFileIcon', () => {
    it('should return file name from path', () => {
      expect(component.getFileName('uploads/docs/file.pdf')).toBe('file.pdf');
    });

    it('should return original string when path has no slash', () => {
      expect(component.getFileName('file.pdf')).toBe('file.pdf');
    });

    it('should return empty string when getting file name of an empty string (branch fallback)', () => {
      expect(component.getFileName('')).toBe('');
    });

    it('should return pdf icon', () => {
      expect(component.getFileIcon('test.pdf')).toBe('picture_as_pdf');
    });

    it('should return image icon for jpg', () => {
      expect(component.getFileIcon('image.jpg')).toBe('image');
    });

    it('should return image icon for jpeg', () => {
      expect(component.getFileIcon('image.jpeg')).toBe('image');
    });

    it('should return image icon for png', () => {
      expect(component.getFileIcon('image.png')).toBe('image');
    });

    it('should return default icon for other extensions like docx', () => {
      expect(component.getFileIcon('file.docx')).toBe('insert_drive_file');
    });

    it('should return default icon for files without extension (branch fallback)', () => {
      expect(component.getFileIcon('file-without-ext')).toBe(
        'insert_drive_file'
      );
    });
  });
});
