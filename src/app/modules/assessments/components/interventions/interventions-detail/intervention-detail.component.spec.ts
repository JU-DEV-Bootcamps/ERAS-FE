import { InterventionRowViewModel } from '@core/models/assessment.model';
import { InterventionDetailComponent } from './intervention-detail.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { AttachmentApiService } from '@core/services/api/attachments.service';
import { InterventionService } from '@core/services/api/intervention.service';

describe('InterventionDetailComponent', () => {
  let component: InterventionDetailComponent;
  let fixture: ComponentFixture<InterventionDetailComponent>;
  let mockAttachmentService: jasmine.SpyObj<AttachmentApiService>;

  const row: InterventionRowViewModel = {
    commentPreview: '',
    studentDisplay: [
      { id: 1, name: 'John Doe', email: 'a@mail.com' },
      { id: 2, name: 'Jane Smith', email: 'b@mail.com' },
    ],
  } as unknown as InterventionRowViewModel;

  beforeEach(async () => {
    mockAttachmentService = jasmine.createSpyObj('AttachmentApiService', [
      'downloadAttachment',
    ]);

    await TestBed.configureTestingModule({
      imports: [InterventionDetailComponent],
      providers: [
        {
          provide: AttachmentApiService,
          useValue: mockAttachmentService,
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

  it('should display student names when studentDisplay is an array', () => {
    expect(component.displayStudents()).toBe('John Doe, Jane Smith');
  });

  it('should return studentDisplay when it is a string', () => {
    component.data = {
      ...row,
      studentDisplay: 'No student assigned',
    };
    expect(component.displayStudents()).toBe('No student assigned');
  });

  it('should emit close event', () => {
    spyOn(component.close, 'emit');
    component.onClose();
    expect(component.close.emit).toHaveBeenCalled();
  });

  it('should return file name from path', () => {
    expect(component.getFileName('uploads/docs/file.pdf')).toBe('file.pdf');
  });

  it('should return original string when path has no slash', () => {
    expect(component.getFileName('file.pdf')).toBe('file.pdf');
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

  it('should return default icon for other files', () => {
    expect(component.getFileIcon('file.docx')).toBe('insert_drive_file');
  });

  it('should open attachment in a new tab and revoke the URL after download', fakeAsync(() => {
    const blob = new Blob(['content'], { type: 'application/pdf' });
    mockAttachmentService.downloadAttachment.and.returnValue(of(blob));

    const createObjectURLSpy = spyOn(URL, 'createObjectURL').and.returnValue(
      'blob:fake-url'
    );
    const revokeObjectURLSpy = spyOn(URL, 'revokeObjectURL');
    const windowOpenSpy = spyOn(window, 'open');

    component.data = { ...row, id: 5 } as InterventionRowViewModel;
    component.openAttachment(5);

    expect(mockAttachmentService.downloadAttachment).toHaveBeenCalledWith(5);
    expect(createObjectURLSpy).toHaveBeenCalledWith(blob);
    expect(windowOpenSpy).toHaveBeenCalledWith('blob:fake-url', '_blank');

    tick(10000);
    expect(revokeObjectURLSpy).toHaveBeenCalledWith('blob:fake-url');
  }));
});

describe('InterventionDetailComponent activity history', () => {
  it('should show the activity history using the assessment id given by the list', async () => {
    const interventionService = jasmine.createSpyObj<InterventionService>(
      'InterventionService',
      ['getActivity']
    );
    interventionService.getActivity.and.returnValue(of([]));
    await TestBed.configureTestingModule({
      imports: [InterventionDetailComponent],
      providers: [
        { provide: InterventionService, useValue: interventionService },
        {
          provide: AttachmentApiService,
          useValue: jasmine.createSpyObj('AttachmentApiService', [
            'downloadAttachment',
          ]),
        },
      ],
    }).compileComponents();

    // The BE does not return the assessment id with an intervention, so the row has none.
    const row = {
      id: 5,
      commentPreview: '',
      studentDisplay: 'No student assigned',
    } as unknown as InterventionRowViewModel;
    const fixture = TestBed.createComponent(InterventionDetailComponent);
    fixture.componentRef.setInput('data', row);
    fixture.componentRef.setInput('assessmentId', 1);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Activity history');
    expect(interventionService.getActivity).toHaveBeenCalledWith(1, 5);
  });
});
