import { TestBed } from '@angular/core/testing';
import { AttachmentApiService } from './attachments.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { environment } from 'src/environments/environment';

describe('AttachmentApiService', () => {
  let service: AttachmentApiService;
  let httpMock: HttpTestingController;
  const baseUrl = `${environment.apiUrl}/api/v1/attachments`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AttachmentApiService],
    });
    service = TestBed.inject(AttachmentApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('upload', () => {
    it('should call post with formData and query params', () => {
      const file = new File(['content'], 'test.pdf', {
        type: 'application/pdf',
      });

      const postSpy = spyOn(service, 'post').and.stub();

      service.upload('Assessment', 123, [file]);

      expect(postSpy).toHaveBeenCalled();

      const [endpoint, formData] = postSpy.calls.mostRecent().args;

      expect(endpoint).toBe('?EntityType=Assessment&EntityId=123');

      expect(formData instanceof FormData).toBeTrue();
    });

    it('should append all files to formData', () => {
      const file1 = new File(['content1'], 'file1.pdf');
      const file2 = new File(['content2'], 'file2.pdf');

      const postSpy = spyOn(service, 'post').and.stub();

      service.upload('Assessment', 123, [file1, file2]);

      const [, formData] = postSpy.calls.mostRecent().args;

      const files = formData.getAll('Files');

      expect(files.length).toBe(2);
      expect(files[0]).toEqual(file1);
      expect(files[1]).toEqual(file2);
    });
  });

  describe('list', () => {
    it('should call get with correct params', () => {
      const getSpy = spyOn(service, 'get').and.stub();

      service.list('Assessment', 123);

      expect(getSpy).toHaveBeenCalled();

      const [endpoint, params] = getSpy.calls.mostRecent().args;

      expect(endpoint).toBe('');

      expect(params.get('EntityType')).toBe('Assessment');
      expect(params.get('EntityId')).toBe('123');
    });
  });

  describe('downloadAttachment', () => {
    it('should make a GET request with responseType blob to the correct URL', () => {
      const mockBlob = new Blob(['file content'], { type: 'application/pdf' });

      service.downloadAttachment(5).subscribe(res => {
        expect(res).toEqual(mockBlob);
      });

      const req = httpMock.expectOne(`${baseUrl}/5/download`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  describe('createDraftSession', () => {
    it('should call post with drafts endpoint and undefined body', () => {
      const postSpy = spyOn(service, 'post').and.stub();

      service.createDraftSession();

      expect(postSpy).toHaveBeenCalledWith('drafts', undefined);
    });
  });

  describe('deleteAttachment', () => {
    it('should call delete endpoint', () => {
      const deleteSpy = spyOn(service, 'delete').and.stub();

      service.deleteAttachment(1);

      expect(deleteSpy).toHaveBeenCalledWith('1');
    });
  });
});
