import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureFlagsService } from '@core/components/feature-flags/feature-flags.service';
import { ERASPermissions } from '@core/services/permissions/permission.policies';
import { PermissionsService } from '@core/services/permissions/permissions.service';
import { ImportStudentsComponent } from '@modules/imports/components/import-students/import-students.component';
import { StudentsContainerComponent } from './students-container.component';
import { StudentsListComponent } from './students-list/students-list.component';

@Component({ selector: 'app-students-list', template: '' })
class StubStudentsListComponent {}

@Component({ selector: 'app-import-students', template: '' })
class StubImportStudentsComponent {}

describe('StudentsContainerComponent', () => {
  let fixture: ComponentFixture<StudentsContainerComponent>;
  let flags: jasmine.SpyObj<FeatureFlagsService>;
  let permissions: jasmine.SpyObj<PermissionsService>;

  const render = (listFlag: boolean, canManageStudents: boolean) => {
    flags.isEnabled.and.returnValue(listFlag);
    permissions.can.and.callFake(
      permission =>
        permission === ERASPermissions.CAN_MANAGE_STUDENTS && canManageStudents
    );
    fixture = TestBed.createComponent(StudentsContainerComponent);
    fixture.detectChanges();
    const html = fixture.nativeElement as HTMLElement;
    return {
      list: html.querySelector('app-students-list'),
      importer: html.querySelector('app-import-students'),
    };
  };

  beforeEach(() => {
    flags = jasmine.createSpyObj('FeatureFlagsService', ['isEnabled']);
    permissions = jasmine.createSpyObj('PermissionsService', ['can']);
    TestBed.configureTestingModule({
      imports: [StudentsContainerComponent],
      providers: [
        { provide: FeatureFlagsService, useValue: flags },
        { provide: PermissionsService, useValue: permissions },
      ],
    }).overrideComponent(StudentsContainerComponent, {
      remove: { imports: [ImportStudentsComponent, StudentsListComponent] },
      add: {
        imports: [StubImportStudentsComponent, StubStudentsListComponent],
      },
    });
  });

  it('shows the students list to an administrator or officer when the flag is on', () => {
    const { list, importer } = render(true, true);

    expect(list).not.toBeNull();
    expect(importer).toBeNull();
  });

  it('keeps the import screen for an administrator or officer when the flag is off', () => {
    const { list, importer } = render(false, true);

    expect(list).toBeNull();
    expect(importer).not.toBeNull();
  });

  it('shows the students list to a professional even when the flag is off', () => {
    const { list, importer } = render(false, false);

    expect(list).not.toBeNull();
    expect(importer).toBeNull();
  });
});
