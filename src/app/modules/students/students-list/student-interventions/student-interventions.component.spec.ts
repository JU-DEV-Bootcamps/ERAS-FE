import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { ERASRoles, Profile } from '@core/models/profile.model';
import { StudentInterventionModel } from '@core/models/student-intervention.model';
import { UserDataService } from '@core/services/access/user-data.service';
import { StudentInterventionService } from '@core/services/api/student-intervention.service';
import { ToastNotificationService } from '@core/services/toast-notification.service';
import { ModalDeleteConfirmationService } from '@shared/components/modals/modal-delete-confirmation/modal-delete-confirmation.service';
import { StudentInterventionFormModalComponent } from './student-intervention-form-modal/student-intervention-form-modal.component';
import { StudentInterventionsComponent } from './student-interventions.component';

const entry = (
  overrides: Partial<StudentInterventionModel> = {}
): StudentInterventionModel => ({
  id: 5,
  studentId: 1,
  kind: 'RiskIdentified',
  type: 'Academic',
  description: 'Failed two midterms',
  entryDate: '2026-10-20',
  createdBy: 'ana-sub',
  createdByName: 'Ana Pérez',
  createdAt: '2026-10-20T09:00:00Z',
  ...overrides,
});

describe('StudentInterventionsComponent', () => {
  let fixture: ComponentFixture<StudentInterventionsComponent>;
  let service: jasmine.SpyObj<StudentInterventionService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let deleteConfirmation: jasmine.SpyObj<ModalDeleteConfirmationService>;
  let toast: jasmine.SpyObj<ToastNotificationService>;
  let user: ReturnType<typeof signal<Profile | null>>;

  const html = () => fixture.nativeElement as HTMLElement;
  const text = () => html().textContent ?? '';
  const byTestId = (id: string) =>
    Array.from(html().querySelectorAll<HTMLElement>(`[data-testid="${id}"]`));

  const create = (entries: StudentInterventionModel[], profile: Profile) => {
    user.set(profile);
    service.getByStudent.and.returnValue(of(entries));
    fixture = TestBed.createComponent(StudentInterventionsComponent);
    fixture.componentRef.setInput('studentId', 1);
    fixture.detectChanges();
  };

  beforeEach(() => {
    service = jasmine.createSpyObj('StudentInterventionService', [
      'getByStudent',
      'remove',
    ]);
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    deleteConfirmation = jasmine.createSpyObj(
      'ModalDeleteConfirmationService',
      ['confirmDelete']
    );
    toast = jasmine.createSpyObj('ToastNotificationService', ['showToast']);
    user = signal<Profile | null>(null);

    TestBed.configureTestingModule({
      imports: [StudentInterventionsComponent],
      providers: [
        provideNoopAnimations(),
        { provide: StudentInterventionService, useValue: service },
        { provide: MatDialog, useValue: dialog },
        {
          provide: ModalDeleteConfirmationService,
          useValue: deleteConfirmation,
        },
        { provide: ToastNotificationService, useValue: toast },
        { provide: UserDataService, useValue: { user } },
      ],
    });
  });

  it('[643-add-student-interventions/AC-1] adds a risk and lists it immediately', () => {
    // GIVEN an ERAS Professional with the student open and no entries yet
    create([], { id: 'ana-sub', role: ERASRoles.PROFESSIONAL });
    const saved = entry({ id: 10, description: 'Failed two midterms' });
    dialog.open.and.returnValue({ afterClosed: () => of(saved) } as never);

    // WHEN they add a risk and save
    byTestId('add-risk')[0].click();
    fixture.detectChanges();

    // THEN the dialog was opened for a risk of this student and the Risks list shows it without reloading
    expect(dialog.open).toHaveBeenCalledWith(
      StudentInterventionFormModalComponent,
      jasmine.objectContaining({
        data: { studentId: 1, kind: 'RiskIdentified' },
      })
    );
    expect(byTestId('risk-entry').length).toBe(1);
    expect(text()).toContain('Failed two midterms');
    expect(service.getByStudent).toHaveBeenCalledTimes(1);
  });

  it('[643-add-student-interventions/AC-10] edits an own entry and shows the new description', () => {
    // GIVEN an entry created by the ERAS Professional "Ana Pérez"
    create([entry()], { id: 'ana-sub', role: ERASRoles.PROFESSIONAL });
    const updated = entry({ description: 'Failed three midterms' });
    dialog.open.and.returnValue({ afterClosed: () => of(updated) } as never);

    // WHEN "Ana Pérez" edits it and saves
    byTestId('edit-entry')[0].click();
    fixture.detectChanges();

    // THEN the entry shows the new description immediately
    expect(dialog.open).toHaveBeenCalledWith(
      StudentInterventionFormModalComponent,
      jasmine.objectContaining({
        data: { studentId: 1, kind: 'RiskIdentified', entry: entry() },
      })
    );
    expect(text()).toContain('Failed three midterms');
    expect(text()).not.toContain('Failed two midterms');
  });

  it('[643-add-student-interventions/AC-12] deletes an own entry after confirming', () => {
    // GIVEN an entry created by the ERAS Professional "Ana Pérez"
    create([entry()], { id: 'ana-sub', role: ERASRoles.PROFESSIONAL });
    deleteConfirmation.confirmDelete.and.returnValue({
      afterClosed: () => of(true),
    } as never);
    service.remove.and.returnValue(of(undefined));

    // WHEN "Ana Pérez" chooses Delete and confirms
    byTestId('delete-entry')[0].click();
    fixture.detectChanges();

    // THEN the entry is deleted and disappears from the list
    expect(deleteConfirmation.confirmDelete).toHaveBeenCalledTimes(1);
    expect(service.remove).toHaveBeenCalledOnceWith(1, 5);
    expect(byTestId('risk-entry').length).toBe(0);
  });

  it('[643-add-student-interventions/AC-13] keeps the entry when the confirmation is cancelled', () => {
    // GIVEN an ERAS Professional looking at the confirmation to delete one of their entries
    create([entry()], { id: 'ana-sub', role: ERASRoles.PROFESSIONAL });
    deleteConfirmation.confirmDelete.and.returnValue({
      afterClosed: () => of(false),
    } as never);

    // WHEN they cancel
    byTestId('delete-entry')[0].click();
    fixture.detectChanges();

    // THEN the entry is still listed and no delete request is sent
    expect(service.remove).not.toHaveBeenCalled();
    expect(byTestId('risk-entry').length).toBe(1);
  });

  it('[643-add-student-interventions/AC-20] lists the entries without actions for an Officer', () => {
    // GIVEN an ERAS Student Services Officer opening the record of a student with entries
    create([entry()], { id: 'officer-sub', role: ERASRoles.OFFICER });

    // WHEN the Interventions section is shown
    // THEN the entries are listed and there is no add, edit or delete action
    expect(byTestId('risk-entry').length).toBe(1);
    expect(byTestId('add-risk').length).toBe(0);
    expect(byTestId('add-support').length).toBe(0);
    expect(byTestId('edit-entry').length).toBe(0);
    expect(byTestId('delete-entry').length).toBe(0);
  });

  it('[643-add-student-interventions/AC-29] shows add, edit and delete to an Administrator', () => {
    // GIVEN an ERAS Administrator opening the record of a student with an entry created by "Ana Pérez"
    create([entry()], { id: 'admin-sub', role: ERASRoles.ADMIN });
    deleteConfirmation.confirmDelete.and.returnValue({
      afterClosed: () => of(false),
    } as never);

    // WHEN the Interventions section is shown
    // THEN there is an add action and the entry has edit and delete actions
    expect(byTestId('add-risk').length).toBe(1);
    expect(byTestId('add-support').length).toBe(1);
    expect(byTestId('edit-entry').length).toBe(1);
    expect(byTestId('delete-entry').length).toBe(1);

    // AND deleting asks for confirmation
    byTestId('delete-entry')[0].click();
    expect(deleteConfirmation.confirmDelete).toHaveBeenCalledTimes(1);
  });

  it('does not offer edit or delete on an entry of another professional', () => {
    create([entry({ createdBy: 'luis-sub' })], {
      id: 'ana-sub',
      role: ERASRoles.PROFESSIONAL,
    });

    expect(byTestId('add-risk').length).toBe(1);
    expect(byTestId('edit-entry').length).toBe(0);
    expect(byTestId('delete-entry').length).toBe(0);
  });

  it('shows a support entry in the Support list and a risk in the Risks list', () => {
    create(
      [
        entry(),
        entry({
          id: 6,
          kind: 'SupportReceived',
          type: 'Tutoring',
          description: 'Weekly math tutoring',
        }),
      ],
      { id: 'ana-sub', role: ERASRoles.PROFESSIONAL }
    );

    expect(byTestId('risk-entry').length).toBe(1);
    expect(byTestId('support-entry').length).toBe(1);
  });
});
