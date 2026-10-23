import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ElementRef } from '@angular/core';

import {
  AssessmentStudentDataComponent,
  StudentProfileData,
} from './assessment-student-data.component';

describe('AssessmentStudentDataComponent', () => {
  let component: AssessmentStudentDataComponent;
  let fixture: ComponentFixture<AssessmentStudentDataComponent>;

  const students: StudentProfileData[] = [
    { id: 1, name: 'Ana', email: 'ana@mail.com' },
    { id: 2, name: 'Beto', email: 'beto@mail.com' },
    { id: 3, name: 'Caro', email: 'caro@mail.com' },
  ];

  const mockBadgeRef = (
    rect: Partial<DOMRect> = {},
    contains = false
  ): ElementRef =>
    ({
      nativeElement: {
        getBoundingClientRect: () => ({
          left: 10,
          top: 10,
          bottom: 30,
          right: 50,
          width: 40,
          height: 20,
          ...rect,
        }),
        contains: () => contains,
      },
    }) as ElementRef;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentStudentDataComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AssessmentStudentDataComponent);
    component = fixture.componentInstance;
    component.studentData = students;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('ngOnChanges', () => {
    it('should join the first N student names using numberOfStudent', () => {
      component.numberOfStudent = 2;

      component.ngOnChanges();

      expect(component.studentNames).toBe('Ana, Beto');
    });

    it('should default to a single student name', () => {
      component.ngOnChanges();

      expect(component.studentNames).toBe('Ana');
    });
  });

  describe('template rendering', () => {
    it('should show the overflow badge when there are more students than numberOfStudent', () => {
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector(
        '.badge-number-student'
      );
      expect(badge).toBeTruthy();
      expect(badge.textContent).toContain('+2');
    });

    it('should not show the overflow badge when all students fit', () => {
      component.studentData = [students[0]];
      fixture.detectChanges();

      const badge = fixture.nativeElement.querySelector(
        '.badge-number-student'
      );
      expect(badge).toBeFalsy();
    });
  });

  describe('openPopover', () => {
    it('should show the popover and position it below when there is room', () => {
      component.badgeRef = mockBadgeRef({ bottom: 30 });
      spyOnProperty(window, 'innerHeight').and.returnValue(800);

      component.openPopover();

      expect(component.show).toBeTrue();
      expect(component.popoverStyle['top']).toBe('36px');
      expect(component.popoverStyle['bottom']).toBeUndefined();
    });

    it('should position the popover above when there is not enough room below', () => {
      component.badgeRef = mockBadgeRef({ bottom: 780, top: 760 });
      spyOnProperty(window, 'innerHeight').and.returnValue(800);

      component.openPopover();

      expect(component.show).toBeTrue();
      expect(component.popoverStyle['bottom']).toBeTruthy();
      expect(component.popoverStyle['top']).toBeUndefined();
    });
  });

  describe('closePopover', () => {
    it('should hide the popover when not pinned', () => {
      component.show = true;
      component.pinned = false;

      component.closePopover();

      expect(component.show).toBeFalse();
    });

    it('should keep the popover open when pinned', () => {
      component.show = true;
      component.pinned = true;

      component.closePopover();

      expect(component.show).toBeTrue();
    });
  });

  describe('togglePin', () => {
    it('should pin the popover open', () => {
      component.pinned = false;
      component.show = true;

      component.togglePin();

      expect(component.pinned).toBeTrue();
      expect(component.show).toBeTrue();
    });

    it('should unpin and hide the popover', () => {
      component.pinned = true;
      component.show = true;

      component.togglePin();

      expect(component.pinned).toBeFalse();
      expect(component.show).toBeFalse();
    });
  });

  describe('onDocumentClick', () => {
    it('should unpin and hide when the click happens outside the badge', () => {
      component.badgeRef = mockBadgeRef({}, false);
      component.show = true;
      component.pinned = true;

      component.onDocumentClick(new MouseEvent('click'));

      expect(component.show).toBeFalse();
      expect(component.pinned).toBeFalse();
    });

    it('should leave state untouched when the click happens inside the badge', () => {
      component.badgeRef = mockBadgeRef({}, true);
      component.show = true;
      component.pinned = true;

      component.onDocumentClick(new MouseEvent('click'));

      expect(component.show).toBeTrue();
      expect(component.pinned).toBeTrue();
    });
  });
});
