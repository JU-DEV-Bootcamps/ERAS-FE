import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { UserManualsComponent } from './user-manuals.component';
import { UserManualsApiService } from '@core/services/api/user-manuals.service';
import { UserManualModel } from '@core/models/user-manual.model';
import { USER_MANUALS_MESSAGES } from '@core/constants/messages';

const ADMIN_GUIDE: UserManualModel = {
  id: 'admin-guide',
  title: 'Admin Guide',
  language: 'es',
  version: '2.1',
  fileName: 'admin-guide.odt',
  fileFormat: 'ODT',
};

const STUDENT_GUIDE: UserManualModel = {
  id: 'student-guide',
  title: 'Student Guide',
  language: 'en',
  version: '1.0',
  fileName: 'student-guide.pdf',
  fileFormat: 'PDF',
};

describe('UserManualsComponent', () => {
  let fixture: ComponentFixture<UserManualsComponent>;
  let api: jasmine.SpyObj<UserManualsApiService>;

  const render = (manuals: UserManualModel[]) => {
    api.list.and.returnValue(of(manuals));
    fixture = TestBed.createComponent(UserManualsComponent);
    fixture.detectChanges();
  };

  const text = (): string => fixture.nativeElement.textContent as string;

  const clickDownload = (title: string) => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector(
      `button[aria-label="Download ${title}"]`
    );
    button.click();
  };

  const stubBrowserDownload = () => {
    const clicked: HTMLAnchorElement[] = [];
    spyOn(URL, 'createObjectURL').and.returnValue('blob:manual');
    spyOn(URL, 'revokeObjectURL');
    spyOn(HTMLAnchorElement.prototype, 'click').and.callFake(function (
      this: HTMLAnchorElement
    ) {
      clicked.push(this);
    });
    return clicked;
  };

  beforeEach(async () => {
    api = jasmine.createSpyObj<UserManualsApiService>('UserManualsApiService', [
      'list',
      'download',
    ]);
    await TestBed.configureTestingModule({
      imports: [UserManualsComponent],
      providers: [{ provide: UserManualsApiService, useValue: api }],
    }).compileComponents();
  });

  it('[640-add-user-manuals-page/AC-4] shows title, language, version and format of each manual in the order received', () => {
    render([ADMIN_GUIDE, STUDENT_GUIDE]);

    const items: HTMLElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.manual-item')
    );

    expect(items.length).toBe(2);
    expect(items[0].textContent).toContain('Admin Guide');
    expect(items[0].textContent).toContain('es');
    expect(items[0].textContent).toContain('2.1');
    expect(items[0].textContent).toContain('ODT');
    expect(items[1].textContent).toContain('Student Guide');
    expect(items[1].textContent).toContain('en');
    expect(items[1].textContent).toContain('1.0');
    expect(items[1].textContent).toContain('PDF');
  });

  it('[640-add-user-manuals-page/AC-5] shows the empty state when there are no manuals', () => {
    render([]);

    expect(text()).toContain(USER_MANUALS_MESSAGES.EMPTY);
    expect(fixture.nativeElement.querySelectorAll('.manual-item').length).toBe(
      0
    );
  });

  it('[640-add-user-manuals-page/AC-13] shows an error message when the list fails', () => {
    api.list.and.returnValue(throwError(() => new Error('boom')));
    fixture = TestBed.createComponent(UserManualsComponent);
    fixture.detectChanges();

    expect(text()).toContain(USER_MANUALS_MESSAGES.LOAD_ERROR);
    expect(text()).not.toContain(USER_MANUALS_MESSAGES.EMPTY);
    expect(fixture.nativeElement.querySelectorAll('.manual-item').length).toBe(
      0
    );
  });

  it('[640-add-user-manuals-page/AC-6] downloads the PDF manual under the file name declared for it', () => {
    const clicked = stubBrowserDownload();
    api.download.and.returnValue(of(new Blob(['pdf'])));
    render([ADMIN_GUIDE, STUDENT_GUIDE]);

    clickDownload('Student Guide');

    expect(api.download).toHaveBeenCalledOnceWith('student-guide');
    expect(clicked.length).toBe(1);
    expect(clicked[0].download).toBe('student-guide.pdf');
  });

  it('[640-add-user-manuals-page/AC-7] downloads the .odt manual under the file name declared for it', () => {
    const clicked = stubBrowserDownload();
    api.download.and.returnValue(of(new Blob(['odt'])));
    render([ADMIN_GUIDE, STUDENT_GUIDE]);

    clickDownload('Admin Guide');

    expect(api.download).toHaveBeenCalledOnceWith('admin-guide');
    expect(clicked.length).toBe(1);
    expect(clicked[0].download).toBe('admin-guide.odt');
  });
});
