import { InterventionRowViewModel } from '@core/models/assessment.model';
import { InterventionDetailComponent } from './intervention-detail.component';
import { InterventionService } from '@core/services/api/intervention.service';
import { ComponentFixture, TestBed } from '@angular/core/testing';

describe('InterventionDetailComponent', () => {
  let component: InterventionDetailComponent;
  let fixture: ComponentFixture<InterventionDetailComponent>;
  let mockInterventionService: jasmine.SpyObj<InterventionService>;

  const row: InterventionRowViewModel = {
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
});
