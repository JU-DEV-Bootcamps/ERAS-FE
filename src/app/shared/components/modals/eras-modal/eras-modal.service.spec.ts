import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { ErasModalService } from './eras-modal.service';
import { ErasModalComponent } from './eras-modal.component';

class FakeInnerComponent {}

describe('ErasModalService', () => {
  let service: ErasModalService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [
        ErasModalService,
        { provide: MatDialog, useValue: dialogSpy },
      ],
    });

    service = TestBed.inject(ErasModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open the ErasModalComponent with the given config and default overrides', () => {
    const fakeDialogRef = {} as MatDialogRef<ErasModalComponent>;
    dialogSpy.open.and.returnValue(fakeDialogRef);

    const result = service.openComponent({
      component: FakeInnerComponent,
      data: { id: 42 },
    });

    expect(dialogSpy.open).toHaveBeenCalledWith(ErasModalComponent, {
      data: {
        component: FakeInnerComponent,
        data: { id: 42 },
        actions: [],
        closeButton: true,
        title: 'Eras Modal',
      },
      panelClass: 'eras-modal-component',
    });
    expect(result).toBe(fakeDialogRef);
  });

  it('should pass through custom actions, title, and closeButton when provided', () => {
    const fakeDialogRef = {} as MatDialogRef<ErasModalComponent>;
    dialogSpy.open.and.returnValue(fakeDialogRef);

    service.openComponent({
      component: FakeInnerComponent,
      actions: [{ label: 'Delete', value: 'delete' }],
      title: 'Delete Intervention',
      closeButton: false,
    });

    expect(dialogSpy.open).toHaveBeenCalledWith(ErasModalComponent, {
      data: {
        component: FakeInnerComponent,
        data: undefined,
        actions: [{ label: 'Delete', value: 'delete' }],
        closeButton: false,
        title: 'Delete Intervention',
      },
      panelClass: 'eras-modal-component',
    });
  });
});
