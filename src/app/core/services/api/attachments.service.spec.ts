import { TestBed } from '@angular/core/testing';
import { AttachmentApiService } from './attachments.service';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

describe('AttachmentApiService', () => {
  let service: AttachmentApiService;
  let httpMock: HttpTestingController;

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

  describe('download', () => {
    it('should call get with download endpoint', () => {
      const getSpy = spyOn(service, 'get').and.stub();

      service.download(15);

      expect(getSpy).toHaveBeenCalledWith('15/download');
    });
  });

  describe('deleteAttachment', () => {
    it('should call delete with attachment id', () => {
      const deleteSpy = spyOn(service, 'delete').and.stub();

      service.deleteAttachment(15);

      expect(deleteSpy).toHaveBeenCalledWith('15');
    });
  });

  describe('createDraftSession', () => {
    it('should call post with drafts endpoint and undefined body', () => {
      const postSpy = spyOn(service, 'post').and.stub();

      service.createDraftSession();

      expect(postSpy).toHaveBeenCalledWith('drafts', undefined);
    });
  });
});
