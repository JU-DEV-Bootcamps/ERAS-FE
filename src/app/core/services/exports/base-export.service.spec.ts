import { TestBed } from '@angular/core/testing';
import { Injectable } from '@angular/core';
import { BaseExportService } from './base-export.service';

@Injectable()
class DummyExportService extends BaseExportService {
  protected extension = 'csv';
}

describe('BaseExportService', () => {
  let service: DummyExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DummyExportService],
    });
    service = TestBed.inject(DummyExportService);
  });

  it('debería crearse el servicio', () => {
    expect(service).toBeTruthy();
  });

  it('debería ejecutar el flujo de descarga (downloadTextFile) correctamente', () => {
    const mockUrl = 'blob:mock-url-123';
    const createObjectUrlSpy = spyOn(
      window.URL,
      'createObjectURL'
    ).and.returnValue(mockUrl);
    const revokeObjectUrlSpy = spyOn(window.URL, 'revokeObjectURL');

    const mockAnchorElement = {
      href: '',
      download: '',
      click: jasmine.createSpy('click'),
    } as unknown as HTMLAnchorElement;

    const createElementSpy = spyOn(document, 'createElement').and.returnValue(
      mockAnchorElement
    );

    const textContent = 'Dato1,Dato2';
    const fileName = 'archivo-exportado';
    service.downloadTextFile(textContent, fileName);

    expect(createObjectUrlSpy).toHaveBeenCalledWith(jasmine.any(Blob));
    expect(createElementSpy).toHaveBeenCalledWith('a');
    expect(mockAnchorElement.href).toBe(mockUrl);
    expect(mockAnchorElement.download).toBe('archivo-exportado.csv');
    expect(mockAnchorElement.click).toHaveBeenCalled();
    expect(revokeObjectUrlSpy).toHaveBeenCalledWith(mockUrl);
  });
});
