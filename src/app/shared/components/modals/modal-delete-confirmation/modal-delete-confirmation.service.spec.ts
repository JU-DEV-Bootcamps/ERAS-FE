import { TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalDeleteConfirmationService } from './modal-delete-confirmation.service';
import { ModalDeleteConfirmationComponent } from './modal-delete-confirmation.component';
import { DeleteModalData } from './modal-delete-confirmation.interface';

describe('ModalDeleteConfirmationService', () => {
  let service: ModalDeleteConfirmationService;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;

  beforeEach(() => {
    matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);

    TestBed.configureTestingModule({
      providers: [
        ModalDeleteConfirmationService,
        { provide: MatDialog, useValue: matDialogSpy },
      ],
    });

    service = TestBed.inject(ModalDeleteConfirmationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('confirmDelete', () => {
    it('should open the dialog with the correct component, configuration, and return the MatDialogRef', () => {
      const mockConfig: DeleteModalData = {
        title: 'Delete Item',
      } as unknown as DeleteModalData;

      const mockDialogRef =
        {} as MatDialogRef<ModalDeleteConfirmationComponent>;
      matDialogSpy.open.and.returnValue(mockDialogRef);

      const result = service.confirmDelete(mockConfig);

      expect(matDialogSpy.open).toHaveBeenCalledWith(
        ModalDeleteConfirmationComponent,
        {
          data: mockConfig,
          autoFocus: false,
          width: '418px',
          panelClass: 'delete-confirmation-modal',
        }
      );

      expect(result).toBe(mockDialogRef);
    });
  });
});
