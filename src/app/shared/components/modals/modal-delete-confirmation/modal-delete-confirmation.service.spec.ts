import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalDeleteConfirmationService } from './modal-delete-confirmation.service';
import { ModalDeleteConfirmationComponent } from './modal-delete-confirmation.component';
import { DeleteModalData } from './modal-delete-confirmation.interface';

describe('ModalDeleteConfirmationService', () => {
  let service: ModalDeleteConfirmationService;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let dialogRefSpy: jasmine.SpyObj<
    MatDialogRef<ModalDeleteConfirmationComponent>
  >;

  const mockConfig: DeleteModalData = {
    title: 'Delete item',
    message: 'Are you sure you want to delete this item?',
  } as DeleteModalData;

  beforeEach(() => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    dialogSpy.open.and.returnValue(dialogRefSpy);

    TestBed.configureTestingModule({
      providers: [{ provide: MatDialog, useValue: dialogSpy }],
    });

    service = TestBed.inject(ModalDeleteConfirmationService);
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('confirmDelete', () => {
    it('should open the dialog with ModalDeleteConfirmationComponent and the given config as data', () => {
      service.confirmDelete(mockConfig);

      expect(dialogSpy.open).toHaveBeenCalledWith(
        ModalDeleteConfirmationComponent,
        {
          data: mockConfig,
          autoFocus: false,
          width: '418px',
          panelClass: 'delete-confirmation-modal',
        }
      );
    });

    it('should return the MatDialogRef from dialog.open', () => {
      const result = service.confirmDelete(mockConfig);
      expect(result).toBe(dialogRefSpy);
    });
  });
});
