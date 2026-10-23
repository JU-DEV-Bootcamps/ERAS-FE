import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { Injectable } from '@angular/core';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { BaseApiService } from './base-api.service';
import { environment } from '../../../../environments/environment';

@Injectable()
class DummyApiService extends BaseApiService {
  protected resource = 'dummy-resource';
}

describe('BaseApiService', () => {
  let service: DummyApiService;
  let httpMock: HttpTestingController;

  const baseUrl = `${environment.apiUrl}/api/v1/dummy-resource`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [DummyApiService],
    });
    service = TestBed.inject(DummyApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create the service', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('should make a GET request to the correct URL without params', () => {
      const mockResponse = { id: 1, name: 'test' };

      service.get<{ id: number; name: string }>(1).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('GET');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(mockResponse);
    });

    it('should make a GET request to the correct URL with params', () => {
      const mockResponse = [{ id: 1 }];
      const params = new HttpParams().set('active', 'true');

      service.get<{ id: number }[]>('search', params).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/search` && r.params.get('active') === 'true'
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse);
    });
  });

  describe('post', () => {
    it('should make a POST request to the correct URL with body and without headers', () => {
      const body = { name: 'nuevo' };
      const mockResponse = { id: 1, name: 'nuevo' };

      service.post<typeof body, typeof mockResponse>(1, body).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(body);
      req.flush(mockResponse);
    });

    it('should make a POST request to the correct URL with headers', () => {
      const body = { name: 'nuevo' };
      const headers = new HttpHeaders().set('X-Custom', 'value');

      service.post<typeof body>(1, body, headers).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.headers.get('X-Custom')).toBe('value');
      req.flush({});
    });
  });

  describe('postForm', () => {
    it('should make a POST request with FormData', () => {
      const formData = new FormData();
      formData.append('file', 'contenido');
      const mockResponse = { success: true };

      service
        .postForm<typeof mockResponse>('upload', formData)
        .subscribe(res => {
          expect(res).toEqual(mockResponse);
        });

      const req = httpMock.expectOne(`${baseUrl}/upload`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toBe(formData);
      req.flush(mockResponse);
    });
  });

  describe('put', () => {
    it('should make a PUT request to the correct URL with body and without headers', () => {
      const body = { name: 'actualizado' };
      const mockResponse = { id: 1, name: 'actualizado' };

      service.put<typeof body, typeof mockResponse>(1, body).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(body);
      req.flush(mockResponse);
    });

    it('should make a PUT request to the correct URL with headers', () => {
      const body = { name: 'actualizado' };
      const headers = new HttpHeaders().set('X-Custom', 'value');

      service.put<typeof body>(1, body, headers).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.headers.get('X-Custom')).toBe('value');
      req.flush({});
    });
  });

  describe('delete', () => {
    it('should make a DELETE request to the correct URL without params', () => {
      service.delete<void>(1).subscribe();

      const req = httpMock.expectOne(`${baseUrl}/1`);
      expect(req.request.method).toBe('DELETE');
      expect(req.request.params.keys().length).toBe(0);
      req.flush(null);
    });

    it('should make a DELETE request to the correct URL with params', () => {
      const params = new HttpParams().set('force', 'true');

      service.delete<void>(1, params).subscribe();

      const req = httpMock.expectOne(
        r => r.url === `${baseUrl}/1` && r.params.get('force') === 'true'
      );
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  describe('arrayAsStringParams', () => {
    it('should return the single element when the array has only one value (number[])', () => {
      const result = service.arrayAsStringParams([5]);
      expect(result).toBe(5);
    });

    it('should return the single element when the array has only one value (string[])', () => {
      const result = service.arrayAsStringParams(['a']);
      expect(result).toBe('a');
    });

    it('should join the elements with commas when there are multiple values (number[])', () => {
      const result = service.arrayAsStringParams([1, 2, 3]);
      expect(result).toBe('1,2,3');
    });

    it('should join the elements with commas when there are multiple values (string[])', () => {
      const result = service.arrayAsStringParams(['a', 'b', 'c']);
      expect(result).toBe('a,b,c');
    });
  });
});
